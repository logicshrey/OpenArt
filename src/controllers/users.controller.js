import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js"  

const cookieOptions = {
   httpOnly: true,
   secure: true
}

const generateAccessAndRefreshTokens = async(userId) => {
      try {
         const user = await User.findById(userId)

         if(!user){
           throw new ApiError(400,"User does not found!") 
         }

         const accessToken = await user.generateAccessToken()

         if(!accessToken){
            throw new ApiError(500,"Something went wrong while generating Access Token!")
         }

         const refreshToken = await user.generateRefreshToken()

         if(!refreshToken){
            throw new ApiError(500,"Something went wrong while generating Refresh Token!")
         }

         user.refreshToken = refreshToken
         user.save({validateBeforeSave:false})

         return { accessToken,refreshToken }

      } catch (error) {
         console.log("Error: ",error);
         throw error   
      }
}

const register = asyncHandler( async (req,res) => {

    const { fullName,email,country,accountType,artField,username,bio,password,contentChoice } = req.body

    if([fullName,email,country,accountType,artField,username,bio,password].some((ele)=>{
        return ele?.trim()===""
    })){
       throw new ApiError(400,"Required fields are missing!") 
    }
    
    if(contentChoice.length === 0){
       throw new ApiError(400,"Content Choice is Empty!") 
    }

    const avatarLocalPath = req.files?.avatar?(req.files.avatar[0]?.path):null

    if(!avatarLocalPath){
       throw new ApiError(400,"Avatar is required!") 
    }

    const coverImageLocalPath = req.files?.coverImage?(req.files.coverImage[0]?.path):null
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(500,"Something went wrong while uploading avatar on cloudinary!")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    const user = await User.create({
        fullName,
        email,
        country,
        accountType,
        artField,
        username,
        bio,
        avatar: avatar.url,
        coverImage: coverImage?coverImage.url:null,
        password,
        contentChoice
    })

    const createdUser = await User.findById(user?._id).select("-password -refreshToken")

    if(!createdUser){
       throw new ApiError(500,"Something went wrong while registering new user! Please Try Again.") 
    }

    res
    .statusCode(201)
    .json(new ApiResponse(200,createdUser,"User Register Successfully!"))
    
})

const login = asyncHandler( async (req,res) => {

    const { username,password } = req.body

    if(!username){
       throw new ApiError(400,"Username is required!") 
    }

    if(!password){
       throw new ApiError(400,"Password is required!") 
    }

    const user = await User.findOne({username})

    if(!user){
       throw new ApiError(404,"User does not exists") 
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
       throw new ApiError(401,"Invalid User Credentials!") 
    }

   const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)
   
   const updatedUser = await User.findById(user._id).select("-password")

   res
   .statusCode(200)
   .cookie("accessToken",accessToken,cookieOptions)
   .cookie("refreshToken",refreshToken,cookieOptions)
   .json(new ApiResponse(200,updatedUser,"User Logged In Successfully!"))

} )

const logout = asyncHandler( async(req,res) => {

   const user = await User.findByIdAndUpdate(req.user._id,{
      $unset:{refreshToken:1}
   },{
      new:true
   })
   
   if(!user){
      throw new ApiError(500,"Something went wrong while logging out the user!")
   }

   res
   .statusCode(200)
   .clearCookie("accessToken",cookieOptions)
   .clearCookie("refreshToken",cookieOptions)
   .json(new ApiResponse(200,{},"User Logged Out Successfully!"))

})


export { 
   register,
   login,
   logout 
}
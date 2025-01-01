import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import jwt from "jsonwebtoken"


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
    .status(201)
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
   .status(200)
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
   .status(200)
   .clearCookie("accessToken",cookieOptions)
   .clearCookie("refreshToken",cookieOptions)
   .json(new ApiResponse(200,{},"User Logged Out Successfully!"))

})

const updateUserDetails = asyncHandler( async(req,res) => {

   const { fullName,email,country,bio } = req.body

   if([fullName,email,country,bio].some((ele)=>{
      return ele?.trim()===""   
   })){
      throw new ApiError(400,"Required fields are missing!")
   }
   
   const user = await User.findByIdAndUpdate(req.user?._id,{
      $set:{
         fullName,
         email,
         country,
         bio
      }
   },{
      new:true
   }).select("-password -refreshToken")

   if(!user){
      throw new ApiError(500,"Something went wrong while updating user details!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,user,"User details updated successfully!"))

} )

const updateAvatar = asyncHandler( async(req,res) => {

   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar is required!")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar){
      throw new ApiError(500,"Something went wrong while uploading avatar on cloudinary!")
   }
   
   const user = await User.findById(req.user?._id).select("-password -refreshToken")

   if(!user){
      throw new ApiError(500,"Something went wrong while updating avatar!")
   }

   await destroyOnCloudinary(user.avatar)

   user.avatar = avatar.url
   user.save({validateBeforeSave:false})
   
   res
   .status(200)
   .json(new ApiResponse(200,{},"Avatar updated successfully!"))

} )

const updateCoverImage = asyncHandler( async(req,res) => {

   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
      throw new ApiError(400,"Cover Image is required!")
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage){
      throw new ApiError(500,"Something went wrong while uploading coverimage on cloudinary!")
   }
   
   const user = await User.findById(req.user?._id).select("-password -refreshToken")

   if(!user){
      throw new ApiError(500,"Something went wrong while updating coverimage!")
   }

   await destroyOnCloudinary(user.coverImage)

   user.coverImage = coverImage.url
   user.save({validateBeforeSave:false})
   
   res
   .status(200)
   .json(new ApiResponse(200,{},"coverImage updated successfully!"))

} )

const changePassword = asyncHandler( async(req,res) => {
   
   const { oldPassword,newPassword } = req.body

   if(!(oldPassword || newPassword)){
      throw new ApiError(400,"Required fields are missing!")
   }
   
   const user = await User.findById(req.user?._id)

   if(!user){
      throw new ApiError(500,"Something went wrong while changing password!")
   }

   const isPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordValid){
      throw new ApiError(401,"Incorrect password!")
   }
   
   user.password = newPassword
   user.save({validateBeforeSave:false})

   res
   .status(200)
   .json(new ApiResponse(200,{},"Password Changed Successfully!"))

} )

const changeAccountType = asyncHandler( async(req,res) => {

   const { accountType,artField } = req.body

   if(!(accountType || artField)){
      throw new ApiError(400,"Required fields are missing!")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,{
      $set:{
         accountType,
         artField
      }
   },{
      new:true
   }).select("-password -refreshToken")

   if(!user){
      throw new ApiError(500,"Something went wrong while changing account type!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,user,"Account type changed successfully!"))

} )

const updateContentChoice = asyncHandler( async(req,res) => {

   const {newContentChoice} = req.body

   if(!newContentChoice){
      throw new ApiError(400,"Content Choice is Required!")
   }

   if(newContentChoice.length === 0){
      throw new ApiError(400,"Content Choice is Empty!")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,{
      $set:{
         contentChoice: newContentChoice
      }
   },{
      new:true
   }).select("-password -refreshToken")
   
   if(!user){
      throw new ApiError(500,"Something went wrong while updating content choice!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,user,"Content Choice updated successfully!"))
   
} ) 

const refreshAccessToken = asyncHandler( async(req,res) => {

   const incomingRefreshToken = req.cookies?.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(400,"Refresh token not found!")
   }

   const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
   
   const user = await User.findById(decodedToken?._id)

   if(!user){
      throw new ApiError(404,"User not found, Invalid Refresh Token!")
   }

   if(incomingRefreshToken!=user.refreshToken){
      throw new ApiError(401,"Invalid Refresh Token!")
   }

   const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

   res
   .status(200)
   .cookie("accessToken",accessToken,cookieOptions)
   .cookie("refreshToken",refreshToken,cookieOptions)
   .json(new ApiResponse(200,{},"Access Token Refreshed Successfully!"))

} )

const deleteAccount = asyncHandler( async(req,res) => {

   const user = await User.findByIdAndDelete(req.user?._id).select("-password -refreshToken")

   if(!user){
      throw new ApiError(500,"Something went wrong while deleting the user account!")
   }

   res
   .status(200)
   .clearCookie("accessToken",cookieOptions)
   .clearCookie("refreshToken",cookieOptions)
   .json(new ApiResponse(200,user,"User account deleted successfully!")) 
} )

const getAccountDetails = asyncHandler( async(req,res) => {
   
   const userAccount = await User.aggregate([

      {
         $match: {
            _id: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup:{
            from:"follows",
            localField:"_id",
            foreignField:"artist",
            as:"followers"
         }
      },
      {
         $lookup:{
            from:"follows",
            localField:"_id",
            foreignField:"follower",
            as:"following"
         }
      },
      {
         $addFields:{
            followersCount:{
               $size: "$followers"
            },
            followingCount:{
               $size: "$following"
            }
         }
      },
      {
         $lookup:{
            from:"artworks",
            localField:"_id",
            foreignField:"owner",
            as:"createdArtworks"
         }
      },
     {
        $lookup:{
         from:"artblogs",
         localField:"_id",
         foreignField:"owner",
         as:"createdArtblogs"
        }
     },
     {
        $lookup:{
         from:"announcements",
         localField:"_id",
         foreignField:"owner",
         as:"createdAnnouncements"
        }
     },
     {
      $project:{
         _id:1,
         fullName:1,
         email:1,
         country:1,
         accountType:1,
         artField:1,
         username:1,
         bio:1,
         avatar:1,
         coverImage:1,
         contentChoice:1,
         followersCount:1,
         followingCount:1,
         createdArtworks:1,
         createdArtblogs:1,
         createdAnnouncements:1
      }
     }
   ])

   if(!userAccount){
      throw new ApiError(500,"Something went wrong while fetching user details!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,userAccount[0],"User details fetched successfully!"))
} )

const getSavedArtworks = asyncHandler( async(req,res) => {

   const savedArtworks = await User.aggregate([
      {
         $match:{
            _id: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup:{
            from:"savedartworks",
            localField:"_id",
            foreignField:"owner",
            as:"savedArtworks",

            pipeline:[
               {
                  $lookup:{
                     from:"artworks",
                     localField:"artwork",
                     foreignField:"_id",
                     as:"artwork"
                  }
               },
               {
                  $addFields:{
                     artwork:{
                        $first: "$artwork"
                     }
                  }
               },
               {
                  $project:{
                     artwork:1   
                  }
               }
            ]
         } 
      },
      {
         $project:{
            savedArtworks:1
         }
      }
   ])

   if(!savedArtworks){
      throw new ApiError(500,"Something went wrong while fetching saved artworks!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,savedArtworks[0],"savedArtworks fetched successfully!"))

} )

const getSavedArtblogs = asyncHandler( async(req,res) => {

   const savedArtblogs = await User.aggregate([
      {
         $match:{
            _id: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup:{
            from:"savedartblogs",
            localField:"_id",
            foreignField:"owner",
            as:"savedArtblogs",

            pipeline:[
               {
                  $lookup:{
                     from:"artblogs",
                     localField:"artblog",
                     foreignField:"_id",
                     as:"artblog"
                  }
               },
               {
                  $addFields:{
                     artblog:{
                        $first: "$artblog"
                     }
                  }
               },
               {
                  $project:{
                     artblog:1   
                  }
               }
            ]
         } 
      },
      {
         $project:{
            savedArtblogs:1
         }
      }
   ])

   if(!savedArtblogs){
      throw new ApiError(500,"Something went wrong while fetching saved artblogs!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,savedArtblogs[0],"savedArtblogs fetched successfully!"))

} )

const getSavedAnnouncements = asyncHandler( async(req,res) => {

   const savedAnnouncements = await User.aggregate([
      {
         $match:{
            _id: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup:{
            from:"savedannouncements",
            localField:"_id",
            foreignField:"owner",
            as:"savedAnnouncements",

            pipeline:[
               {
                  $lookup:{
                     from:"announcements",
                     localField:"announcement",
                     foreignField:"_id",
                     as:"announcement"
                  }
               },
               {
                  $addFields:{
                     announcement:{
                        $first: "$announcement"
                     }
                  }
               },
               {
                  $project:{
                     announcement:1   
                  }
               }
            ]
         } 
      },
      {
         $project:{
            savedAnnouncements:1
         }
      }
   ])

   if(!savedAnnouncements){
      throw new ApiError(500,"Something went wrong while fetching saved announcements!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,savedAnnouncements[0],"savedAnnouncements fetched successfully!"))

} )

export { 
   register,
   login,
   logout,
   updateUserDetails,
   updateAvatar,
   updateCoverImage,
   changePassword,
   changeAccountType,
   updateContentChoice,
   refreshAccessToken,
   deleteAccount,
   getAccountDetails,
   getSavedArtworks,
   getSavedArtblogs,
   getSavedAnnouncements 
}
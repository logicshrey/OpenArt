import { Artblog } from "../models/artblogs.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"


const createArtblog = asyncHandler( async(req,res) => {

    const { title,content,category } = req.body

    if([title,content,category].some((ele)=>{
       return ele?.trim===""  
    })){
       throw new ApiError(400,"Required fields are missing!")
    }

    const artblog = await Artblog.create({
        title,
        content,
        category,
        owner: req.user?._id
    })

    if(!artblog){
        throw new ApiError(500,"Something went wrong while creating new artblog!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,artblog,"New Artblog Created Successfully!"))
} )

const editArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params
    
    if(!artblogId){
        throw new ApiError(400,"Artblog Id is missing!")
    }

    const { title,content,category } = req.body

    if([title,content,category].some((ele)=>{
        return ele?.trim===""  
     })){
        throw new ApiError(400,"Required fields are missing!")
     }
    
     const artblog = await Artblog.findByIdAndUpdate(artblogId,{
        $set:{
            title,
            content,
            category
        }
     },
     {
        new:true
     })

     if(!artblog){
        throw new ApiError(404,"Artblog Not Found!")
     }
     
     res
     .json(new ApiResponse(200,artblog,"Artblog Edited Successfully!"))
} )

const deleteArtblog = asyncHandler( async(req,res) => {
    
    const {artblogId} = req.params
    
    if(!artblogId){
        throw new ApiError(400,"Artblog Id is missing!")
    }

    const artblog = await Artblog.findByIdAndDelete(artblogId)

    if(!artblog){
        throw new ApiError(500,"Something went wrong while deleting artblog!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,artblog,"Artblog deleted successfully!"))
} )

const getArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params

    // const {userId} = req.user?._id
    
    if(!artblogId){
        throw new ApiError(400,"Artblog Id is missing!")
    }

    const artblogDetails = await Artblog.aggregate([

        {
            $match: {
                _id: new mongoose.Types.ObjectId(artblogId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"artblog",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"artblog",
                as:"comments"
            }
        },
        {
            $lookup:{
                from:"savedartblogs",
                localField: `${req.user?._id}`,
                foreignField:"owner",
                as:"savedArtblogs"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",

                pipeline:[
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
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size: "$likes"
                },
                commentsCount:{
                    $size: "$comments"
                },
                isSaved:{
                    $cond:{
                        if: { $in: [artblogId,"$savedArtblogs"] },
                        then: true,
                        else: false
                    }
                },
                owner:{
                    $first: "$owner"
                }
            }
        },
        {
            $project:{
                _id:1,
                contentFile:1,
                title:1,
                description:1,
                category:1,
                createdAt:1,
                updatedAt:1,
                owner:1,
                likesCount:1,
                commentsCount:1,
                isSaved:1
            }
        }

    ])

    if(!artblogDetails[0]){
        throw new ApiError(500,"Something went wrong while fetching artblog details!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,artblogDetails[0],"Artblog details fetched successfully!"))
} )


const getArtblogsByContentChoice = asyncHandler ( async(req,res) =>  {

    const artblogs = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"artblogs",
                localField:"contentChoice",
                foreignField:"category",
                as:"artblogs",

                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner"
                        }
                    },
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"artblog",
                            as:"likes"
                        }
                    },
                    {
                        $lookup:{
                            from:"comments",
                            localField:"_id",
                            foreignField:"artblog",
                            as:"comments"
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            },
                            likesCount:{
                                $size:"$likes"
                            },
                            commentsCount:{
                                $size:"$comments"
                            }
                        }
                    }
                ]
            }
        },
        {
            $project:{
                artblogs:1
            }
        }
           
    ])
     
    if(!artblogs[0]){
        throw new ApiError(500,"Something went wrong while fetching the artblogs!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,artblogs[0],"Artblogs fetched successfully!"))

} )

export { 
    createArtblog, 
    editArtblog,
    deleteArtblog,
    getArtblog,
    getArtblogsByContentChoice
}


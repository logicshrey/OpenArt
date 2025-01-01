import { Artwork } from "../models/artworks.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";


const createArtwork = asyncHandler( async(req,res) => {

    const { title,description,category } = req.body

    if([title,description,category].some((ele)=>{
       ele?.trim===""  
    })){
       throw new ApiError(400,"Required fields are missing!")
    }

    const contentFileLocalPath = req.file?.path

    if(!contentFileLocalPath){
        throw new ApiError(400,"Content File is required!")
    }

    const contentFile = await uploadOnCloudinary(contentFileLocalPath)

    if(!contentFile){
       throw new ApiError(500,"Something went wrong while uploading content file on cloudinary!")
    }

    const artwork = await Artwork.create({
        title,
        description,
        category,
        contentFile: contentFile.url,
        owner: req.user?._id
    })

    if(!artwork){
        throw new ApiError(500,"Something went wrong while creating new artwork!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,artwork,"New Artwork Created Successfully!"))
} )

const editArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params
    
    if(!artworkId){
        throw new ApiError(400,"Artwork Id is missing!")
    }

    const { title,description,category } = req.body

    if([title,description,category].some((ele)=>{
        ele?.trim===""  
     })){
        throw new ApiError(400,"Required fields are missing!")
     }
    
     const artwork = await Artwork.findByIdAndUpdate(artworkId,{
        $set:{
            title,
            description,
            category
        }
     },
     {
        new:true
     })

     if(!artwork){
        throw new ApiError(404,"Artwork Not Found!")
     }
     
     res
     .json(new ApiResponse(200,artwork,"Artwork Edited Successfully!"))
} )

const deleteArtwork = asyncHandler( async(req,res) => {
    
    const {artworkId} = req.params
    
    if(!artworkId){
        throw new ApiError(400,"Artwork Id is missing!")
    }

    const artwork = await Artwork.findByIdAndDelete(artworkId)

    if(!artwork){
        throw new ApiError(500,"Something went wrong while deleting artwork!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,artwork,"Artwork deleted successfully!"))
} )

const getArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params

    // const {userId} = req.user?._id
    
    if(!artworkId){
        throw new ApiError(400,"Artwork Id is missing!")
    }

    const artworkDetails = await Artwork.aggregate([

        {
            $match: {
                _id: new mongoose.Types.ObjectId(artworkId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"artwork",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"artwork",
                as:"comments"
            }
        },
        {
            $lookup:{
                from:"savedartworks",
                localField: `${req.user?._id}`,
                foreignField:"owner",
                as:"savedArtworks"
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
                        if: { $in: [artworkId,"$savedArtworks"] },
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

    if(!artworkDetails){
        throw new ApiError(500,"Something went wrong while fetching artwork details!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,artworkDetails[0],"Artwork details fetched successfully!"))
} )

export { 
    createArtwork, 
    editArtwork,
    deleteArtwork,
    getArtwork
}


import { Artwork } from "../models/artworks.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"


const createArtwork = asyncHandler( async(req, res, next) => {

    const { title, description, category } = req.body

    if([title, description, category].some((ele) => {
       return ele?.trim() === ""  
    })){
       return next(new ApiError(400, "Required fields are missing!"))
    }

    const contentFileLocalPath = req.file?.path

    if(!contentFileLocalPath){
        return next(new ApiError(400, "Content File is required!"))
    }

    const contentFile = await uploadOnCloudinary(contentFileLocalPath)

    if(!contentFile){
       return next(new ApiError(500, "Something went wrong while uploading content file on cloudinary!"))
    }

    const artwork = await Artwork.create({
        title,
        description,
        category,
        contentFile: contentFile.url,
        owner: req.user?._id
    })

    if(!artwork){
        return next(new ApiError(500, "Something went wrong while creating new artwork!"))
    }

    res
    .status(201)
    .json(new ApiResponse(201, artwork, "New Artwork Created Successfully!"))
} )

const editArtwork = asyncHandler( async(req, res, next) => {

    const {artworkId} = req.params
    
    if(!artworkId){
        return next(new ApiError(400, "Artwork Id is missing!"))
    }

    const { title, description, category } = req.body

    if([title, description, category].some((ele) => {
        return ele?.trim() === ""  
     })){
        return next(new ApiError(400, "Required fields are missing!"))
     }
    
     const artwork = await Artwork.findByIdAndUpdate(artworkId, {
        $set: {
            title,
            description,
            category
        }
     },
     {
        new: true
     })

     if(!artwork){
        return next(new ApiError(404, "Artwork Not Found!"))
     }
     
     res
     .status(200)
     .json(new ApiResponse(200, artwork, "Artwork Edited Successfully!"))
} )

const deleteArtwork = asyncHandler( async(req, res, next) => {
    
    const {artworkId} = req.params
    
    if(!artworkId){
        return next(new ApiError(400, "Artwork Id is missing!"))
    }

    const artwork = await Artwork.findByIdAndDelete(artworkId)

    if(!artwork){
        return next(new ApiError(500, "Something went wrong while deleting artwork!"))
    }

    await destroyOnCloudinary(artwork.contentFile)

    res
    .status(200)
    .json(new ApiResponse(200, artwork, "Artwork deleted successfully!"))
} )

const getArtwork = asyncHandler( async(req, res, next) => {

    const {artworkId} = req.params

    const userId = new mongoose.Types.ObjectId(req.user?._id)
    
    if(!artworkId){
        return next(new ApiError(400, "Artwork Id is missing!"))
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
                owner:{
                    $first: "$owner"
                },
                isLiked:{
                    $cond:{
                        if: { $in: [req.user._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
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
                isLiked:1
            }
        }

    ])

    if(!artworkDetails[0]){
        return next(new ApiError(500, "Something went wrong while fetching artwork details!"))
    }

    const artwork = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"savedartworks",
                localField:"_id",
                foreignField:"owner",
                as:"savedartworks"
            }
        },
        {
            $addFields:{
                isSaved:{
                    $cond:{
                        if: { $in: [new mongoose.Types.ObjectId(artworkId), "$savedartworks.artwork"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                isSaved:1
            }
        }
    ])
    

    artworkDetails[0].isSaved = artwork[0].isSaved
    
    res
    .status(200)
    .json(new ApiResponse(200, artworkDetails[0], "Artwork details fetched successfully!"))
} )


const getArtworksByContentChoice = asyncHandler ( async(req, res, next) =>  {

    const artworks = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"artworks",
                localField:"contentChoice",
                foreignField:"category",
                as:"artworks",

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
                artworks:1
            }
        }
           
    ])
     
    if(!artworks[0]){
        return next(new ApiError(500, "Something went wrong while fetching the artworks!"))
    }

    res
    .status(200)
    .json(new ApiResponse(200, artworks[0], "Artworks fetched successfully!"))

} )

export { 
    createArtwork, 
    editArtwork,
    deleteArtwork,
    getArtwork,
    getArtworksByContentChoice
}
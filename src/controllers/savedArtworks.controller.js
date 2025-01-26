import { Artwork } from "../models/artworks.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"
import { savedArtwork } from "../models/savedArtworks.model.js"


const saveArtwork = asyncHandler( async(req, res, next) => {

    const {artworkId} = req.params
    
    if(!artworkId){
        return next(new ApiError(400, "Artwork Id is missing!"))
    }

    const isArtwork = await Artwork.findById(artworkId)

    if(!isArtwork){
        return next(new ApiError(404, "Cannot save artwork, Artwork does not exist!"))
    }

    const artwork = await savedArtwork.create({
        artwork: artworkId,
        owner: req.user?._id
    })  

    if(!artwork){
        return next(new ApiError(500, "Something went wrong while saving artwork!"))
    }

    res
    .status(201)
    .json(new ApiResponse(201, artwork, "Artwork saved successfully!"))
} )


const unsaveArtwork = asyncHandler( async(req, res, next) => {

    const {artworkId} = req.params
    
    if(!artworkId){
        return next(new ApiError(400, "Artwork Id is missing!"))
    }

    const isArtwork = await Artwork.findById(artworkId)

    if(!isArtwork){
        return next(new ApiError(404, "Cannot unsave artwork, Artwork does not exist!"))
    }

    const artwork = await savedArtwork.deleteOne({
        artwork: artworkId,
        owner: req.user?._id
    })

    if(artwork.deletedCount === 0){
        return next(new ApiError(500, "Something went wrong while unsaving artwork!"))
    }

    res
    .status(200)
    .json(new ApiResponse(200, artwork, "Artwork unsaved successfully!"))

} )


const getSavedArtworks = asyncHandler( async(req, res, next) => {

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

    if(!savedArtworks[0]){
        return next(new ApiError(500, "Something went wrong while fetching saved artworks!"))
    }

    res
    .status(200)
    .json(new ApiResponse(200, savedArtworks[0], "Saved artworks fetched successfully!"))

} ) 

export {
    saveArtwork,
    unsaveArtwork,
    getSavedArtworks
}
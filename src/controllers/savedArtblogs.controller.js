import { Artblog } from "../models/artblogs.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"
import { savedArtblog } from "../models/savedArtblogs.model.js"


const saveArtblog = asyncHandler( async(req, res, next) => {

    const {artblogId} = req.params
    
    if(!artblogId){
        return next(new ApiError(400, "Artblog Id is missing!"))
    }

    const isArtblog = await Artblog.findById(artblogId)

    if(!isArtblog){
        return next(new ApiError(404, "Cannot save artblog, Artblog does not exist!"))
    }

    const artblog = await savedArtblog.create({
        artblog: artblogId,
        owner: req.user?._id
    })  

    if(!artblog){
        return next(new ApiError(500, "Something went wrong while saving artblog!"))
    }

    res
    .status(201)
    .json(new ApiResponse(201, artblog, "Artblog saved successfully!"))
} )


const unsaveArtblog = asyncHandler( async(req, res, next) => {

    const {artblogId} = req.params
    
    if(!artblogId){
        return next(new ApiError(400, "Artblog Id is missing!"))
    }

    const isArtblog = await Artblog.findById(artblogId)

    if(!isArtblog){
        return next(new ApiError(404, "Cannot unsave artblog, Artblog does not exist!"))
    }

    const artblog = await savedArtblog.deleteOne({
        artblog: artblogId,
        owner: req.user?._id
    })

    if(artblog.deletedCount === 0){
        return next(new ApiError(500, "Something went wrong while unsaving artblog!"))
    }

    res
    .status(200)
    .json(new ApiResponse(200, artblog, "Artblog unsaved successfully!"))

} )


export {
    saveArtblog,
    unsaveArtblog
}
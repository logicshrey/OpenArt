import { Announcement } from "../models/announcements.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"
import { savedAnnouncement } from "../models/savedAnnouncements.model.js"


const saveAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params
    
    if(!announcementId){
        throw new ApiError(400,"Announcement Id is missing!")
    }

    const isAnnouncement = await Announcement.findById(announcementId)

    if(!isAnnouncement){
        throw new ApiError(404,"Cannot save announcement, Announcement does not exist!")
    }

    const announcement = await savedAnnouncement.create({
        announcement: announcementId,
        owner: req.user?._id
    })  

    if(!announcement){
        throw new ApiError(500,"Something went wrong while saving announcement!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,announcement,"Announcement saved successfully!"))
} )


const unsaveAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params
    
    if(!announcementId){
        throw new ApiError(400,"Announcement Id is missing!")
    }

    const isAnnouncement = await Announcement.findById(announcementId)

    if(!isAnnouncement){
        throw new ApiError(404,"Cannot unsave announcement, Announcement does not exist!")
    }

    const announcement = await savedAnnouncement.deleteOne({
        announcement: announcementId,
        owner: req.user?._id
    })

    if(announcement.deletedCount === 0){
        throw new ApiError(500,"Something went wrong while unsaving announcement!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,announcement,"Announcement unsaved successfully!"))

} )



export{
    saveAnnouncement,
    unsaveAnnouncement
}
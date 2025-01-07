import { Announcement } from "../models/announcements.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"


const createAnnouncement = asyncHandler( async(req,res) => {

    const { title,description,category } = req.body

    if([title,description,category].some((ele)=>{
       return ele?.trim===""  
    })){
       throw new ApiError(400,"Required fields are missing!")
    }

    const contentImageLocalPath = req.file?.path
    
    const contentImage = await uploadOnCloudinary(contentImageLocalPath)

    const announcement = await Announcement.create({
        title,
        description,
        category,
        owner: req.user?._id,
        image: contentImage?contentImage.url:null
    })

    if(!announcement){
        throw new ApiError(500,"Something went wrong while creating new announcement!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,announcement,"New Announcement Created Successfully!"))
} )

const editAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params
    
    if(!announcementId){
        throw new ApiError(400,"Announcement Id is missing!")
    }

    const { title,description,category } = req.body

    if([title,description,category].some((ele)=>{
        return ele?.trim===""  
     })){
        throw new ApiError(400,"Required fields are missing!")
     }
     
     const contentImageLocalPath = req.file?.path

     const contentImage = await uploadOnCloudinary(contentImageLocalPath)
     
     const tempAnnouncement = await Announcement.findById(announcementId)

     await destroyOnCloudinary(tempAnnouncement.image)

     const announcement = await Announcement.findByIdAndUpdate(announcementId,{
        $set:{
            title,
            description,
            category,
            image: contentImage?contentImage.url:null
        }
     },
     {
        new:true
     })

     if(!announcement){
        throw new ApiError(404,"Announcement Not Found!")
     }
     
     res
     .json(new ApiResponse(200,announcement,"Announcement Edited Successfully!"))
} )

const deleteAnnouncement = asyncHandler( async(req,res) => {
    
    const {announcementId} = req.params
    
    if(!announcementId){
        throw new ApiError(400,"Announcement Id is missing!")
    }

    const announcement = await Announcement.findByIdAndDelete(announcementId)

    if(!announcement){
        throw new ApiError(500,"Something went wrong while deleting announcement!")
    }
    
    // console.log(announcement.image);
    
    if((announcement.image) != null){
        await destroyOnCloudinary(announcement.image)
    } 

    res
    .status(200)
    .json(new ApiResponse(200,announcement,"Announcement deleted successfully!"))
} )

const getAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params

    // const {userId} = req.user?._id
    
    if(!announcementId){
        throw new ApiError(400,"Announcement Id is missing!")
    }

    const announcementDetails = await Announcement.aggregate([

        {
            $match: {
                _id: new mongoose.Types.ObjectId(announcementId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"announcement",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"announcement",
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
                }
                owner:{
                    $first: "$owner"
                },
                isLiked:{
                    $cond:{
                        if: { $in: [req.user._id,"$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                image:1,
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

    if(!announcementDetails[0]){
        throw new ApiError(500,"Something went wrong while fetching announcement details!")
    }
    
    const announcement = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"savedannouncements",
                localField:"_id",
                foreignField:"owner",
                as:"savedannouncements"
            }
        },
        {
            $addFields:{
                isSaved:{
                    $cond:{
                        if: { $in: [new mongoose.Types.ObjectId(announcementId),"$savedannouncements.announcement"] },
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
    

    announcementDetails[0].isSaved = announcement[0].isSaved

    res
    .status(200)
    .json(new ApiResponse(200,announcementDetails[0],"Announcement details fetched successfully!"))
} )


const getAnnouncementsByContentChoice = asyncHandler ( async(req,res) =>  {

    const announcements = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"announcements",
                localField:"contentChoice",
                foreignField:"category",
                as:"announcements",

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
                            foreignField:"announcement",
                            as:"likes"
                        }
                    },
                    {
                        $lookup:{
                            from:"comments",
                            localField:"_id",
                            foreignField:"announcement",
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
                announcements:1
            }
        }
           
    ])
     
    if(!announcements[0]){
        throw new ApiError(500,"Something went wrong while fetching the announcements!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,announcements[0],"Announcements fetched successfully!"))

} )

export { 
    createAnnouncement, 
    editAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
    getAnnouncementsByContentChoice
}


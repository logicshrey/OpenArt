import { Artwork } from "../models/artworks.model.js"
import { Artblog } from "../models/artblogs.model.js"
import { Announcement } from "../models/announcements.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"
import { Like } from "../models/likes.model.js"


// Artwork Likes

const addLikeToArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params

    if(!artworkId){
        throw new ApiError(400,"artworkId is required!")
    }

    const isArtwork = await Artwork.findById(artworkId)

    if(!isArtwork){
        throw new ApiError(404,"Cannot add like, Artwork does not exist!")
    }

    const like = await Like.create({
        artwork: artworkId,
        likedBy: req.user?._id
    })

    if(!like){
        throw new ApiError(500,"Something went wrong while liking an artwork!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,like,"Like added successfully!"))
} )

const getLikesOfArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params

    if(!artworkId){
        throw new ApiError(400,"artworkId is required!")
    }
    
    const likes = await Artwork.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(artworkId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"artwork",
                as:"likes",

                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"likedBy",
                            foreignField:"_id",
                            as:"likedBy",

                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        email:1,
                                        country:1,
                                        accountType:1,
                                        artField:1,
                                        username:1,
                                        bio:1,
                                        avatar:1,
                                        coverImage:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            likedBy:{
                                $first:"$likedBy"
                            }
                        }
                    },
                    {
                        $project:{
                            likedBy:1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                likes:1
            }
        }

    ])

    if(!likes[0]){
        throw new ApiError(500,"Something went wrong while fetching artwork likes!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,likes[0],"Likes fetched successfully!"))
} )

const unlikeArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params

    if(!artworkId){
        throw new ApiError(400,"artworkId is required!")
    }

    const removedLiked = await Like.deleteOne({
        artwork: artworkId,
        likedBy: req.user?._id
    })

    if(removedLiked.deletedCount === 0){
        throw new ApiError(500,"Something went wrong while unliking the artwork!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,removedLiked,"Artwork unliked successfully!"))

} )


// Artblog Likes

const addLikeToArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params

    if(!artblogId){
        throw new ApiError(400,"artblogId is required!")
    }

    const isArtblog = await Artblog.findById(artblogId)

    if(!isArtblog){
        throw new ApiError(404,"Cannot add like, Artblog does not exist!")
    }

    const like = await Like.create({
        artblog: artblogId,
        likedBy: req.user?._id
    })

    if(!like){
        throw new ApiError(500,"Something went wrong while liking an artblog!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,like,"Like added successfully!"))
} )

const getLikesOfArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params

    if(!artblogId){
        throw new ApiError(400,"artblogId is required!")
    }
    
    const likes = await Artblog.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(artblogId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"artblog",
                as:"likes",

                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"likedBy",
                            foreignField:"_id",
                            as:"likedBy",

                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        email:1,
                                        country:1,
                                        accountType:1,
                                        artField:1,
                                        username:1,
                                        bio:1,
                                        avatar:1,
                                        coverImage:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            likedBy:{
                                $first:"$likedBy"
                            }
                        }
                    },
                    {
                        $project:{
                            likedBy:1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                likes:1
            }
        }

    ])

    if(!likes[0]){
        throw new ApiError(500,"Something went wrong while fetching artblog likes!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,likes[0],"Likes fetched successfully!"))
} )

const unlikeArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params

    if(!artblogId){
        throw new ApiError(400,"artblogId is required!")
    }

    const removedLiked = await Like.deleteOne({
        artblog: artblogId,
        likedBy: req.user?._id
    })

    if(removedLiked.deletedCount === 0){
        throw new ApiError(500,"Something went wrong while unliking the artblog!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,removedLiked,"Artblog unliked successfully!"))

} )


// Announcement Likes

const addLikeToAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params

    if(!announcementId){
        throw new ApiError(400,"announcementId is required!")
    }

    const isAnnouncement = await Announcement.findById(announcementId)

    if(!isAnnouncement){
        throw new ApiError(404,"Cannot add like, Announcement does not exist!")
    }

    const like = await Like.create({
        announcement: announcementId,
        likedBy: req.user?._id
    })

    if(!like){
        throw new ApiError(500,"Something went wrong while liking an announcement!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,like,"Like added successfully!"))
} )

const getLikesOfAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params

    if(!announcementId){
        throw new ApiError(400,"announcementId is required!")
    }
    
    const likes = await Announcement.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(announcementId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"announcement",
                as:"likes",

                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"likedBy",
                            foreignField:"_id",
                            as:"likedBy",

                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        email:1,
                                        country:1,
                                        accountType:1,
                                        artField:1,
                                        username:1,
                                        bio:1,
                                        avatar:1,
                                        coverImage:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            likedBy:{
                                $first:"$likedBy"
                            }
                        }
                    },
                    {
                        $project:{
                            likedBy:1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                likes:1
            }
        }

    ])

    if(!likes[0]){
        throw new ApiError(500,"Something went wrong while fetching announcement likes!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,likes[0],"Likes fetched successfully!"))
} )

const unlikeAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params

    if(!announcementId){
        throw new ApiError(400,"announcementId is required!")
    }

    const removedLiked = await Like.deleteOne({
        announcement: announcementId,
        likedBy: req.user?._id
    })

    if(removedLiked.deletedCount === 0){
        throw new ApiError(500,"Something went wrong while unliking the announcement!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,removedLiked,"Announcement unliked successfully!"))

} )

export{
    addLikeToArtwork,
    getLikesOfArtwork,
    unlikeArtwork,
    addLikeToArtblog,
    getLikesOfArtblog,
    unlikeArtblog,
    addLikeToAnnouncement,
    getLikesOfAnnouncement,
    unlikeAnnouncement
}
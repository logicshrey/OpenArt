import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import mongoose from "mongoose";
import { Artwork } from "../models/artworks.model.js";
import { Comment } from "../models/comments.model.js";
import { Artblog } from "../models/artblogs.model.js";
import { Announcement } from "../models/announcements.model.js";

// Artwork Comments

const addCommentToArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params

    if(!artworkId){
        throw new ApiError(400,"artworkId is required!")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400,"content of comment is required!")
    }

    const isArtwork = await Artwork.findById(artworkId)

    if(!isArtwork){
        throw new ApiError(404,"Cannot add comment, Artwork does not exist!")
    }

    const comment = await Comment.create({
        content,
        artwork: artworkId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500,"Something went wrong while adding a comment!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment added successfully!"))

} )

const getCommentsOfArtwork = asyncHandler( async(req,res) => {

    const {artworkId} = req.params

    if(!artworkId){
        throw new ApiError(400,"artworkId is required!")
    }

    const comments = await Artwork.aggregate([
        
        {
            $match:{
                _id: new mongoose.Types.ObjectId(artworkId)
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"artwork",
                as:"comments",

                pipeline:[
                    {
                        $addFields:{
                            deletionFlag:{
                                $cond:{
                                    if: { $eq: ["$owner",req.user?._id] },
                                    then: true,
                                    else: false
                                }
                            }
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
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $project:{
                comments:1
            }
        }

    ])

    if(!comments[0]){
        throw new ApiError(500,"Something went wrong while fetching artwork comments!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,comments[0],"Artwork comments fetched successfully"))

} )

// Artblog Comments

const addCommentToArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params

    if(!artblogId){
        throw new ApiError(400,"artblogId is required!")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400,"content of comment is required!")
    }

    const isArtblog = await Artblog.findById(artblogId)

    if(!isArtblog){
        throw new ApiError(404,"Cannot add comment, Artblog does not exist!")
    }

    const comment = await Comment.create({
        content,
        artblog: artblogId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500,"Something went wrong while adding a comment!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment added successfully!"))

} )

const getCommentsOfArtblog = asyncHandler( async(req,res) => {

    const {artblogId} = req.params

    if(!artblogId){
        throw new ApiError(400,"artblogId is required!")
    }

    const comments = await Artblog.aggregate([
        
        {
            $match:{
                _id: new mongoose.Types.ObjectId(artblogId)
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"artblog",
                as:"comments",

                pipeline:[
                    {
                        $addFields:{
                            deletionFlag:{
                                $cond:{
                                    if: { $eq: ["$owner",req.user?._id] },
                                    then: true,
                                    else: false
                                }
                            }
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
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $project:{
                comments:1
            }
        }

    ])

    if(!comments[0]){
        throw new ApiError(500,"Something went wrong while fetching artblog comments!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,comments[0],"Artblog comments fetched successfully"))

} )

// Announcement Comments

const addCommentToAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params

    if(!announcementId){
        throw new ApiError(400,"announcementId is required!")
    }

    const {content} = req.body

    if(!content){
        throw new ApiError(400,"content of comment is required!")
    }

    const isAnnouncement = await Announcement.findById(announcementId)

    if(!isAnnouncement){
        throw new ApiError(404,"Cannot add comment, Announcement does not exist!")
    }

    const comment = await Comment.create({
        content,
        announcement: announcementId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(500,"Something went wrong while adding a comment!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment added successfully!"))

} )

const getCommentsOfAnnouncement = asyncHandler( async(req,res) => {

    const {announcementId} = req.params

    if(!announcementId){
        throw new ApiError(400,"announcementId is required!")
    }

    const comments = await Announcement.aggregate([
        
        {
            $match:{
                _id: new mongoose.Types.ObjectId(announcementId)
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"announcement",
                as:"comments",

                pipeline:[
                    {
                        $addFields:{
                            deletionFlag:{
                                $cond:{
                                    if: { $eq: ["$owner",req.user?._id] },
                                    then: true,
                                    else: false
                                }
                            }
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
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
        {
            $project:{
                comments:1
            }
        }

    ])

    if(!comments[0]){
        throw new ApiError(500,"Something went wrong while fetching announcement comments!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,comments[0],"Announcement comments fetched successfully"))

} )

// Delete Comments

const deleteComment = asyncHandler( async(req,res) => {

    const {commentId} = req.params

    if(!commentId){
        throw new ApiError("Comment Id is required!")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError("Something went wrong while deleting comment!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,deletedComment,"Comment deleted successfully!"))
} )

export {
    addCommentToArtwork,
    getCommentsOfArtwork,
    addCommentToArtblog,
    getCommentsOfArtblog,
    addCommentToAnnouncement,
    getCommentsOfAnnouncement,
    deleteComment
}
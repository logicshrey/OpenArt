import { Follow } from "../models/follows.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js" 
import mongoose from "mongoose";
import { User } from "../models/users.model.js"


const addFollower = asyncHandler( async(req,res) => {

    const { accountId } = req.params

    if(!accountId){
        throw new ApiError(400,"accountId is required!")
    }

    const user = await User.findById(accountId)

    if(!user){
        throw new ApiError(404,"User account does not exists!")
    }

    const followDetails = await Follow.create({
        artist: accountId,
        follower: req.user?._id
    })

    if(!followDetails){
        throw new ApiError(500,"Something went wrong while adding new follower!")
    }

    res
    .status(201)
    .json(new ApiResponse(201,followDetails,"New follower added successfully!"))
} )

const removeFollower = asyncHandler( async(req,res) => {

    const { accountId } = req.params

    if(!accountId){
        throw new ApiError(400,"accountId is required!")
    }

    const removedFollower = await Follow.deleteOne({
        artist: accountId,
        follower: req.user?._id
    })

    if(!removedFollower){
        throw new ApiError(500,"Something went wrong while removing the follower!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,removedFollower,"Follower removed successfully!"))
} )

const getFollowers = asyncHandler( async(req,res) => {
    
    const { accountId } = req.params

    if(!accountId){
        throw new ApiError(400,"accountId is required!")
    }

    const followers = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(accountId)
            }
        },
        {
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"artist",
                as:"followers",

                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"follower",
                            foreignField:"_id",
                            as:"follower",

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
                            follower:{
                                $first:"$follower"
                            }
                        }
                    },
                    {
                        $project:{
                            follower:1
                        }
                    }
                ]
            }
        },
        {
           $project:{
            followers:1
           } 
        }

    ])

    if(!followers[0]){
        throw new ApiError(500,"Something went wrong while fetching followers!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,followers[0],"Followers fetched successfully!"))
} )

const getFollowing = asyncHandler( async(req,res) => {
    
    const { accountId } = req.params

    if(!accountId){
        throw new ApiError(400,"accountId is required!")
    }

    const followings = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(accountId)
            }
        },
        {
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"follower",
                as:"followings",

                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"artist",
                            foreignField:"_id",
                            as:"artist",

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
                            artist:{
                                $first:"$artist"
                            }
                        }
                    },
                    {
                        $project:{
                            artist:1
                        }
                    }
                ]
            }
        },
        {
           $project:{
            followings:1
           } 
        }

    ])

    if(!followings[0]){
        throw new ApiError(500,"Something went wrong while fetching followings!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,followings[0],"Followings fetched successfully!"))
} )



export {
    addFollower,
    removeFollower,
    getFollowers,
    getFollowing
}
import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import mongoose from "mongoose"


const getArtistProfile = asyncHandler( async(req, res, next) => {

    const {profileId} = req.params
    
    if(!profileId){
        return next(new ApiError(400, "Profile Id is required!"))
    }

    const artistProfile = await User.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(profileId)
            }
        },
        {
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"artist",
                as:"followers"
            }
        },
        {
            $lookup:{
                from:"follows",
                localField:"_id",
                foreignField:"follower",
                as:"followings"
            }
        },
        {
            $lookup:{
                from:"artworks",
                localField:"_id",
                foreignField:"owner",
                as:"createdArtworks"
            }
        },
        {
            $lookup:{
                from:"artblogs",
                localField:"_id",
                foreignField:"owner",
                as:"createdArtblogs"
            }
        },
        {
            $lookup:{
                from:"announcements",
                localField:"_id",
                foreignField:"owner",
                as:"createdAnnouncements"
            }
        },
        {
            $addFields:{
                followersCount:{
                    $size: "$followers"
                },
                followingsCount:{
                    $size: "$followings"
                },
                isFollowing:{
                    $cond:{
                        if: { $in: [req.user?._id,"$followers.follower"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                email:1,
                username:1,
                bio:1,
                avatar:1,
                coverImage:1,
                accountType:1,
                artField:1,
                country:1,
                followersCount:1,
                followingsCount:1,
                isFollowing:1,
                createdArtworks:1,
                createdArtblogs:1,
                createdAnnouncements:1
            }
        }

    ])

    if(!artistProfile[0]){
        return next(new ApiError(500, "Something went wrong while fetching profile details!"))
    }

    res
    .status(200)
    .json(new ApiResponse(200, artistProfile[0], "Profile details fetched successfully!"))

} )


export {
    getArtistProfile
}
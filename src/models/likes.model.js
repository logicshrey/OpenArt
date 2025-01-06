import mongoose from "mongoose"

const likeSchema = new mongoose.Schema({

   artwork:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artwork",
    // default: null
   },
   artblog:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artblog",
    // default: null
   },
   announcement:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    // default: null
   },
   likedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   }

},{
    timestamps: true
})

export const Like = mongoose.model("Like",likeSchema)
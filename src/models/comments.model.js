import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({

   content:{
    type: String,
    required: true
   },
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
   owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   }

},{
    timestamps: true
})

export const Comment = mongoose.model("Comment",commentSchema)
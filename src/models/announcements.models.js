import mongoose from "mongoose"

const announcementSchema = new mongoose.Schema({

   title:{
    type: String,
    required: true
   },
   description:{
    type: String,
    required: true
   },
   category:{
    type: String,
    required: true
   },
   owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   },
   image:{
    type: String  
   }

},{
    timestamps: true
})

export const Announcement = mongoose.model("Announcement",announcementSchema)
import mongoose from "mongoose"

const artworkSchema = new mongoose.Schema({

   contentFile:{
    type: String,
    required: true
   },
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
   }

},{
    timestamps: true
})

export const Artwork = mongoose.model("Artwork",artworkSchema)
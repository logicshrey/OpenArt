import mongoose from "mongoose"

const artblogSchema = new mongoose.Schema({

   content:{
    type: String,
    required: true
   },
   title:{
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

export const Artblog = mongoose.model("Artblog",artblogSchema)
import mongoose from "mongoose"

const followSchema = new mongoose.Schema({

   artist:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   },
   follower:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   }

},{
    timestamps: true
})

export const Follow = mongoose.model("Follow",followSchema)
import mongoose from "mongoose";

const savedArtblogSchema = new mongoose.Schema({

    artblog:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artblog"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

},{
    timestamps: true
})

export const savedArtblog = mongoose.model("savedArtblog",savedArtblogSchema)
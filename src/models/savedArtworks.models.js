import mongoose from "mongoose";

const savedArtworkSchema = new mongoose.Schema({

    artwork:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artwork"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

},{
    timestamps: true
})

export const savedArtwork = mongoose.model("savedArtwork",savedArtworkSchema)
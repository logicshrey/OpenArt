import mongoose from "mongoose";

const savedAnnouncementSchema = new mongoose.Schema({

    announcement:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

},{
    timestamps: true
})

export const savedAnnouncement = mongoose.model("savedAnnouncement",savedAnnouncementSchema)
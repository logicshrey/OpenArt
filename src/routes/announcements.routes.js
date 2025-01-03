import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js";
import { createAnnouncement, editAnnouncement, deleteAnnouncement, getAnnouncement, getAnnouncementsByContentChoice } from "../controllers/announcements.controller.js";


const router = Router()

// Secured Routes

router.route("/create_announcement").post(verifyJwt,createAnnouncement)
router.route("/edit_announcement/:announcementId").patch(verifyJwt,editAnnouncement)
router.route("/delete_announcement/:announcementId").delete(verifyJwt,deleteAnnouncement)
router.route("/get_announcement/:announcementId").get(verifyJwt,getAnnouncement)
router.route("/get_announcements_by_content_choice").get(verifyJwt,getAnnouncementsByContentChoice)

export default router
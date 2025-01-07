import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { saveAnnouncement, unsaveAnnouncement } from "../controllers/savedAnnouncements.controller.js" 

const router = Router()

// Secured Routes

router.route("/save_announcement/:announcementId").post(verifyJwt,saveAnnouncement)
router.route("/unsave_announcement/:announcementId").delete(verifyJwt,unsaveAnnouncement)


export default router
import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { addLikeToArtwork, getLikesOfArtwork, unlikeArtwork, addLikeToArtblog, getLikesOfArtblog, unlikeArtblog, addLikeToAnnouncement, getLikesOfAnnouncement, unlikeAnnouncement } from "../controllers/likes.controller.js" 

const router = Router()

// Secured Routes

router.route("/add_like_to_artwork/:artworkId").post(verifyJwt,addLikeToArtwork)
router.route("/get_likes_of_artwork/:artworkId").get(verifyJwt,getLikesOfArtwork)
router.route("/unlike_artwork/:artworkId").delete(verifyJwt,unlikeArtwork)
router.route("/add_like_to_artblog/:artblogId").post(verifyJwt,addLikeToArtblog)
router.route("/get_likes_of_artblog/:artblogId").get(verifyJwt,getLikesOfArtblog)
router.route("/unlike_artblog/:artblogId").delete(verifyJwt,unlikeArtblog)
router.route("/add_like_to_announcement/:announcementId").post(verifyJwt,addLikeToAnnouncement)
router.route("/get_likes_of_announcement/:announcementId").get(verifyJwt,getLikesOfAnnouncement)
router.route("/unlike_announcement/:announcementId").delete(verifyJwt,unlikeAnnouncement)

export default router
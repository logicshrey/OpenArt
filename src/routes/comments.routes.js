import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { addCommentToArtwork, getCommentsOfArtwork, deleteComment, addCommentToAnnouncement, getCommentsOfAnnouncement, addCommentToArtblog, getCommentsOfArtblog } from "../controllers/comments.controller.js" 

const router = Router()

// Secured Routes

router.route("/add_comment_to_artwork/:artworkId").post(verifyJwt,addCommentToArtwork)
router.route("/get_comments_of_artwork/:artworkId").get(verifyJwt,getCommentsOfArtwork)
router.route("/add_comment_to_artblog/:artblogId").post(verifyJwt,addCommentToArtblog)
router.route("/get_comments_of_artblog/:artblogId").get(verifyJwt,getCommentsOfArtblog)
router.route("/add_comment_to_announcement/:announcementId").post(verifyJwt,addCommentToAnnouncement)
router.route("/get_comments_of_announcement/:announcementId").get(verifyJwt,getCommentsOfAnnouncement)
router.route("/delete_comment/:commentId").delete(verifyJwt,deleteComment)


export default router

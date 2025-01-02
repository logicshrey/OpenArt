import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"

const router = Router()

// Secured Routes

router.route("/create_artblog").post(verifyJwt,createArtblog)
router.route("/edit_artblog/:artblogId").patch(verifyJwt,editArtblog)
router.route("/delete_artblog/:artblogId").delete(verifyJwt,deleteArtblog)
router.route("/get_artblog/:artblogId").get(verifyJwt,getArtblog)
router.route("/get_artblogs_by_content_choice").get(verifyJwt,getArtblogsByContentChoice)

export default router
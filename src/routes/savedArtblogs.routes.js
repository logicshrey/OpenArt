import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { saveArtblog, unsaveArtblog } from "../controllers/savedArtblogs.controller.js" 

const router = Router()

// Secured Routes

router.route("/save_artblog/:artblogId").post(verifyJwt,saveArtblog)
router.route("/unsave_artblog/:artblogId").delete(verifyJwt,unsaveArtblog)


export default router
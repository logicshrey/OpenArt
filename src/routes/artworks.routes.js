import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { createArtwork, deleteArtwork, editArtwork, getArtwork } from "../controllers/artworks.controller.js";

const router = Router()

// Secured Routes

router.route("/create_artwork").post(verifyJwt,upload.single("contentFile"),createArtwork)
router.route("/edit_artwork/:artworkId").patch(verifyJwt,editArtwork)
router.route("/delete_artwork/:artworkId").delete(verifyJwt,deleteArtwork)
router.route("/get_artwork/:artworkId").get(verifyJwt,getArtwork)

export default router
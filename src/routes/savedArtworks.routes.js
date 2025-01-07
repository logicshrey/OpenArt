import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { saveArtwork, unsaveArtwork, getSavedArtworks } from "../controllers/savedArtworks.controller.js" 

const router = Router()

// Secured Routes

router.route("/save_artwork/:artworkId").post(verifyJwt,saveArtwork)
router.route("/unsave_artwork/:artworkId").delete(verifyJwt,unsaveArtwork)
router.route("/get_saved_artworks").get(verifyJwt,getSavedArtworks)


export default router
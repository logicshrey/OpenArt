import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { getArtistProfile } from "../controllers/profile.controller.js"

const router = Router()

// Secured Routes

router.route("/get_profile_details/:profileId").get(verifyJwt,getArtistProfile)

export default router
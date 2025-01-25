import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"
import { addFollower, getFollowers, getFollowing, removeFollower } from "../controllers/follows.controller.js" 

const router = Router()

// Secured Routes

router.route("/add_follower/:accountId").post(verifyJwt,addFollower)
router.route("/remove_follower/:accountId").post(verifyJwt,removeFollower)
router.route("/get_followers/:accountId").get(verifyJwt,getFollowers)
router.route("/get_followings/:accountId").get(verifyJwt,getFollowing)

export default router

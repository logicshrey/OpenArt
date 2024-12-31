import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { changeAccountType, changePassword, deleteAccount, getAccountDetails, getSavedArtworks, login, logout, refreshAccessToken, register, updateAvatar, updateContentChoice, updateCoverImage, updateUserDetails } from "../controllers/users.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.middlewares.js"

const router = Router()


router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),register)

router.route("/login").post(login)

// Secured Routes

router.route("/logout").post(verifyJwt,logout)
router.route("/update_account_details").patch(verifyJwt,updateUserDetails)
router.route("/update_avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
router.route("/update_coverimage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)
router.route("/change-password").patch(verifyJwt,changePassword)
router.route("/change-account-type").patch(verifyJwt,changeAccountType)
router.route("/update-content-choice").patch(verifyJwt,updateContentChoice)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/delete-account").delete(verifyJwt,deleteAccount)
router.route("/get-account-details").get(verifyJwt,getAccountDetails)
router.route("/get-saved-artworks").get(verifyJwt,getSavedArtworks)


export default router
import jwt from "jsonwebtoken"
import {ApiError} from "../utils/apiError.js"
import { User } from "../models/users.models.js"

const verifyJwt = async (req,__,next) => {
    try {
        const token = req.cookies?.accessToken

        if(!token){
           throw new ApiError(401,"Access Token not found, Unauthorized User!") 
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid Access Token!")
        }

        req.user = user
        next()
        
    } catch (error) {
      console.log("Error: ",error);
      throw error   
    } 
}

export { verifyJwt }
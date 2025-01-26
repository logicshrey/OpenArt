import { v2 as cloudinary } from 'cloudinary'
import { ApiError } from './apiError.js'
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try {  
        if(!localFilePath){
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
        
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Cloudinary Upload Error: ", error)
        return null
    }
}

const destroyOnCloudinary = async (fileUrl, next) => {
    try {
        if(!fileUrl){
            return;
        }
        const regex = /\/upload\/(?:v\d+\/)?([^/.]+)/
        const match = fileUrl.match(regex)
        const publicId = match ? match[1] : null

        await cloudinary.uploader.destroy(publicId)

    } catch (error) {
        console.log("Cloudinary Destroy Error: ", error)
        return next(new ApiError(501, "Something went wrong when destroying the file on cloudinary!"))
    }
}

export { uploadOnCloudinary, destroyOnCloudinary }
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({

   fullName:{
    type: String,
    required: true
   },
   email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true
   },
   country:{
    type: String,
    required: true
   },
   accountType:{
    type: String,
    required: true,
    enum: ["Artist","User","Organization"]
   },
   artField:{
    type: String 
   },
   username:{
    type: String,
    required: true,
    lowercase: true,
    unique: true
   },
   bio:{
    type: String,
    required: true
   },
   avatar:{
    type: String,
    required: true
   },
   coverImage:{
    type: String
   },
   password:{
    type: String,
    required: true
   },
   contentChoice:[
    {
        type: String
    }
   ],
   refreshToken:{
    type: String
   },

},{
    timestamps:true
})

userSchema.pre("save", async function (req,res,next){
    if(!(this.isModified("password"))){
         next()
    }
    await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email
    }, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: REFRESH_TOKEN_EXPIRY 
    })
}

export const User = mongoose.model("User",userSchema)
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }

  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json({limit:"16kb"}))
  app.use(express.urlencoded({extended:true,limit:"16kb",}))
  app.use(express.static("public"))

  // Routes Import

import userRouter from "./routes/users.routes.js"
import artworkRouter from "./routes/artworks.routes.js"

// Routes Activation

app.use("/openart/api/users",userRouter)
app.use("/openart/api/artworks",artworkRouter)

export { app }

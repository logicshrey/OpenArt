import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/apiError.js"

const app = express()

var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }


  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json({limit:"64kb"}))
  app.use(express.urlencoded({extended:true,limit:"64kb",}))
  app.use(express.static("public"))
  app.options('*', cors(corsOptions));

  // Routes Import

import userRouter from "./routes/users.routes.js"
import artworkRouter from "./routes/artworks.routes.js"
import artblogRouter from "./routes/artblogs.routes.js"
import announcementRouter from "./routes/announcements.routes.js"
import followRouter from "./routes/follows.routes.js"
import commentRouter from "./routes/comments.routes.js"
import likeRouter from "./routes/likes.routes.js"
import savedArtworkRouter from "./routes/savedArtworks.routes.js"
import savedArtblogRouter from "./routes/savedArtblogs.routes.js"
import savedAnnouncementRouter from "./routes/savedAnnouncements.routes.js"
import profileRouter from "./routes/profile.routes.js"

// Routes Activation

app.use("/openart/api/users",userRouter)
app.use("/openart/api/artworks",artworkRouter)
app.use("/openart/api/artblogs",artblogRouter)
app.use("/openart/api/announcements",announcementRouter)
app.use("/openart/api/follows",followRouter)
app.use("/openart/api/comments",commentRouter)
app.use("/openart/api/likes",likeRouter)
app.use("/openart/api/savedartworks",savedArtworkRouter)
app.use("/openart/api/savedartblogs",savedArtblogRouter)
app.use("/openart/api/savedannouncements",savedAnnouncementRouter)
app.use("/openart/api/profiles",profileRouter)


// Error-Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
      res.status(err.statusCode || 500).json({
          message: err.message,
          errors: err.errors || null,
        });
    } else {
        console.error("Unexpected Error:", err);
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
});

//   404 Middleware

app.use((req, res, next) => {
  res.status(404).json({ message: "The requested resource was not found." });
});

export { app }

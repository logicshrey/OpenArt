import db_connect from "./db/dbconnect.js"
import { app } from "./app.js"
import dotenv from "dotenv"

dotenv.config({path:"/.env"})

db_connect()
.then(()=>{
    console.log("Database connection successful!")
    app.listen(process.env.PORT,(req,res)=>{
        console.log(`App is listening on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Database connection error",err)
    process.exit(1);
})


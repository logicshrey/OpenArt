import mongoose from "mongoose";
import DB_NAME from "../constants.js"

const db_connect = async(req,res) => {
      try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      } catch (error) {
        throw error;
      }
}

export default db_connect
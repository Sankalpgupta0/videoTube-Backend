// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {server} from './app.js'
import { connectRedis } from "./redis/index.js";
dotenv.config({
    path: './.env'
})

connectRedis()
.then(() => {
    connectDB()
    .then(() => {
        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
})

export {server}
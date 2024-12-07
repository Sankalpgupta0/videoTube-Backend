import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { WebSocketServer } from 'ws'; 
import http from 'http';
import { User } from "./models/user.model.js";
import { Tweet } from "./models/tweet.model.js";
import { redis } from "./redis/index.js";
import url from 'url'

const app = express()
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// server.on('upgrade', (request, socket, head) => {
//     wss.handleUpgrade(request, socket, head, (ws) => {
//         wss.emit('connection', ws, request);
//     });
// });


// wss.on('connection', async (ws, req) => {
//     console.log("Client connected");

//     const queryParams = url.parse(req.url, true).query;
//     const user_id = queryParams._id;
//     // console.log(user_id);

//     try {
//         const user = await User.findById(user_id);
//         if (!user) {
//             throw new ApiError(401, 'Not authenticated');
//         }

//         ws.on('error', (err) => {
//             console.error('WebSocket error:', err);
//         });

//         ws.on('close', () => {
//             console.log("Connection lost");
//         });

//         ws.on('message', async (message) => {
//             try {
//                 const redisData = await redis.get(`rateLimiting:chat:${user_id}`);
//                 if (redisData >= 5) {
//                     ws.send(JSON.stringify({
//                         owner: true,
//                         content: "Too many requests, please try after sometime"
//                     }));
//                     return;
//                 }

//                 const str = message.toString();
//                 const tweet = await Tweet.create({
//                     owner: user_id,
//                     content: str
//                 });

//                 redis.incr(`rateLimiting:chat:${user_id}`, (err, res) => {
//                     if (err) {
//                         console.error('Redis increment error:', err);
//                     } else {
//                         console.log('Redis incremented:', res);
//                     }
//                 });

//                 redis.expire(`rateLimiting:chat:${user_id}`, 60);

//                 wss.clients.forEach((client) => {
//                     client.send(JSON.stringify({
//                         owner: user_id,
//                         content: str
//                     }));
//                 });
//             } catch (error) {
//                 console.error('Error handling WebSocket message:', error);
//                 ws.send(JSON.stringify({
//                     statusCode: 500,
//                     message: "Internal server error"
//                 }));
//             }
//         });

//     } catch (error) {
//         console.error('Error connecting WebSocket client:', error);
//         ws.close();
//     }
// });

//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.get("/",(req,res) => res.send("server is running"))
app.post("/log", (req, res) => {
    console.log(req.body);
    res.json("routes working from app")
})
app.use("/api/healthcheck", healthcheckRouter)
app.use("/api/users", userRouter)
app.use("/api/tweets", tweetRouter)
app.use("/api/subscriptions", subscriptionRouter)
app.use("/api/videos", videoRouter)
app.use("/api/comments", commentRouter)
app.use("/api/likes", likeRouter)
app.use("/api/playlist", playlistRouter)
app.use("/api/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

export { app }
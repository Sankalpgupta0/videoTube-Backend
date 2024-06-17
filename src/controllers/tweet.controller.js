import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { WebSocketServer } from 'ws'; 
import url from 'url'
import {redis} from '../redis/index.js'

const wss = new WebSocketServer({ port: process.env.SOCKET_PORT });

wss.on('connection', async(ws, req) => {
    console.log("client connected")
    // console.log(req.url)
    const queryParams = url.parse(req.url,true).query;
    const user_id = queryParams._id;
    console.log(user_id);
    const user = await User.findById(user_id);
    if(!user){
        throw new ApiError(401, 'Not authenticated');
    }

    ws.on('error', (err) => {
        console.log(err);
    })
    ws.on("close", () => {
        console.log("Connection lost");
    });
    ws.on('message', async(message) => {

        const redisData = await redis.get(`rateLimiting:chat:${user_id}`)
        // console.log(redisData);
        if(redisData >=5){
            // res.status(429).json({ statusCode: 429, message: "Too many requests, please try after sometime" })
            ws.send(JSON.stringify({
                owner: true,
                content: "Too many requests, please try after sometime"
            }));
            return
        }

        const str = message.toString()
        // console.log(str);
        
        const tweet = await Tweet.create({
            owner: user_id, 
            content: str
        });

        redis.incr(`rateLimiting:chat:${user_id}`, function (err, res) {
            console.log(res);
        });
        redis.expire(`rateLimiting:chat:${user_id}`, 60)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({
                owner: user_id,
                content: str
            }));
        })
    });
})

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = await User.findById(req.user?._id);
    const {content} = req.body;

    if(!user){
        throw new ApiError(401, 'Not authenticated');
    }
    if (!content){
        throw new ApiError(400, 'Content field required')
    }

    const tweet = await Tweet.create({
        owner: user._id, 
        content: content
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                tweet
            },
            "tweet created successfully!"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    return  res.status(200).json(new ApiResponse(200,{tweets},'successfully got the tweets'));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const {content} = req.body;
    let tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                tweet,
            },
            "Successfully updated the tweet"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    let tweet = await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "deleted tweet successfully"
        )
    )
})

const getAllTweets = asyncHandler(async (req, res) => {
    //TODO: get all tweets
    const tweets = await Tweet.find();
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                tweets
            },
            "tweets fetched successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}

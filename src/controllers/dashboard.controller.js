import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user?._id;

    if(!isValidObjectId(channelId)) 
        throw new ApiError(400,"invalid channel ID")

    const channel = await User.findById(channelId);
    if(!channel)  
        throw new ApiError(404,'channel not found')

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        }
    ])
    const  totalSubscribers=subscribers.length;
    
    const videos = await Video.aggregate([
        {
            $match : {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])
    const totalVideos = videos.length;
    let totalViews = 0;
    
    videos.map((video) => {
        if(video.isPublished)
            totalViews+= video.views;
    })

    const likes = await Like.aggregate([
        {
            $lookup :{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoInfo"
            },
            
        },
        {
            $unwind:"$videoInfo"
        },
        {
            $group :{
                _id : "$videoInfo._id",
                countLikes:{$sum:1}
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribersCount:totalSubscribers,
                videoCount:totalVideos,
                viewCount:totalViews,
                likeCount:likes.length
            },
            "stats fetxhed successfully"
        )
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user?._id;
    const {page = 1, limit = 40} = req.query
    if(!isValidObjectId(channelId)) 
        throw new ApiError(400,"invalid channel ID")

    const channel = await User.findById(channelId);
    if(!channel)  
        throw new ApiError(404,'channel not found')

    const videos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
    ])

    return res.status(200).json(
        new ApiResponse(200,{videos},"videos fetched successfully")
    )
})

const getVideosOfAChannel = asyncHandler(async(req, res) => {
    const {userId} = req.params;
    const videos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, {videos}, "videos fetched"))
})

export {
    getChannelStats, 
    getChannelVideos,
    getVideosOfAChannel
    }
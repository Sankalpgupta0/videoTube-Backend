import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    // if video is in database then only like or dislike it
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, 'Video not found')
    }

    if( !isValidObjectId(videoId)) 
        throw new ApiError(400, "Invalid Video ID")

    // if videoId is valid than check if  user already liked the video or not
    const liked = await Like.findOne({
        video: videoId, 
        likedBy: req.user?._id
    })

    if(liked){   
        //if user has already liked this video then remove it from database
        await Like.findByIdAndDelete(liked._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked : false
                },
                "like is toggled to false on video",
            )
        )
    }   

    //else create a new one in database
    const like = await Like.create({
        video : videoId ,
        likedBy : req.user?._id,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked : true
                },
                "like is toggled to true on video",
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, 'comment not found')
    }

    if( !isValidObjectId(commentId)) 
        throw new ApiError(400, "Invalid comment ID")

    // if videoId is valid than check if  user already liked the video or not
    const liked = await Like.findOne({
        comment: commentId, 
        likedBy: req.user?._id
    })

    if(liked){   
        //if user has already liked this video then remove it from database
        await Like.findByIdAndDelete(liked._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked : false
                },
                "like is toggled to false on comment",
            )
        )
    }   

    //else create a new one in database
    const like = await Like.create({
        comment : commentId ,
        likedBy : req.user?._id,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked : true
                },
                "like is toggled to true on comment",
            )
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, 'tweet not found')
    }

    if( !isValidObjectId(tweetId)) 
        throw new ApiError(400, "Invalid tweet ID")

    // if videoId is valid than check if  user already liked the video or not
    const liked = await Like.findOne({
        tweet: tweetId, 
        likedBy: req.user?._id
    })

    if(liked){   
        //if user has already liked this video then remove it from database
        await Like.findByIdAndDelete(liked._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked : false
                },
                "like is toggled to false on tweet",
            )
        )
    }   

    //else create a new one in database
    const like = await Like.create({
        tweet : tweetId ,
        likedBy : req.user?._id,
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isLiked : true
                },
                "like is toggled to true on comment on tweet",
            )
        )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos by a user

    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                        $unwind: "$ownerDetails",
                    },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 1,
                likedVideo: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        avatar: 1,
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideosAggegate,
                "liked videos fetched successfully"
            )
        );

})

const getAVideoIsLikedOrNot = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const VideoIsLiked = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
    })
    return res.status(200).json(new ApiResponse(200, VideoIsLiked, "hello"))
})

const getACommentIsLikedOrNot = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const commetIsLiked = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
    })
    return res.status(200).json(new ApiResponse(200, commetIsLiked, "hello"))
})
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getAVideoIsLikedOrNot,
    getACommentIsLikedOrNot
}
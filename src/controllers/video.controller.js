import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
// import { redis } from "../redis/index.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 40, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // this is a easier method but not so good method  because it will take more time to load the data if there are many records in db ... a better approach will be using aggrigation pipeline 
    // const videos = await Video.find();

    // const redisData = await redis.json.get(`videos`)
    // if (redisData) {
    //     return res
    //         .status(200)
    //         .json(
    //             new ApiResponse(
    //                 200,
    //                 {
    //                     videos: redisData
    //                 },
    //                 "all videos featched successfully"
    //             )
    //         )
    // }
    const skip = (page - 1) * limit;
    const videos = await Video.aggregate([
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    if (!videos) {
        throw new ApiError(404, 'No videos found')
    }

    // const redisResult = await redis.json.set(`videos`, '$', videos)
    // const redisExpire = await redis.expire("videos", 60*30)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos
                },
                "all videos featched successfully"
            )
        )
})

const publishAVideo = asyncHandler(async (req, res) => {

    // const redisData = await redis.get(`rateLimiting:Video:${req.user._id}`)
    // if(redisData >=1){
    //     res.status(429).json({ statusCode: 429, message: "Too many requests, please try after sometime" })
    //     throw new ApiError(429, 'Rate limit exceeded on uploading videos')
    // }

    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!videoFileLocalPath || !thumbnailLocalPath)
        throw new ApiError(400, "video file or thumbnail is not provided");

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    // console.log(thumbnail);
    if (!videoFile || !thumbnail) {
        throw new ApiError(500, 'error while uploading video file or thumbnail on cloudinary');
    }
    if (!title) {
        throw new ApiError(400, 'Title field cannot be empty');
    }
    //for owner get current user and we are using verifyJwt method so we have req.user
    const user = await User.findById(req.user?._id);


    const video = await Video.create({
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: videoFile?.duration,
        owner: user._id,
    });
    // console.log(video);

    // // rate limiting
    // await redis.incr(`rateLimiting:Video:${req.user._id}`);
    // await redis.expire(`rateLimiting:Video:${req.user._id}`, 300)

    // const appendVideoOnRedis = await redis.json.ARRAPPEND(`videos`, '.', video)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    video
                },
                "video uploaded successfully"
            )
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    let video = await Video.findById(videoId)
    return res
        .status(200)
        .json(new ApiResponse(200, video, "video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    let video;
    const { videoId } = req.params


    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const thumb = req.body.thumbnail
    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
            throw new ApiError(500, "Failed to save thumbnail on cloudinary")
        }
        video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    thumbnail: thumbnail?.url || "",
                    title: title || "",
                    description: description || ""
                }
            },
            {
                new: true
            }
        );
    }
    if (!thumbnailLocalPath) {
        video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    thumbnail: thumb || "",
                    title: title || "",
                    description: description || ""
                }
            },
            {
                new: true
            }
        );
    }


    // const allVideos = await redis.json.get(`videos`)
    // for (let i = 0; i < allVideos.length; i++) {
    //     if (allVideos[i]._id === videoId) {
    //         allVideos[i] = video;
    //         await redis.json.set(`videos`, '$', allVideos)
    //         break;
    //     }
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    video
                },
                "video details updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    // const allVideos = await redis.json.get(`videos`)
    // for(let i=0; i<allVideos.length; i++){
    //     if(allVideos[i]._id == videoId){
    //         allVideos.splice(i,1)
    //         await redis.json.set(`videos`, '$', allVideos)
    //         break
    //     }
    // }

    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Video has been deleted'));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    const publishStatus = !video.isPublished

    await video.updateOne({ isPublished: publishStatus })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            `Video published status has been changed to ${publishStatus}`
        ))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

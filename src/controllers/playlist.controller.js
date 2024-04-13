import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    // a user cannot have 2 playlists of same name

    const playlist = await Playlist.findOne({
        name: name,
        owner: req.user?._id
    })
    if(playlist){
        throw new ApiError(409,"This playlist already exists.")
    }
    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{newPlaylist},"playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400,'Invalid user id')
    }
    
    const userPlaylists = await Playlist.find({owner:userId}).sort('-createdAt')
    return res.status(200).json(new ApiResponse(200,userPlaylists,"User's playlists fetched successfully."))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "playlist not fount")
    }

    return res.status(200).json(
        new  ApiResponse(200,playlist || {}, "Playlist details fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"invalid playlistId or videoId")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    // 2 same videos cannot be added to the same playlist
    const  isIncluded = playlist.videos.includes(video._id)
    if(isIncluded){
        throw new ApiError(409,'This video already in this playlist')
    }

    const addVideo = await Playlist.updateOne(
        {
            _id: playlistId,
        },
        {
            $push : {
                videos : video
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(200,{addVideo},'video added to the playlist successfully')
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    const removedIndex = playlist.videos.indexOf(videoId)
    
    if(removedIndex === -1){
        throw new ApiError(400,"this video isn't in your playlist")
    }

    const removeVideo = await  Playlist.updateOne(
        {
            _id: playlistId
        },
        {
            $pull:{
                videos:videoId
            }
        },
        {
            new :true
        }
    )

    return  res.status(200).json(
        new ApiResponse(200, {removeVideo},"the video has been deleted from this playlist.")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    let playlist = await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(404,'Playlist not found')
    }
    return res.status(200).json(new ApiResponse(200,{}, "The playlist was successfully deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    let playlist = await Playlist.findByIdAndUpdate(
        {
            _id: playlistId
        },
        {
            $set: {
                name,
                description
            }
        },
        {
            new : true
        }
    )

    return res.status(200).json(new ApiResponse(200, {playlist},"The playlist has been updated."))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

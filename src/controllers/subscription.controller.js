import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription
    if (!isValidObjectId(channelId))
        throw new ApiError(400, "Invalid channel ID");

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });
    // console.log(isSubscribed);

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { subscribed: false }, "unsunscribed successfully")
            );
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { subscribed: true }, "subscribed successfully")
        );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalCount: subscribers.length,
                subscribers,
            },
            "subscribers fetched successfully"
        )
    )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const channelsSubscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalChannelsSubscriberedTo: channelsSubscribedTo.length,
                channelsSubscribedTo,
            },
            "channels fetched successfully"
        )
    )
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

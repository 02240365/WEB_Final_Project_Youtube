// channels.js - Channel routes
// Handles channel information and subscriptions

const express = require("express")
const { prisma } = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/channels
// @desc    Get multiple channels by IDs
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { ids } = req.query

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Channel IDs are required",
      })
    }

    // Parse IDs (can be comma-separated string or array)
    const channelIds = Array.isArray(ids) ? ids : ids.split(",")

    // Get channels
    const channels = await prisma.user.findMany({
      where: {
        id: { in: channelIds },
        isCreator: true,
      },
      select: {
        id: true,
        username: true,
        channelName: true,
        profilePicture: true,
        bannerImage: true,
        description: true,
        verified: true,
        subscribers: true,
        totalViews: true,
        createdAt: true,
        _count: {
          select: {
            videos: {
              where: { isPublic: true },
            },
          },
        },
      },
    })

    // Transform data for response
    const transformedChannels = channels.map((channel) => ({
      id: channel.id,
      name: channel.channelName || channel.username,
      username: channel.username,
      profilePicture: channel.profilePicture,
      bannerImage: channel.bannerImage,
      description: channel.description,
      verified: channel.verified,
      subscribers: channel.subscribers,
      totalViews: channel.totalViews,
      videoCount: channel._count.videos,
      createdAt: channel.createdAt,
    }))

    res.json({
      success: true,
      data: transformedChannels,
    })
  } catch (error) {
    console.error("Get channels error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch channels",
    })
  }
})

// @route   GET /api/channels/:id
// @desc    Get single channel by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const channel = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        channelName: true,
        profilePicture: true,
        bannerImage: true,
        description: true,
        verified: true,
        subscribers: true,
        totalViews: true,
        createdAt: true,
        _count: {
          select: {
            videos: {
              where: { isPublic: true },
            },
            subscribers_rel: true,
          },
        },
      },
    })

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      })
    }

    // Check if current user is subscribed (if authenticated)
    let isSubscribed = false
    if (req.user) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          userId_channelId: {
            userId: req.user.id,
            channelId: id,
          },
        },
      })
      isSubscribed = !!subscription
    }

    // Transform data for response
    const transformedChannel = {
      id: channel.id,
      name: channel.channelName || channel.username,
      username: channel.username,
      profilePicture: channel.profilePicture,
      bannerImage: channel.bannerImage,
      description: channel.description,
      verified: channel.verified,
      subscribers: channel.subscribers,
      totalViews: channel.totalViews,
      videoCount: channel._count.videos,
      createdAt: channel.createdAt,
      isSubscribed,
    }

    res.json({
      success: true,
      data: transformedChannel,
    })
  } catch (error) {
    console.error("Get channel error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch channel",
    })
  }
})

// @route   POST /api/channels/:id/subscribe
// @desc    Subscribe/unsubscribe to a channel
// @access  Private
router.post("/:id/subscribe", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { subscribe } = req.body // true to subscribe, false to unsubscribe

    // Check if channel exists
    const channel = await prisma.user.findUnique({
      where: { id },
    })

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      })
    }

    // Can't subscribe to yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot subscribe to your own channel",
      })
    }

    // Check current subscription status
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId_channelId: {
          userId: req.user.id,
          channelId: id,
        },
      },
    })

    let message = ""
    let subscriberChange = 0

    if (subscribe) {
      if (!existingSubscription) {
        // Create subscription
        await prisma.subscription.create({
          data: {
            userId: req.user.id,
            channelId: id,
          },
        })
        subscriberChange = 1
        message = "Subscribed successfully"
      } else {
        message = "Already subscribed"
      }
    } else {
      if (existingSubscription) {
        // Remove subscription
        await prisma.subscription.delete({
          where: {
            userId_channelId: {
              userId: req.user.id,
              channelId: id,
            },
          },
        })
        subscriberChange = -1
        message = "Unsubscribed successfully"
      } else {
        message = "Not subscribed"
      }
    }

    // Update subscriber count
    if (subscriberChange !== 0) {
      await prisma.user.update({
        where: { id },
        data: {
          subscribers: { increment: subscriberChange },
        },
      })
    }

    res.json({
      success: true,
      message,
      data: {
        isSubscribed: subscribe && (existingSubscription || subscriberChange > 0),
      },
    })
  } catch (error) {
    console.error("Subscribe error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update subscription",
    })
  }
})

// @route   GET /api/channels/:id/videos
// @desc    Get videos from a specific channel
// @access  Public
router.get("/:id/videos", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 20, offset = 0, sortBy = "createdAt" } = req.query

    // Check if channel exists
    const channel = await prisma.user.findUnique({
      where: { id },
    })

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      })
    }

    // Build orderBy clause
    let orderBy = {}
    switch (sortBy) {
      case "views":
        orderBy = { views: "desc" }
        break
      case "likes":
        orderBy = { likes: "desc" }
        break
      case "createdAt":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    // Get channel videos
    const videos = await prisma.video.findMany({
      where: {
        userId: id,
        isPublic: true,
      },
      orderBy,
      take: Number.parseInt(limit),
      skip: Number.parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            channelName: true,
            profilePicture: true,
            verified: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes_rel: true,
          },
        },
      },
    })

    // Transform data for response
    const transformedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      duration: video.duration,
      views: video.views,
      likes: video.likes,
      dislikes: video.dislikes,
      category: video.category,
      tags: video.tags,
      createdAt: video.createdAt,
      channel: {
        id: video.user.id,
        name: video.user.channelName || video.user.username,
        profilePicture: video.user.profilePicture,
        verified: video.user.verified,
      },
      commentCount: video._count.comments,
      likeCount: video._count.likes_rel,
    }))

    res.json({
      success: true,
      data: transformedVideos,
    })
  } catch (error) {
    console.error("Get channel videos error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch channel videos",
    })
  }
})

module.exports = router

// users.js - User routes
// Handles user profile and account management

const express = require("express")
const { prisma } = require("../config/database")
const { authenticateToken } = require("../middleware/auth")
const { uploadProfile, getFileUrl } = require("../middleware/upload")

const router = express.Router()

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        bannerImage: true,
        description: true,
        isCreator: true,
        verified: true,
        channelName: true,
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Transform data for response
    const transformedUser = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      profilePicture: user.profilePicture,
      bannerImage: user.bannerImage,
      description: user.description,
      isCreator: user.isCreator,
      verified: user.verified,
      channelName: user.channelName,
      subscribers: user.subscribers,
      totalViews: user.totalViews,
      videoCount: user._count.videos,
      subscriberCount: user._count.subscribers_rel,
      createdAt: user.createdAt,
    }

    res.json({
      success: true,
      data: transformedUser,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  (req, res, next) => {
    uploadProfile(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        })
      }
      next()
    })
  },
  async (req, res) => {
    try {
      const { firstName, lastName, username, description, channelName } = req.body

      const updateData = {}

      // Add fields to update if provided
      if (firstName) updateData.firstName = firstName
      if (lastName) updateData.lastName = lastName
      if (username) updateData.username = username
      if (description !== undefined) updateData.description = description
      if (channelName && req.user.isCreator) updateData.channelName = channelName

      // Handle file uploads
      if (req.files) {
        if (req.files.profilePicture) {
          updateData.profilePicture = getFileUrl(req, `avatars/${req.files.profilePicture[0].filename}`)
        }
        if (req.files.bannerImage) {
          updateData.bannerImage = getFileUrl(req, `avatars/${req.files.bannerImage[0].filename}`)
        }
      }

      // Check if username is already taken (if being updated)
      if (username && username !== req.user.username) {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        })

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username already taken",
          })
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          bannerImage: true,
          description: true,
          isCreator: true,
          verified: true,
          channelName: true,
          subscribers: true,
          totalViews: true,
          createdAt: true,
        },
      })

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      })
    }
  },
)

// @route   GET /api/users/me/subscriptions
// @desc    Get user's subscriptions
// @access  Private
router.get("/me/subscriptions", authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: Number.parseInt(limit),
      skip: Number.parseInt(offset),
      include: {
        channel: {
          select: {
            id: true,
            username: true,
            channelName: true,
            profilePicture: true,
            verified: true,
            subscribers: true,
            _count: {
              select: {
                videos: {
                  where: { isPublic: true },
                },
              },
            },
          },
        },
      },
    })

    // Transform data for response
    const transformedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      subscribedAt: sub.createdAt,
      channel: {
        id: sub.channel.id,
        name: sub.channel.channelName || sub.channel.username,
        username: sub.channel.username,
        profilePicture: sub.channel.profilePicture,
        verified: sub.channel.verified,
        subscribers: sub.channel.subscribers,
        videoCount: sub.channel._count.videos,
      },
    }))

    res.json({
      success: true,
      data: transformedSubscriptions,
    })
  } catch (error) {
    console.error("Get subscriptions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
    })
  }
})

// @route   GET /api/users/me/videos
// @desc    Get user's uploaded videos
// @access  Private
router.get("/me/videos", authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0, includePrivate = false } = req.query

    const where = { userId: req.user.id }

    // Include private videos only if requested and user is creator
    if (!includePrivate || !req.user.isCreator) {
      where.isPublic = true
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number.parseInt(limit),
      skip: Number.parseInt(offset),
      include: {
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
      isPublic: video.isPublic,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      commentCount: video._count.comments,
      likeCount: video._count.likes_rel,
    }))

    res.json({
      success: true,
      data: transformedVideos,
    })
  } catch (error) {
    console.error("Get user videos error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    })
  }
})

// @route   GET /api/users/me/watch-history
// @desc    Get user's watch history
// @access  Private
router.get("/me/watch-history", authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query

    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { watchedAt: "desc" },
      take: Number.parseInt(limit),
      skip: Number.parseInt(offset),
      include: {
        video: {
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
          },
        },
      },
    })

    // Transform data for response
    const transformedHistory = watchHistory.map((item) => ({
      id: item.id,
      watchedAt: item.watchedAt,
      watchTime: item.watchTime,
      video: {
        id: item.video.id,
        title: item.video.title,
        description: item.video.description,
        thumbnailUrl: item.video.thumbnailUrl,
        duration: item.video.duration,
        views: item.video.views,
        createdAt: item.video.createdAt,
        channel: {
          id: item.video.user.id,
          name: item.video.user.channelName || item.video.user.username,
          profilePicture: item.video.user.profilePicture,
          verified: item.video.user.verified,
        },
      },
    }))

    res.json({
      success: true,
      data: transformedHistory,
    })
  } catch (error) {
    console.error("Get watch history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch watch history",
    })
  }
})

// @route   POST /api/users/me/watch-history
// @desc    Add video to watch history
// @access  Private
router.post("/me/watch-history", authenticateToken, async (req, res) => {
  try {
    const { videoId, watchTime = 0 } = req.body

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required",
      })
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      })
    }

    // Check if already in watch history
    const existingEntry = await prisma.watchHistory.findFirst({
      where: {
        userId: req.user.id,
        videoId,
      },
    })

    if (existingEntry) {
      // Update existing entry
      await prisma.watchHistory.update({
        where: { id: existingEntry.id },
        data: {
          watchedAt: new Date(),
          watchTime: Number.parseInt(watchTime),
        },
      })
    } else {
      // Create new entry
      await prisma.watchHistory.create({
        data: {
          userId: req.user.id,
          videoId,
          watchTime: Number.parseInt(watchTime),
        },
      })
    }

    res.json({
      success: true,
      message: "Added to watch history",
    })
  } catch (error) {
    console.error("Add to watch history error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add to watch history",
    })
  }
})

module.exports = router

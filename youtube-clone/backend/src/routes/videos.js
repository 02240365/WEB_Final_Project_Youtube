// videos.js - Video routes with proper URL handling
// Handles video upload, retrieval, and management

const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken, requireCreator, optionalAuth } = require("../middleware/auth")
const { uploadVideo, handleUploadError, getFileUrl } = require("../middleware/upload")
const path = require("path")
const fs = require("fs")

const router = express.Router()
const prisma = new PrismaClient()

// @route   GET /api/videos
// @desc    Get videos with optional filtering
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, limit = 20, offset = 0, channelId, sortBy = "createdAt" } = req.query

    console.log("Fetching videos with params:", { category, limit, offset, channelId, sortBy })

    // Build where clause
    const where = {
      isPublic: true,
    }

    if (category && category !== "All") {
      where.category = category
    }

    if (channelId) {
      where.userId = channelId
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

    // Fetch videos
    const videos = await prisma.video.findMany({
      where,
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
            subscribers: true,
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

    console.log(`Found ${videos.length} videos`)

    // Transform data for response
    const transformedVideos = videos.map((video) => {
      // Ensure URLs are properly formatted
      let videoUrl = video.videoUrl
      let thumbnailUrl = video.thumbnailUrl

      // If URLs don't start with http, make them absolute
      if (videoUrl && !videoUrl.startsWith("http")) {
        videoUrl = `${req.protocol}://${req.get("host")}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`
      }

      if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
        thumbnailUrl = `${req.protocol}://${req.get("host")}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`
      }

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl,
        videoUrl,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        dislikes: video.dislikes,
        category: video.category,
        tags: video.tags,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        channelId: video.userId,
        channel: {
          id: video.user.id,
          name: video.user.channelName || video.user.username,
          profilePicture: video.user.profilePicture,
          verified: video.user.verified,
          subscribers: video.user.subscribers,
        },
        commentCount: video._count.comments,
        likeCount: video._count.likes_rel,
      }
    })

    res.json({
      success: true,
      data: transformedVideos,
    })
  } catch (error) {
    console.error("Get videos error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    })
  }
})

// @route   GET /api/videos/:id
// @desc    Get single video by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    console.log("Fetching video by ID:", id)

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
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

    if (!video) {
      console.log("Video not found:", id)
      return res.status(404).json({
        success: false,
        message: "Video not found",
      })
    }

    // Check if video is public or user owns it
    if (!video.isPublic && (!req.user || req.user.id !== video.userId)) {
      return res.status(403).json({
        success: false,
        message: "Video is private",
      })
    }

    // Increment view count (only if not the owner)
    if (!req.user || req.user.id !== video.userId) {
      await prisma.video.update({
        where: { id },
        data: { views: { increment: 1 } },
      })

      // Update total views for channel
      await prisma.user.update({
        where: { id: video.userId },
        data: { totalViews: { increment: 1 } },
      })
    }

    // Ensure URLs are properly formatted
    let videoUrl = video.videoUrl
    let thumbnailUrl = video.thumbnailUrl

    // If URLs don't start with http, make them absolute
    if (videoUrl && !videoUrl.startsWith("http")) {
      videoUrl = `${req.protocol}://${req.get("host")}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`
    }

    if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
      thumbnailUrl = `${req.protocol}://${req.get("host")}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`
    }

    // Transform data for response
    const transformedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl,
      videoUrl,
      duration: video.duration,
      views: video.views + 1, // Include the incremented view
      likes: video.likes,
      dislikes: video.dislikes,
      category: video.category,
      tags: video.tags,
      isPublic: video.isPublic,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      channel: {
        id: video.user.id,
        name: video.user.channelName || video.user.username,
        profilePicture: video.user.profilePicture,
        bannerImage: video.user.bannerImage,
        description: video.user.description,
        verified: video.user.verified,
        subscribers: video.user.subscribers,
        totalViews: video.user.totalViews,
        createdAt: video.user.createdAt,
      },
      commentCount: video._count.comments,
      likeCount: video._count.likes_rel,
    }

    console.log("Returning video data:", {
      id: transformedVideo.id,
      title: transformedVideo.title,
      videoUrl: transformedVideo.videoUrl,
    })

    res.json({
      success: true,
      data: transformedVideo,
    })
  } catch (error) {
    console.error("Get video error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch video",
    })
  }
})

// @route   GET /api/videos/:id/related
// @desc    Get related videos
// @access  Public
router.get("/:id/related", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    // Get the current video to find related ones
    const currentVideo = await prisma.video.findUnique({
      where: { id },
      select: { category: true, tags: true, userId: true },
    })

    if (!currentVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      })
    }

    // Find related videos (same category or similar tags)
    const relatedVideos = await prisma.video.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclude current video
          { isPublic: true },
          {
            OR: [
              { category: currentVideo.category },
              { userId: currentVideo.userId }, // Same channel
            ],
          },
        ],
      },
      take: 10,
      orderBy: { views: "desc" },
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
    })

    // Transform data
    const transformedVideos = relatedVideos.map((video) => {
      // Ensure URLs are properly formatted
      let videoUrl = video.videoUrl
      let thumbnailUrl = video.thumbnailUrl

      if (videoUrl && !videoUrl.startsWith("http")) {
        videoUrl = `${req.protocol}://${req.get("host")}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`
      }

      if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
        thumbnailUrl = `${req.protocol}://${req.get("host")}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`
      }

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl,
        videoUrl,
        duration: video.duration,
        views: video.views,
        createdAt: video.createdAt,
        channel: {
          id: video.user.id,
          name: video.user.channelName || video.user.username,
          profilePicture: video.user.profilePicture,
          verified: video.user.verified,
        },
      }
    })

    res.json({
      success: true,
      data: transformedVideos,
    })
  } catch (error) {
    console.error("Get related videos error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch related videos",
    })
  }
})

// @route   POST /api/videos/upload
// @desc    Upload a new video
// @access  Private (Creator only)
router.post("/upload", authenticateToken, requireCreator, uploadVideo, handleUploadError, async (req, res) => {
  try {
    const { title, description, category, tags, isPublic = true } = req.body

    console.log("Upload request received:", {
      title,
      category,
      files: req.files ? Object.keys(req.files) : "none",
    })

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
      })
    }

    if (!req.files || !req.files.video || req.files.video.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      })
    }

    // Process tags
    let processedTags = []
    if (tags) {
      if (typeof tags === "string") {
        try {
          processedTags = JSON.parse(tags)
        } catch {
          processedTags = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        }
      } else if (Array.isArray(tags)) {
        processedTags = tags
      }
    }

    // Get uploaded files
    const videoFile = req.files.video[0]
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null

    // Generate URLs - store relative paths in database
    const videoUrl = `/uploads/videos/${videoFile.filename}`
    const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null

    console.log("File paths:", {
      videoPath: videoFile.path,
      videoUrl,
      thumbnailPath: thumbnailFile?.path,
      thumbnailUrl,
    })

    // Verify files exist
    if (!fs.existsSync(videoFile.path)) {
      return res.status(500).json({
        success: false,
        message: "Video file was not saved properly",
      })
    }

    // Create video record
    const video = await prisma.video.create({
      data: {
        title,
        description,
        category,
        tags: processedTags,
        videoUrl,
        thumbnailUrl,
        isPublic: Boolean(isPublic),
        userId: req.user.id,
      },
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
    })

    console.log("Video created successfully:", {
      id: video.id,
      videoUrl: video.videoUrl,
      title: video.title,
    })

    // Return absolute URLs in response
    const absoluteVideoUrl = `${req.protocol}://${req.get("host")}${videoUrl}`
    const absoluteThumbnailUrl = thumbnailUrl ? `${req.protocol}://${req.get("host")}${thumbnailUrl}` : null

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl: absoluteThumbnailUrl,
        videoUrl: absoluteVideoUrl,
        category: video.category,
        tags: video.tags,
        isPublic: video.isPublic,
        createdAt: video.createdAt,
        channel: {
          id: video.user.id,
          name: video.user.channelName || video.user.username,
          profilePicture: video.user.profilePicture,
          verified: video.user.verified,
        },
      },
    })
  } catch (error) {
    console.error("Video upload error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to upload video",
    })
  }
})

// @route   POST /api/videos/:id/like
// @desc    Like or unlike a video
// @access  Private
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { isLike } = req.body
    const userId = req.user.id

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id },
    })

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      })
    }

    // Check if user already liked/disliked this video
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId: id,
        },
      },
    })

    if (existingLike) {
      if (existingLike.isLike === isLike) {
        // Remove like/dislike
        await prisma.like.delete({
          where: {
            userId_videoId: {
              userId,
              videoId: id,
            },
          },
        })

        // Update video counts
        if (isLike) {
          await prisma.video.update({
            where: { id },
            data: { likes: { decrement: 1 } },
          })
        } else {
          await prisma.video.update({
            where: { id },
            data: { dislikes: { decrement: 1 } },
          })
        }
      } else {
        // Update existing like/dislike
        await prisma.like.update({
          where: {
            userId_videoId: {
              userId,
              videoId: id,
            },
          },
          data: { isLike },
        })

        // Update video counts
        if (isLike) {
          await prisma.video.update({
            where: { id },
            data: {
              likes: { increment: 1 },
              dislikes: { decrement: 1 },
            },
          })
        } else {
          await prisma.video.update({
            where: { id },
            data: {
              likes: { decrement: 1 },
              dislikes: { increment: 1 },
            },
          })
        }
      }
    } else {
      // Create new like/dislike
      await prisma.like.create({
        data: {
          userId,
          videoId: id,
          isLike,
        },
      })

      // Update video counts
      if (isLike) {
        await prisma.video.update({
          where: { id },
          data: { likes: { increment: 1 } },
        })
      } else {
        await prisma.video.update({
          where: { id },
          data: { dislikes: { increment: 1 } },
        })
      }
    }

    // Get updated video data
    const updatedVideo = await prisma.video.findUnique({
      where: { id },
      select: { likes: true, dislikes: true },
    })

    res.json({
      success: true,
      data: {
        likes: updatedVideo.likes,
        dislikes: updatedVideo.dislikes,
      },
    })
  } catch (error) {
    console.error("Like video error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to like video",
    })
  }
})

module.exports = router

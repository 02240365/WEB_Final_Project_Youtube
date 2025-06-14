// search.js - Search routes
// Handles video and channel search functionality

const express = require("express")
const { prisma } = require("../config/database")
const { optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/search
// @desc    Search for videos and channels
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      q: query,
      type = "video", // 'video', 'channel', or 'all'
      category,
      duration,
      uploadDate,
      sortBy = "relevance",
      limit = 20,
      offset = 0,
    } = req.query

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      })
    }

    const searchTerm = query.trim()
    const results = {}

    // Search videos
    if (type === "video" || type === "all") {
      const videoWhere = {
        isPublic: true,
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { tags: { hasSome: [searchTerm] } },
        ],
      }

      // Add category filter
      if (category && category !== "All") {
        videoWhere.category = category
      }

      // Add duration filter
      if (duration) {
        // This would require storing duration in seconds in the database
        // For now, we'll skip this filter
      }

      // Add upload date filter
      if (uploadDate) {
        const now = new Date()
        let dateFilter

        switch (uploadDate) {
          case "hour":
            dateFilter = new Date(now.getTime() - 60 * 60 * 1000)
            break
          case "today":
            dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case "week":
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case "month":
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case "year":
            dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
        }

        if (dateFilter) {
          videoWhere.createdAt = { gte: dateFilter }
        }
      }

      // Build orderBy clause
      let videoOrderBy = {}
      switch (sortBy) {
        case "upload_date":
          videoOrderBy = { createdAt: "desc" }
          break
        case "view_count":
          videoOrderBy = { views: "desc" }
          break
        case "rating":
          videoOrderBy = { likes: "desc" }
          break
        case "relevance":
        default:
          // For relevance, we'll order by a combination of factors
          videoOrderBy = [{ views: "desc" }, { likes: "desc" }, { createdAt: "desc" }]
          break
      }

      const videos = await prisma.video.findMany({
        where: videoWhere,
        orderBy: videoOrderBy,
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

      // Transform video data
      results.videos = videos.map((video) => ({
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
    }

    // Search channels
    if (type === "channel" || type === "all") {
      const channels = await prisma.user.findMany({
        where: {
          isCreator: true,
          OR: [
            { username: { contains: searchTerm, mode: "insensitive" } },
            { channelName: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        orderBy: [{ subscribers: "desc" }, { totalViews: "desc" }, { createdAt: "desc" }],
        take: type === "all" ? 5 : Number.parseInt(limit),
        skip: type === "all" ? 0 : Number.parseInt(offset),
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

      // Transform channel data
      results.channels = channels.map((channel) => ({
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
    }

    // Return appropriate results based on search type
    let responseData
    if (type === "video") {
      responseData = results.videos || []
    } else if (type === "channel") {
      responseData = results.channels || []
    } else {
      responseData = results
    }

    res.json({
      success: true,
      data: responseData,
      meta: {
        query: searchTerm,
        type,
        totalResults:
          type === "video"
            ? results.videos?.length || 0
            : type === "channel"
              ? results.channels?.length || 0
              : (results.videos?.length || 0) + (results.channels?.length || 0),
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    res.status(500).json({
      success: false,
      message: "Search failed",
    })
  }
})

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get("/suggestions", async (req, res) => {
  try {
    const { q: query } = req.query

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      })
    }

    const searchTerm = query.trim()

    // Get video title suggestions
    const videoSuggestions = await prisma.video.findMany({
      where: {
        isPublic: true,
        title: { contains: searchTerm, mode: "insensitive" },
      },
      select: { title: true },
      take: 5,
      orderBy: { views: "desc" },
    })

    // Get channel name suggestions
    const channelSuggestions = await prisma.user.findMany({
      where: {
        isCreator: true,
        OR: [
          { username: { contains: searchTerm, mode: "insensitive" } },
          { channelName: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      select: {
        channelName: true,
        username: true,
      },
      take: 3,
      orderBy: { subscribers: "desc" },
    })

    // Combine and format suggestions
    const suggestions = [
      ...videoSuggestions.map((v) => v.title),
      ...channelSuggestions.map((c) => c.channelName || c.username),
    ].slice(0, 8) // Limit to 8 suggestions

    res.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error("Search suggestions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get search suggestions",
    })
  }
})

module.exports = router

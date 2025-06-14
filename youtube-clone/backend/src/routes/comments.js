// comments.js - Comment routes
// Handles video comments and replies

const express = require("express")
const { prisma } = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/videos/:videoId/comments
// @desc    Get comments for a video
// @access  Public
router.get("/videos/:videoId/comments", optionalAuth, async (req, res) => {
  try {
    const { videoId } = req.params
    const { limit = 20, offset = 0 } = req.query

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

    // Get comments (only top-level comments, not replies)
    const comments = await prisma.comment.findMany({
      where: {
        videoId,
        parentId: null, // Only top-level comments
      },
      orderBy: { createdAt: "desc" },
      take: Number.parseInt(limit),
      skip: Number.parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            verified: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
                verified: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          take: 3, // Limit replies shown initially
        },
        _count: {
          select: { replies: true },
        },
      },
    })

    // Transform data for response
    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      text: comment.text,
      likes: comment.likes,
      dislikes: comment.dislikes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        text: reply.text,
        likes: reply.likes,
        dislikes: reply.dislikes,
        createdAt: reply.createdAt,
        user: reply.user,
      })),
      replyCount: comment._count.replies,
    }))

    res.json({
      success: true,
      data: transformedComments,
    })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    })
  }
})

// @route   POST /api/videos/:videoId/comments
// @desc    Add a comment to a video
// @access  Private
router.post("/videos/:videoId/comments", authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.params
    const { text, parentId } = req.body

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      })
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 1000 characters",
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

    // If this is a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment || parentComment.videoId !== videoId) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        })
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId: req.user.id,
        videoId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            verified: true,
          },
        },
      },
    })

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        id: comment.id,
        text: comment.text,
        likes: comment.likes,
        dislikes: comment.dislikes,
        createdAt: comment.createdAt,
        user: comment.user,
        parentId: comment.parentId,
      },
    })
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    })
  }
})

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (Owner only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      })
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be less than 1000 characters",
      })
    }

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      })
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        text: text.trim(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            verified: true,
          },
        },
      },
    })

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    })
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    })
  }
})

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (Owner only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      })
    }

    // Delete comment (this will also delete replies due to cascade)
    await prisma.comment.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    })
  }
})

// @route   GET /api/comments/:id/replies
// @desc    Get replies for a comment
// @access  Public
router.get("/:id/replies", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 10, offset = 0 } = req.query

    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Get replies
    const replies = await prisma.comment.findMany({
      where: { parentId: id },
      orderBy: { createdAt: "asc" },
      take: Number.parseInt(limit),
      skip: Number.parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
            verified: true,
          },
        },
      },
    })

    res.json({
      success: true,
      data: replies,
    })
  } catch (error) {
    console.error("Get replies error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
    })
  }
})

module.exports = router

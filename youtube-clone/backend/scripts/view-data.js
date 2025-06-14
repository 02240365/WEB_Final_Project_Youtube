// view-data.js - Database data viewer
// Shows current state of all tables with detailed information

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function viewDatabaseData() {
  try {
    console.log("🔍 YouTube Clone Database Data Viewer")
    console.log("=====================================\n")

    // Users
    console.log("👥 USERS:")
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isCreator: true,
        channelName: true,
        subscribers: true,
        verified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    users.forEach((user) => {
      console.log(`  • ${user.username} (${user.email})`)
      console.log(`    Name: ${user.firstName} ${user.lastName}`)
      console.log(`    Creator: ${user.isCreator ? "Yes" : "No"}`)
      if (user.isCreator) {
        console.log(`    Channel: ${user.channelName}`)
        console.log(`    Subscribers: ${user.subscribers}`)
      }
      console.log(`    Verified: ${user.verified ? "Yes" : "No"}`)
      console.log(`    Created: ${user.createdAt.toLocaleDateString()}`)
      console.log()
    })

    // Videos
    console.log("🎥 VIDEOS:")
    const videos = await prisma.video.findMany({
      include: {
        user: {
          select: {
            username: true,
            channelName: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes_rel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    videos.forEach((video) => {
      console.log(`  • "${video.title}"`)
      console.log(`    Channel: ${video.user.channelName || video.user.username}`)
      console.log(`    Category: ${video.category}`)
      console.log(`    Views: ${video.views}`)
      console.log(`    Likes: ${video.likes}`)
      console.log(`    Comments: ${video._count.comments}`)
      console.log(`    Duration: ${video.duration || "N/A"}`)
      console.log(`    Public: ${video.isPublic ? "Yes" : "No"}`)
      console.log(`    Created: ${video.createdAt.toLocaleDateString()}`)
      console.log(`    Video URL: ${video.videoUrl}`)
      console.log()
    })

    // Comments
    console.log("💬 COMMENTS:")
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        video: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    comments.forEach((comment) => {
      console.log(`  • ${comment.user.username}: "${comment.text}"`)
      console.log(`    Video: "${comment.video.title}"`)
      console.log(`    Likes: ${comment.likes}`)
      console.log(`    Created: ${comment.createdAt.toLocaleDateString()}`)
      console.log()
    })

    // Subscriptions
    console.log("🔔 SUBSCRIPTIONS:")
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        channel: {
          select: {
            username: true,
            channelName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    subscriptions.forEach((sub) => {
      console.log(`  • ${sub.user.username} → ${sub.channel.channelName || sub.channel.username}`)
      console.log(`    Subscribed: ${sub.createdAt.toLocaleDateString()}`)
      console.log()
    })

    // Likes
    console.log("👍 LIKES:")
    const likes = await prisma.like.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        video: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    likes.forEach((like) => {
      console.log(`  • ${like.user.username} ${like.isLike ? "👍" : "👎"} "${like.video.title}"`)
      console.log(`    Created: ${like.createdAt.toLocaleDateString()}`)
      console.log()
    })

    // Summary
    console.log("📊 SUMMARY:")
    console.log(`  Users: ${users.length}`)
    console.log(`  Videos: ${videos.length}`)
    console.log(`  Comments: ${comments.length}`)
    console.log(`  Subscriptions: ${subscriptions.length}`)
    console.log(`  Likes: ${likes.length}`)
  } catch (error) {
    console.error("❌ Error viewing database data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

viewDatabaseData()

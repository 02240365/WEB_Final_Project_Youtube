// seed.js - Database seeder
// Creates initial data for the application

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  // Clear existing data
  console.log("Clearing existing data...")
  await prisma.watchHistory.deleteMany({})
  await prisma.playlistItem.deleteMany({})
  await prisma.playlist.deleteMany({})
  await prisma.like.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.video.deleteMany({})
  await prisma.subscription.deleteMany({})
  await prisma.refreshToken.deleteMany({})
  await prisma.user.deleteMany({})

  console.log("Creating test users...")

  // Create test users
  const hashedPassword = await bcrypt.hash("password123", 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      isCreator: true,
      verified: true,
      channelName: "Admin Channel",
      profilePicture: "/uploads/avatars/default-avatar.png",
      description: "This is the admin user account",
    },
  })

  // Create content creator
  const creator = await prisma.user.create({
    data: {
      email: "creator@example.com",
      username: "creator",
      firstName: "Content",
      lastName: "Creator",
      password: hashedPassword,
      isCreator: true,
      verified: true,
      channelName: "Amazing Content",
      profilePicture: "/uploads/avatars/default-avatar.png",
      description: "I create amazing content!",
    },
  })

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      username: "regularuser",
      firstName: "Regular",
      lastName: "User",
      password: hashedPassword,
      isCreator: false,
      profilePicture: "/uploads/avatars/default-avatar.png",
    },
  })

  console.log("Creating test videos...")

  // Create test videos
  const video1 = await prisma.video.create({
    data: {
      title: "Getting Started with YouTube Clone",
      description: "Learn how to use this amazing YouTube clone application!",
      thumbnailUrl: "/uploads/thumbnails/default-thumbnail.jpg",
      videoUrl: "/uploads/videos/sample-video.mp4",
      duration: "10:30",
      category: "Education",
      tags: ["tutorial", "youtube", "clone"],
      userId: creator.id,
    },
  })

  const video2 = await prisma.video.create({
    data: {
      title: "Awesome Coding Tutorial",
      description: "Learn how to code with this comprehensive tutorial",
      thumbnailUrl: "/uploads/thumbnails/default-thumbnail.jpg",
      videoUrl: "/uploads/videos/sample-video.mp4",
      duration: "15:45",
      category: "Education",
      tags: ["coding", "programming", "tutorial"],
      userId: creator.id,
    },
  })

  console.log("Creating test comments...")

  // Create test comments
  await prisma.comment.create({
    data: {
      text: "Great video! Very helpful.",
      userId: user.id,
      videoId: video1.id,
    },
  })

  await prisma.comment.create({
    data: {
      text: "Thanks for sharing this!",
      userId: admin.id,
      videoId: video1.id,
    },
  })

  console.log("Creating test subscriptions...")

  // Create test subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      channelId: creator.id,
    },
  })

  console.log("Creating test likes...")

  // Create test likes
  await prisma.like.create({
    data: {
      userId: user.id,
      videoId: video1.id,
      isLike: true,
    },
  })

  await prisma.like.create({
    data: {
      userId: admin.id,
      videoId: video1.id,
      isLike: true,
    },
  })

  console.log("Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

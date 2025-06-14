// seed-demo-data.js - Adds 100 playable demo videos to the database
// Run with: node scripts/seed-demo-data.js

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

// Video categories
const categories = [
  "Music",
  "Gaming",
  "News",
  "Sports",
  "Entertainment",
  "Education",
  "Science & Technology",
  "Comedy",
  "Movies",
  "Anime",
  "Cooking",
  "Travel",
  "Fashion",
  "Fitness",
  "Technology",
]

// Expanded video titles by category (more titles for variety)
const videoTitlesByCategory = {
  Music: [
    "Top 10 Songs of 2024",
    "Guitar Tutorial for Beginners",
    "Piano Masterclass",
    "Music Theory Explained",
    "Live Concert Highlights",
    "How to Mix and Master Your Tracks",
    "Vocal Training Exercises",
    "History of Rock Music",
    "Electronic Music Production Tips",
    "Jazz Improvisation Techniques",
    "Coding Music: Lo-Fi Hip Hop Mix",
    "Electronic Music for Productivity",
    "Best Acoustic Guitar Songs",
    "Music Production Software Review",
    "Classical Music for Studying",
    "Hip Hop Beat Making Tutorial",
    "Singing Techniques for Beginners",
    "Music Industry Insights",
    "Instrument Maintenance Guide",
    "Sound Design Fundamentals",
  ],
  Gaming: [
    "Minecraft Building Tips",
    "Fortnite Pro Strategies",
    "League of Legends Champion Guide",
    "Gaming PC Build Guide 2024",
    "Speedrun Techniques Explained",
    "Top 10 RPGs of All Time",
    "How to Stream on Twitch",
    "Gaming Mouse and Keyboard Review",
    "Valorant Aim Training",
    "Retro Gaming Collection Tour",
    "Building a Game with JavaScript",
    "Unity Game Development Tutorial",
    "Mobile Gaming Tips and Tricks",
    "Console vs PC Gaming Debate",
    "Game Design Principles",
    "Esports Career Guide",
    "Gaming Setup Tour",
    "Indie Game Recommendations",
    "VR Gaming Experience",
    "Game Review: Latest Releases",
  ],
  News: [
    "Breaking News: Tech Industry Updates",
    "Weekly News Roundup",
    "Financial Market Analysis",
    "Political Developments Explained",
    "Environmental News Report",
    "Science Breakthroughs This Week",
    "Global Affairs Update",
    "Local Community News",
    "Business Trends Analysis",
    "Health and Wellness News",
    "Economic Forecast 2024",
    "Climate Change Updates",
    "Technology Policy Changes",
    "International Relations Brief",
    "Market Watch: Stock Analysis",
  ],
  Sports: [
    "Football Highlights 2024",
    "Basketball Training Drills",
    "Tennis Technique Breakdown",
    "Olympic Games Preview",
    "Sports Nutrition Guide",
    "Athlete Interview Series",
    "Soccer Skills Tutorial",
    "Fitness Challenge for Athletes",
    "Sports Psychology Tips",
    "Extreme Sports Compilation",
    "Baseball Strategy Analysis",
    "Swimming Technique Guide",
    "Marathon Training Plan",
    "Sports Equipment Review",
    "Team Building Exercises",
  ],
  Entertainment: [
    "Movie Trailer Breakdown",
    "Celebrity Interview",
    "Behind the Scenes: TV Show Production",
    "Top 10 Netflix Series",
    "Red Carpet Fashion Review",
    "Film Analysis and Theory",
    "Upcoming Movie Releases",
    "TV Show Easter Eggs You Missed",
    "Actor Transformation for Roles",
    "Award Show Highlights",
    "Top 10 Programming Memes of 2024",
    "Developer Life: Expectations vs Reality",
    "Comedy Show Highlights",
    "Music Video Analysis",
    "Pop Culture Trends",
  ],
  Education: [
    "How to Study Effectively",
    "Mathematics Made Easy",
    "History of Ancient Civilizations",
    "Language Learning Tips",
    "Science Experiments for Kids",
    "College Application Guide",
    "Critical Thinking Skills",
    "Educational Technology Review",
    "Study With Me: Productivity Session",
    "Academic Writing Tips",
    "Data Structures and Algorithms Masterclass",
    "Machine Learning Fundamentals",
    "Database Design Best Practices",
    "Physics Concepts Explained",
    "Chemistry Lab Experiments",
    "Biology Study Guide",
    "Literature Analysis Techniques",
    "Online Learning Strategies",
    "Test Preparation Methods",
    "Research Paper Writing",
  ],
  "Science & Technology": [
    "Artificial Intelligence Explained",
    "Space Exploration Updates",
    "Quantum Computing Basics",
    "Smartphone Review 2024",
    "Future Technology Predictions",
    "Robotics Innovation Showcase",
    "Coding Tutorial for Beginners",
    "Tech Industry Analysis",
    "Science Behind Everyday Things",
    "Renewable Energy Technologies",
    "Cybersecurity Best Practices",
    "Cloud Computing Explained",
    "Internet of Things (IoT) Guide",
    "Blockchain Technology Overview",
    "Virtual Reality Applications",
  ],
  Comedy: [
    "Stand-up Comedy Special",
    "Funny Moments Compilation",
    "Comedy Sketch: Office Life",
    "Improv Comedy Show",
    "Pranks Gone Right",
    "Comedy Movie Review",
    "Humorous Take on Current Events",
    "Comedy Writing Workshop",
    "Bloopers and Outtakes",
    "Satirical News Report",
    "Funny Animal Videos",
    "Comedy Gaming Moments",
    "Parody Music Videos",
    "Meme Review Session",
    "Comedy Podcast Highlights",
  ],
  Movies: [
    "Film Review: Latest Blockbuster",
    "Top 10 Action Movies",
    "Classic Films You Must Watch",
    "Director's Commentary Analysis",
    "Movie Making Process Explained",
    "Film Theory: Plot Holes Explained",
    "Oscar-Winning Movies Breakdown",
    "Independent Film Showcase",
    "Visual Effects Breakdown",
    "Character Analysis: Iconic Movie Roles",
    "Horror Movie Recommendations",
    "Romantic Comedy Classics",
    "Sci-Fi Movie Evolution",
    "Documentary Film Reviews",
    "Foreign Film Appreciation",
  ],
  Anime: [
    "Anime Review: New Releases",
    "Top 10 Anime Series of All Time",
    "Anime Drawing Tutorial",
    "Manga to Anime Adaptation Comparison",
    "Voice Actor Interview",
    "Anime Music Video Compilation",
    "Anime Convention Highlights",
    "Anime Theory: Hidden Meanings",
    "Cosplay Tutorial: Anime Characters",
    "History of Anime: Evolution and Impact",
    "Anime Recommendation Guide",
    "Japanese Culture in Anime",
    "Anime Art Style Analysis",
    "Studio Ghibli Film Review",
    "Anime Soundtrack Appreciation",
  ],
  Cooking: [
    "Easy 30-Minute Meals",
    "Baking Perfect Bread",
    "International Cuisine: Italian Pasta",
    "Dessert Recipes for Beginners",
    "Cooking Techniques Masterclass",
    "Healthy Meal Prep for the Week",
    "Vegan Recipe Ideas",
    "Chef's Secret Recipes Revealed",
    "Kitchen Gadget Review",
    "Food Photography Tips",
    "Grilling and BBQ Techniques",
    "Asian Cooking Fundamentals",
    "Breakfast Recipe Collection",
    "Holiday Cooking Specials",
    "Food Safety Guidelines",
  ],
  Travel: [
    "Hidden Gems in Europe",
    "Budget Travel Tips",
    "Luxury Resort Tour",
    "Backpacking Adventure: Southeast Asia",
    "Travel Photography Guide",
    "City Guide: New York",
    "Road Trip Essentials",
    "Best Street Food Around the World",
    "Travel Vlog: Island Paradise",
    "Cultural Experiences: Local Traditions",
    "Solo Travel Safety Tips",
    "Travel Gear Reviews",
    "Digital Nomad Lifestyle",
    "Adventure Travel Destinations",
    "Travel Planning Strategies",
  ],
  Fashion: [
    "Spring Fashion Trends 2024",
    "Capsule Wardrobe Guide",
    "Sustainable Fashion Brands",
    "Men's Style Essentials",
    "Fashion Week Highlights",
    "Thrift Shopping Tips",
    "Designer Collection Review",
    "Outfit Ideas for Every Occasion",
    "Fashion History: Iconic Styles",
    "Makeup Tutorial: Everyday Look",
    "Accessory Styling Guide",
    "Fashion Photography Tips",
    "Personal Style Development",
    "Fashion Industry Insights",
    "Seasonal Wardrobe Updates",
  ],
  Fitness: [
    "Full Body Workout at Home",
    "30-Day Fitness Challenge",
    "Yoga for Beginners",
    "Weight Training Fundamentals",
    "Cardio Exercises for Fat Loss",
    "Nutrition Guide for Athletes",
    "Morning Routine for Energy",
    "Fitness Equipment Review",
    "Recovery Techniques for Athletes",
    "Mental Health and Exercise",
    "HIIT Workout Routines",
    "Flexibility and Stretching",
    "Bodyweight Exercise Guide",
    "Fitness Motivation Tips",
    "Injury Prevention Strategies",
  ],
  Technology: [
    "React 18 New Features Explained",
    "Building Scalable Node.js Applications",
    "TypeScript for Beginners",
    "Web Development Best Practices",
    "Mobile App Development Guide",
    "DevOps and CI/CD Pipeline",
    "API Design Principles",
    "Frontend Framework Comparison",
    "Backend Architecture Patterns",
    "Software Testing Strategies",
    "Code Review Best Practices",
    "Performance Optimization Tips",
    "Security in Web Development",
    "Open Source Contribution Guide",
    "Tech Career Advice",
  ],
}

// Sample channel names (expanded)
const channelNames = [
  "Tech Explorers",
  "Creative Minds",
  "Fitness Journey",
  "Cooking Masters",
  "Gaming Universe",
  "Travel Diaries",
  "Music Studio",
  "Science Lab",
  "Movie Critics",
  "News Network",
  "Fashion Forward",
  "Sports Center",
  "Educational Hub",
  "Comedy Club",
  "Anime World",
  "Tech Guru",
  "Coding Master",
  "Design Pro",
  "Music Lover",
  "Gamer Zone",
  "Fitness Pro",
  "Food Network",
  "Travel Guide",
  "Style Expert",
  "Science Today",
  "Comedy Central",
  "Movie Buff",
  "Anime Central",
  "Learning Hub",
  "Tech Review",
]

// Collection of free sample videos that are actually playable (expanded with variations)
const sampleVideos = [
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    title: "Big Buck Bunny",
    duration: "9:56",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    title: "Elephant Dream",
    duration: "10:53",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    title: "For Bigger Blazes",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    title: "For Bigger Escape",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
    title: "For Bigger Fun",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
    title: "For Bigger Joyrides",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg",
    title: "For Bigger Meltdowns",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
    title: "Sintel",
    duration: "14:48",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg",
    title: "Subaru Outback On Street And Dirt",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    title: "Tears of Steel",
    duration: "12:14",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg",
    title: "Volkswagen GTI Review",
    duration: "0:20",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg",
    title: "We Are Going On Bullrun",
    duration: "0:15",
  },
  {
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    thumbnail: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg",
    title: "What Car Can You Get For A Grand?",
    duration: "0:15",
  },
]

// Generate random date within the last year
function generateRandomDate() {
  const now = new Date()
  const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000)
  return pastDate
}

// Generate random tags based on category
function generateRandomTags(category) {
  const commonTags = ["trending", "viral", "2024", "recommended", "popular", "new", "must-watch"]
  const categoryTags = {
    Music: ["song", "artist", "album", "concert", "band", "playlist", "instrument", "lyrics", "melody", "rhythm"],
    Gaming: [
      "gameplay",
      "walkthrough",
      "review",
      "esports",
      "strategy",
      "multiplayer",
      "console",
      "pc",
      "mobile",
      "indie",
    ],
    News: [
      "breaking",
      "report",
      "analysis",
      "interview",
      "politics",
      "economy",
      "global",
      "local",
      "update",
      "current",
    ],
    Sports: [
      "highlights",
      "game",
      "athlete",
      "team",
      "tournament",
      "championship",
      "training",
      "fitness",
      "competition",
      "skills",
    ],
    Entertainment: [
      "movie",
      "tv",
      "celebrity",
      "behind the scenes",
      "review",
      "trailer",
      "episode",
      "show",
      "drama",
      "comedy",
    ],
    Education: [
      "tutorial",
      "lesson",
      "course",
      "study",
      "academic",
      "learning",
      "school",
      "university",
      "knowledge",
      "skills",
    ],
    "Science & Technology": [
      "tech",
      "innovation",
      "research",
      "gadget",
      "review",
      "future",
      "experiment",
      "discovery",
      "AI",
      "space",
    ],
    Comedy: ["funny", "laugh", "joke", "prank", "stand-up", "humor", "parody", "sketch", "meme", "entertainment"],
    Movies: ["film", "cinema", "director", "actor", "scene", "review", "trailer", "analysis", "blockbuster", "indie"],
    Anime: ["manga", "episode", "series", "character", "animation", "review", "japanese", "otaku", "cosplay", "studio"],
    Cooking: ["recipe", "food", "chef", "kitchen", "meal", "ingredients", "baking", "cuisine", "cooking", "delicious"],
    Travel: [
      "destination",
      "guide",
      "adventure",
      "vacation",
      "tour",
      "explore",
      "vlog",
      "culture",
      "journey",
      "wanderlust",
    ],
    Fashion: [
      "style",
      "trend",
      "outfit",
      "design",
      "model",
      "collection",
      "accessories",
      "fashion",
      "beauty",
      "runway",
    ],
    Fitness: [
      "workout",
      "exercise",
      "training",
      "health",
      "gym",
      "routine",
      "body",
      "nutrition",
      "wellness",
      "strength",
    ],
    Technology: [
      "coding",
      "javascript",
      "nodejs",
      "typescript",
      "react",
      "programming",
      "development",
      "software",
      "web",
      "app",
    ],
  }

  // Get category-specific tags or use common tags if category not found
  const specificTags = categoryTags[category] || commonTags

  // Select 3-6 random tags
  const numTags = Math.floor(Math.random() * 4) + 3
  const selectedTags = []

  // Add at least one category-specific tag
  selectedTags.push(specificTags[Math.floor(Math.random() * specificTags.length)])

  // Add common tags and category tags
  while (selectedTags.length < numTags) {
    const allTags = [...commonTags, ...specificTags]
    const tag = allTags[Math.floor(Math.random() * allTags.length)]
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag)
    }
  }

  return selectedTags
}

// Generate random description based on title and category
function generateDescription(title, category) {
  const intros = [
    "In this video, we explore",
    "Check out this amazing",
    "Learn all about",
    "Welcome to our guide on",
    "Discover the secrets of",
    "Everything you need to know about",
    "Join us for an exciting",
    "We're back with another",
    "Today we're diving into",
    "Get ready to learn about",
  ]

  const middles = [
    "This comprehensive guide covers",
    "We'll show you step by step",
    "You'll discover how to",
    "Learn the best techniques for",
    "Master the art of",
    "Unlock the potential of",
    "Explore the world of",
    "Dive deep into",
  ]

  const outros = [
    "Don't forget to like and subscribe!",
    "Let us know your thoughts in the comments below.",
    "Thanks for watching!",
    "Stay tuned for more content like this.",
    "Share this with someone who needs to see it!",
    "Follow us for weekly uploads.",
    "Check out our other videos for more tips.",
    "Hit the notification bell for updates!",
    "What would you like to see next?",
    "Subscribe for more amazing content!",
  ]

  const intro = intros[Math.floor(Math.random() * intros.length)]
  const middle = middles[Math.floor(Math.random() * middles.length)]
  const outro = outros[Math.floor(Math.random() * outros.length)]

  return `${intro} ${title.toLowerCase()}. ${middle} ${category.toLowerCase()} in detail. We've put together the best information and tips to help you master this topic. ${outro}`
}

async function main() {
  console.log("Starting to seed 100 playable demo videos...")

  try {
    // Get existing users (creators)
    let users = await prisma.user.findMany({
      where: {
        isCreator: true,
      },
    })

    if (users.length === 0) {
      console.log("No creator users found. Creating creator accounts...")

      // Create 10 creator accounts for variety
      for (let i = 0; i < 10; i++) {
        const channelName = channelNames[i % channelNames.length]
        await prisma.user.create({
          data: {
            email: `creator${i}@example.com`,
            username: `creator${i}`,
            firstName: "Content",
            lastName: `Creator ${i}`,
            password: "$2a$12$k8Y1THPAC6aHvH.gx9YYaOTqf/U.79Rrje79ICyJJWNrWG9X.Zf0q", // password123
            isCreator: true,
            verified: Math.random() > 0.3, // 70% chance of being verified
            channelName: `${channelName}`,
            profilePicture: "/uploads/avatars/default-avatar.png",
            description: `Welcome to ${channelName}! We create amazing content about various topics. Subscribe for regular updates and quality content!`,
          },
        })
      }

      // Get the newly created users
      users = await prisma.user.findMany({
        where: {
          isCreator: true,
        },
      })

      console.log(`Created ${users.length} creator accounts.`)
    }

    // Ensure we have at least 10 creators
    const creators = [...users]
    if (creators.length < 10) {
      console.log("Creating additional creator accounts...")

      for (let i = creators.length; i < 10; i++) {
        const channelName = channelNames[i % channelNames.length]
        const newCreator = await prisma.user.create({
          data: {
            email: `creator${i}@example.com`,
            username: `creator${i}`,
            firstName: "Content",
            lastName: `Creator ${i}`,
            password: "$2a$12$k8Y1THPAC6aHvH.gx9YYaOTqf/U.79Rrje79ICyJJWNrWG9X.Zf0q", // password123
            isCreator: true,
            verified: Math.random() > 0.3,
            channelName: `${channelName}`,
            profilePicture: "/uploads/avatars/default-avatar.png",
            description: `Welcome to ${channelName}! We create amazing content about various topics.`,
          },
        })

        creators.push(newCreator)
      }

      console.log(`Now have ${creators.length} creator accounts.`)
    }

    // Clear existing videos and comments to avoid duplicates
    console.log("Clearing existing videos and comments...")
    await prisma.comment.deleteMany({})
    await prisma.video.deleteMany({})
    console.log("Existing videos and comments cleared.")

    // Create exactly 100 videos
    console.log("Creating 100 playable videos...")

    let totalVideosCreated = 0
    let sampleVideoIndex = 0

    // Calculate videos per category to reach 100 total
    const videosPerCategory = Math.floor(100 / categories.length)
    const extraVideos = 100 % categories.length

    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      const category = categories[categoryIndex]
      const titles = videoTitlesByCategory[category] || [`Amazing ${category} Video`]

      // Determine number of videos for this category
      let numVideos = videosPerCategory
      if (categoryIndex < extraVideos) {
        numVideos += 1 // Distribute extra videos to first few categories
      }

      console.log(`Creating ${numVideos} videos for category: ${category}`)

      for (let i = 0; i < numVideos; i++) {
        // Select random title and creator
        const title = titles[Math.floor(Math.random() * titles.length)]
        const creator = creators[Math.floor(Math.random() * creators.length)]

        // Get a sample video (cycling through the available ones)
        const sampleVideo = sampleVideos[sampleVideoIndex % sampleVideos.length]
        sampleVideoIndex++

        // Generate unique video title
        const uniqueTitle = `${title} - ${category} Edition ${i + 1}`

        // Generate video data
        const video = await prisma.video.create({
          data: {
            title: uniqueTitle,
            description: generateDescription(title, category),
            thumbnailUrl: sampleVideo.thumbnail,
            videoUrl: sampleVideo.url,
            duration: sampleVideo.duration,
            category,
            tags: generateRandomTags(category),
            userId: creator.id,
            views: Math.floor(Math.random() * 500000), // Up to 500K views
            likes: Math.floor(Math.random() * 25000), // Up to 25K likes
            createdAt: generateRandomDate(),
            updatedAt: new Date(),
            isPublic: true,
          },
        })

        totalVideosCreated++

        // Add random number of comments to each video (1-8 comments)
        const numComments = Math.floor(Math.random() * 8) + 1

        for (let j = 0; j < numComments; j++) {
          // Get random user for comment
          const commentUser = creators[Math.floor(Math.random() * creators.length)]

          const commentTexts = [
            "Great video! Really enjoyed it.",
            "Thanks for sharing this information.",
            "I learned a lot from this video.",
            "Can you make more content like this?",
            "This is exactly what I was looking for!",
            "Very well explained, thanks!",
            "I've been waiting for content like this.",
            "Subscribed! Looking forward to more videos.",
            "This helped me understand the topic better.",
            "Amazing production quality!",
            "Keep up the great work!",
            "This deserves more views!",
            "Fantastic content as always.",
            "Could you do a follow-up video?",
            "Best explanation I've seen on this topic.",
            "Your channel is underrated!",
            "Thanks for the detailed tutorial.",
            "This video made my day!",
            "Please make more videos like this.",
            "Excellent work, very informative!",
          ]

          await prisma.comment.create({
            data: {
              text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
              userId: commentUser.id,
              videoId: video.id,
              createdAt: new Date(video.createdAt.getTime() + Math.random() * (Date.now() - video.createdAt.getTime())),
            },
          })
        }

        // Log progress every 10 videos
        if (totalVideosCreated % 10 === 0) {
          console.log(`Progress: ${totalVideosCreated}/100 videos created...`)
        }
      }
    }

    console.log(`🎉 Successfully created ${totalVideosCreated} playable videos with comments!`)
    console.log(`📊 Distribution across ${categories.length} categories`)
    console.log(`👥 Using ${creators.length} different creators`)
    console.log(`🎬 All videos have real, playable video URLs and thumbnails`)

    // Display summary
    const videoCount = await prisma.video.count()
    const commentCount = await prisma.comment.count()
    const userCount = await prisma.user.count({ where: { isCreator: true } })

    console.log("\n📈 Final Statistics:")
    console.log(`- Total Videos: ${videoCount}`)
    console.log(`- Total Comments: ${commentCount}`)
    console.log(`- Total Creators: ${userCount}`)
    console.log(`- Average Comments per Video: ${Math.round(commentCount / videoCount)}`)
  } catch (error) {
    console.error("Error seeding demo data:", error)
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

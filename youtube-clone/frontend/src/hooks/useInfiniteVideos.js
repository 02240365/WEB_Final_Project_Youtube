import { useInfiniteQuery } from "@tanstack/react-query"

// Mock data for fallback when API is not available
const mockVideos = [
  {
    id: 1,
    title: "Getting Started with React Hooks",
    description: "Learn the basics of React Hooks in this comprehensive tutorial",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "15:30",
    views: 125000,
    uploadedAt: "2024-01-15T10:00:00Z",
    channel: {
      id: 1,
      name: "React Academy",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Education",
  },
  {
    id: 2,
    title: "JavaScript ES6 Features Explained",
    description: "Explore the latest JavaScript ES6 features with practical examples",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "22:45",
    views: 89000,
    uploadedAt: "2024-01-14T14:30:00Z",
    channel: {
      id: 2,
      name: "JS Masters",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Technology",
  },
  {
    id: 3,
    title: "Building a REST API with Node.js",
    description: "Step-by-step guide to creating a REST API using Node.js and Express",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "35:20",
    views: 156000,
    uploadedAt: "2024-01-13T09:15:00Z",
    channel: {
      id: 3,
      name: "Backend Basics",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Technology",
  },
  {
    id: 4,
    title: "CSS Grid Layout Masterclass",
    description: "Master CSS Grid Layout with this comprehensive tutorial",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "28:10",
    views: 73000,
    uploadedAt: "2024-01-12T16:45:00Z",
    channel: {
      id: 4,
      name: "CSS Wizards",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Education",
  },
  {
    id: 5,
    title: "Python Data Science Fundamentals",
    description: "Introduction to data science using Python and popular libraries",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "42:30",
    views: 198000,
    uploadedAt: "2024-01-11T11:20:00Z",
    channel: {
      id: 5,
      name: "Data Science Hub",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Education",
  },
]

/**
 * Custom hook for fetching videos with infinite scrolling
 * @param {string} category - Video category filter
 * @returns {Object} - TanStack Query result object
 */
export function useInfiniteVideos(category = "all") {
  return useInfiniteQuery({
    queryKey: ["videos", category],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`Fetching videos: category=${category}, offset=${pageParam}, limit=12`)

      try {
        // Try to fetch from API
        const response = await fetch(`/api/videos?page=${pageParam}&limit=12&category=${category}`)

        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error("Error fetching videos, using mock data:", error)

        // Fallback to mock data if API fails
        const limit = 12
        const start = pageParam * limit
        const end = start + limit
        const paginatedMockVideos = mockVideos.slice(start, end)

        // Add more mock videos if we need them for pagination
        const totalMockVideos = []
        for (let i = 0; i < 50; i++) {
          mockVideos.forEach((video, index) => {
            totalMockVideos.push({
              ...video,
              id: video.id + i * mockVideos.length,
              title: `${video.title} - Part ${i + 1}`,
              views: video.views + Math.floor(Math.random() * 10000),
            })
          })
        }

        const filteredVideos =
          category === "all"
            ? totalMockVideos.slice(start, end)
            : totalMockVideos
                .filter((video) => video.category.toLowerCase() === category.toLowerCase())
                .slice(start, end)

        return {
          videos: filteredVideos,
          hasMore: end < totalMockVideos.length,
          nextPage: filteredVideos.length === limit ? pageParam + 1 : undefined,
        }
      }
    },
    getNextPageParam: (lastPage) => {
      // Return the next page number if there are more pages
      return lastPage.hasMore ? lastPage.nextPage : undefined
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
  })
}

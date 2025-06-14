"use client"

import { useEffect, useRef } from "react"

const ThumbnailGenerator = ({ width = 240, height = 135, title = "", videoId = "", className = "" }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Generate consistent random colors based on videoId
    const seed = videoId ? videoId.split("").reduce((a, b) => a + b.charCodeAt(0), 0) : Math.random() * 1000

    // Create gradient background
    const gradients = [
      ["#667eea", "#764ba2"],
      ["#f093fb", "#f5576c"],
      ["#4facfe", "#00f2fe"],
      ["#43e97b", "#38f9d7"],
      ["#fa709a", "#fee140"],
      ["#a8edea", "#fed6e3"],
      ["#ff9a9e", "#fecfef"],
      ["#ffecd2", "#fcb69f"],
      ["#ff8a80", "#ea4c89"],
      ["#667eea", "#764ba2"],
    ]

    const gradientIndex = Math.floor(seed) % gradients.length
    const [color1, color2] = gradients[gradientIndex]

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add some geometric shapes for visual interest
    ctx.globalAlpha = 0.2

    // Random circles - smaller for compact thumbnails
    for (let i = 0; i < 2; i++) {
      ctx.beginPath()
      const x = (seed * (i + 1) * 123) % width
      const y = (seed * (i + 1) * 456) % height
      const radius = 10 + ((seed * (i + 1)) % 20)
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.fill()
    }

    ctx.globalAlpha = 1

    // Add smaller play button
    const centerX = width / 2
    const centerY = height / 2
    const playSize = Math.min(width, height) * 0.12

    // Play button background
    ctx.beginPath()
    ctx.arc(centerX, centerY, playSize, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fill()

    // Play triangle
    ctx.beginPath()
    ctx.moveTo(centerX - playSize * 0.3, centerY - playSize * 0.4)
    ctx.lineTo(centerX - playSize * 0.3, centerY + playSize * 0.4)
    ctx.lineTo(centerX + playSize * 0.4, centerY)
    ctx.closePath()
    ctx.fillStyle = "#fff"
    ctx.fill()

    // Add title text if provided - smaller for compact layout
    if (title && width > 150) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
      ctx.fillRect(0, height - 25, width, 25)

      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px Arial"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"

      // Truncate title if too long
      const maxWidth = width - 10
      let displayTitle = title
      if (ctx.measureText(title).width > maxWidth) {
        while (ctx.measureText(displayTitle + "...").width > maxWidth && displayTitle.length > 0) {
          displayTitle = displayTitle.slice(0, -1)
        }
        displayTitle += "..."
      }

      ctx.fillText(displayTitle, 5, height - 12)
    }
  }, [width, height, title, videoId])

  return <canvas ref={canvasRef} className={className} />
}

export default ThumbnailGenerator

"use client"

import { useEffect, useRef } from "react"

const PlaceholderImage = ({ width, height, text, color = "4ecdc4", className }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const dpr = window.devicePixelRatio || 1

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale the canvas back down using CSS
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"

    // Scale the drawing context so everything will work at the higher ratio
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = `#${color}`
    ctx.fillRect(0, 0, width, height)

    // Draw text
    if (text) {
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Calculate font size based on canvas size
      const fontSize = Math.min(width, height) * 0.3
      ctx.font = `bold ${fontSize}px Arial`

      ctx.fillText(text, width / 2, height / 2)
    }
  }, [width, height, text, color])

  return <canvas ref={canvasRef} className={className} />
}

export default PlaceholderImage

"use client"

import { useEffect, useRef} from "react"
import type { SkillRequirement } from "@/types/types"
import { Card } from "@/components/ui/card"

interface SkillRadarChartProps {
  currentSkills: SkillRequirement
  targetSkills: SkillRequirement
  previewSkills?: SkillRequirement // For hover preview
  className?: string
  showLegend?: boolean
}

export function SkillRadarChart({
  currentSkills,
  targetSkills,
  previewSkills,
  className = "",
  showLegend = true,
}: SkillRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // const [dimensions, setDimensions] = useState({ width: 400, height: 400 })

  // Get all unique skills
  const allSkills = Array.from(
    new Set([
      ...Object.keys(currentSkills),
      ...Object.keys(targetSkills),
      ...(previewSkills ? Object.keys(previewSkills) : []),
    ]),
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw concentric circles (grid)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)" // slate-400 with opacity
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw axes and labels
    const numPoints = allSkills.length
    const angleStep = (2 * Math.PI) / numPoints

    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"
    ctx.fillStyle = "rgb(71, 85, 105)" // slate-600
    ctx.font = "11px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    allSkills.forEach((skill, index) => {
      const angle = index * angleStep - Math.PI / 2 // Start from top
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Draw axis line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Draw label outside the circle
      const labelDistance = radius + 30
      const labelX = centerX + labelDistance * Math.cos(angle)
      const labelY = centerY + labelDistance * Math.sin(angle)

      // Adjust text alignment based on position
      if (Math.abs(labelX - centerX) < 5) {
        ctx.textAlign = "center"
      } else if (labelX > centerX) {
        ctx.textAlign = "left"
      } else {
        ctx.textAlign = "right"
      }

      ctx.fillText(skill, labelX, labelY)
    })

    // Helper function to draw polygon
    const drawPolygon = (skills: SkillRequirement, strokeStyle: string, fillStyle: string, lineWidth: number) => {
      ctx.beginPath()

      allSkills.forEach((skill, index) => {
        const value = skills[skill] || 0
        const angle = index * angleStep - Math.PI / 2
        const distance = (radius * value) / 100
        const x = centerX + distance * Math.cos(angle)
        const y = centerY + distance * Math.sin(angle)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.closePath()
      ctx.fillStyle = fillStyle
      ctx.fill()
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = lineWidth
      ctx.stroke()
    }

    // Draw target skills (semi-transparent)
    drawPolygon(
      targetSkills,
      "rgba(99, 102, 241, 0.5)", // indigo-500
      "rgba(99, 102, 241, 0.08)",
      2,
    )

    // Draw preview skills if hovering (more prominent)
    if (previewSkills) {
      drawPolygon(
        previewSkills,
        "rgba(34, 197, 94, 0.8)", // green-500
        "rgba(34, 197, 94, 0.15)",
        2.5,
      )
    }

    // Draw current skills (most prominent)
    drawPolygon(
      currentSkills,
      "rgba(59, 130, 246, 1)", // blue-500
      "rgba(59, 130, 246, 0.2)",
      3,
    )

    // Draw points on current skills
    ctx.fillStyle = "rgb(59, 130, 246)" // blue-500
    allSkills.forEach((skill, index) => {
      const value = currentSkills[skill] || 0
      const angle = index * angleStep - Math.PI / 2
      const distance = (radius * value) / 100
      const x = centerX + distance * Math.cos(angle)
      const y = centerY + distance * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }, [currentSkills, targetSkills, previewSkills, allSkills])

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Your Skill Profile</h3>
            <p className="text-sm text-muted-foreground">Track your progress toward your goal</p>
          </div>

          <div className="relative" style={{ aspectRatio: "1/1" }}>
            <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
          </div>

          {showLegend && (
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Current Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-50" />
                <span>Target Profile</span>
              </div>
              {previewSkills && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>With Selected Course</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

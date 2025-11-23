"use client"

import type { Course } from "@/types/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Zap } from "lucide-react"

interface CourseCardProps {
  course: Course
  isSelected: boolean
  onToggle: () => void
  onHover?: (hovering: boolean) => void
}

export function CourseCard({ course, isSelected, onToggle, onHover }: CourseCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
      onClick={onToggle}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{course.code}</p>
              </div>
              <Badge variant={course.type === "Основной" ? "default" : "secondary"} className="shrink-0">
                {course.type}
              </Badge>
            </div>
            <CardDescription className="text-sm leading-relaxed">{course.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{course.credits} Credits</span>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="text-xs text-muted-foreground">Prerequisites: {course.prerequisites.join(", ")}</div>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-medium">Skills You'll Gain:</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(course.skillsImpact).map(([skill, impact]) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-xs bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950"
                >
                  {skill} +{impact}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

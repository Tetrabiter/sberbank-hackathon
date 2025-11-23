"use client"

import type { SemesterPlan } from "@/types/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock } from "lucide-react"

interface ProgressTimelineProps {
  semesterPlans: SemesterPlan[]
  currentSemester: number
  className?: string
}

export function ProgressTimeline({ semesterPlans, currentSemester, className = "" }: ProgressTimelineProps) {
  const totalSemesters = 4

  // Fill in empty semesters if needed
  const allSemesters = Array.from({ length: totalSemesters }, (_, i) => {
    const semester = i + 1
    return (
      semesterPlans.find((sp) => sp.semester === semester) || {
        semester,
        courses: [],
        completed: false,
      }
    )
  })

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your Journey</h3>
          <p className="text-sm text-muted-foreground">Progress through your Master's degree</p>
        </div>

        <div className="space-y-4">
          {allSemesters.map((plan, index) => {
            const isCompleted = plan.completed
            const isCurrent = plan.semester === currentSemester
            const isFuture = plan.semester > currentSemester

            return (
              <div key={plan.semester} className="flex gap-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-blue-500 text-white"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  {index < allSemesters.length - 1 && <div className="w-0.5 h-full min-h-10 bg-border" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Семестер {plan.semester}</h4>
                    {isCompleted && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                      >
                        Completed
                      </Badge>
                    )}
                    {isCurrent && <Badge className="bg-blue-500">In Progress</Badge>}
                    {isFuture && <Badge variant="secondary">Upcoming</Badge>}
                  </div>

                  {plan.courses.length > 0 ? (
                    <div className="space-y-1">
                      {plan.courses.map((course) => (
                        <div key={course.id} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          {course.name}
                          <Badge variant="outline" className="text-xs">
                            {course.credits} cr
                          </Badge>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground mt-2">
                        Total: {plan.courses.reduce((sum, c) => sum + c.credits, 0)} credits
                      </p>
                    </div>
                  ) : isFuture ? (
                    <p className="text-sm text-muted-foreground">Courses will be recommended based on your progress</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No courses yet</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

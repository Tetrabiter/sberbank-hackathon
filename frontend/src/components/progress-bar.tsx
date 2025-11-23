"use client"

import type { SkillRequirement } from "@/types/types"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SkillProgressBarsProps {
  currentSkills: SkillRequirement
  targetSkills: SkillRequirement
  previewSkills?: SkillRequirement
  className?: string
}

export function SkillProgressBars({
  currentSkills,
  targetSkills,
  previewSkills,
  className = "",
}: SkillProgressBarsProps) {
  // Get all unique skills from target
  const skills = Object.keys(targetSkills).sort()

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Skill Breakdown</h3>
          <p className="text-sm text-muted-foreground">Detailed progress toward each skill requirement</p>
        </div>

        <div className="space-y-4">
          {skills.map((skill) => {
            const current = currentSkills[skill] || 0
            const target = targetSkills[skill]
            const preview = previewSkills?.[skill] || current
            const percentage = (current / target) * 100
            const previewPercentage = (preview / target) * 100

            return (
              <div key={skill} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{skill}</span>
                  <span className="text-muted-foreground">
                    {Math.round(current)} / {target}
                    {preview > current && <span className="text-green-600 ml-1">→ {Math.round(preview)}</span>}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={percentage} className="h-2" />
                  {preview > current && (
                    <div
                      className="absolute top-0 left-0 h-2 bg-green-500/30 rounded-full transition-all"
                      style={{ width: `${Math.min(100, previewPercentage)}%` }}
                    />
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

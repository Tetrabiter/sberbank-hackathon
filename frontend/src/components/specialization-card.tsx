"use client"

import type { Specialization } from "@/types/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign } from "lucide-react"

interface SpecializationCardProps {
  specialization: Specialization
  isSelected?: boolean
  onClick?: () => void
}

export function SpecializationCard({ specialization, isSelected = false, onClick }: SpecializationCardProps) {
  return (
    <Card
      className={`cursor-pointer mt-8 transition-all hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="text-4xl mb-2">{specialization.icon}</div>
          {isSelected && <Badge className="bg-blue-500">Selected</Badge>}
        </div>
        <CardTitle className="text-xl">{specialization.name}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{specialization.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-medium">Marketability:</span>
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${specialization.marketabilityScore}%` }}
              />
            </div>
            <span className="text-muted-foreground">{specialization.marketabilityScore}%</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Avg. Salary:</span>
            <span className="text-muted-foreground">{specialization.avgSalary}</span>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Key Skills Required:</p>
            <div className="flex flex-wrap gap-1">
              {Object.keys(specialization.requiredSkills)
                .slice(0, 5)
                .map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              {Object.keys(specialization.requiredSkills).length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(specialization.requiredSkills).length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

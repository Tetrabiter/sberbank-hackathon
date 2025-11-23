"use client"

import { useState } from "react"
import type { Specialization, StudentProgress } from "@/types/types"
import { specializations } from "@/data/specialization"
import { SpecializationCard } from "@/components/specialization-card"
import { SkillRadarChart } from "@/components/radar-chart"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Info } from "lucide-react"
import { canSwitchSpecialization } from "@/lib/ml-recomender"

interface WhatIfModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentProgress: StudentProgress
  onSwitch?: (newSpecialization: Specialization) => void
}

export function WhatIfModal({ open, onOpenChange, currentProgress, onSwitch }: WhatIfModalProps) {
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof canSwitchSpecialization> | null>(null)

  const handleAnalyze = () => {
    if (!selectedSpec) return

    const totalSemesters = 4 // Master's is typically 4 semesters
    const remainingSemesters = totalSemesters - currentProgress.currentSemester + 1

    const result = canSwitchSpecialization(currentProgress, selectedSpec, remainingSemesters)

    setAnalysisResult(result)
  }

  const handleConfirmSwitch = () => {
    if (selectedSpec && onSwitch) {
      onSwitch(selectedSpec)
      onOpenChange(false)
    }
  }

  const otherSpecializations = specializations.filter((spec) => spec.id !== currentProgress.selectedSpecialization?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">What If I Switch?</DialogTitle>
          <DialogDescription>
            Explore alternative career paths and see if you can pivot with your remaining time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current specialization info */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              You're currently on track to become a <strong>{currentProgress.selectedSpecialization?.name}</strong>.
              You're in semester {currentProgress.currentSemester} of 4.
            </AlertDescription>
          </Alert>

          {/* Specialization selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What would you like to become instead?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {otherSpecializations.map((spec) => (
                <SpecializationCard
                  key={spec.id}
                  specialization={spec}
                  isSelected={selectedSpec?.id === spec.id}
                  onClick={() => {
                    setSelectedSpec(spec)
                    setAnalysisResult(null)
                  }}
                />
              ))}
            </div>
          </div>

          {/* Analysis button */}
          {selectedSpec && !analysisResult && (
            <Button onClick={handleAnalyze} size="lg" className="w-full">
              Analyze Feasibility
            </Button>
          )}

          {/* Analysis results */}
          {analysisResult && selectedSpec && (
            <div className="space-y-4 p-6 bg-secondary/50 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Result summary */}
                <div className="space-y-4">
                  <Alert variant={analysisResult.feasible ? "default" : "destructive"}>
                    {analysisResult.feasible ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <AlertDescription className="font-medium">{analysisResult.reason}</AlertDescription>
                  </Alert>

                  {analysisResult.feasible && analysisResult.coursesNeeded && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Courses you'll need to take:</p>
                      <div className="space-y-1 text-sm">
                        {analysisResult.coursesNeeded.map((course) => (
                          <div key={course.id} className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {course.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Skill comparison */}
                <div>
                  <SkillRadarChart
                    currentSkills={currentProgress.currentSkills}
                    targetSkills={selectedSpec.requiredSkills}
                    showLegend={false}
                    className="[&_canvas]:h-[300px]!"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                {analysisResult.feasible && onSwitch && (
                  <Button onClick={handleConfirmSwitch} size="lg" className="flex-1">
                    Switch to {selectedSpec.name}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSpec(null)
                    setAnalysisResult(null)
                  }}
                  size="lg"
                >
                  Try Another Path
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

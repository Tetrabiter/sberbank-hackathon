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

export function WhatIfPage({ open, onOpenChange, currentProgress, onSwitch }: WhatIfModalProps) {
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof canSwitchSpecialization> | null>(null)

  const handleAnalyze = () => {
    if (!selectedSpec) return

    const totalSemesters = 4 // Магистратура обычно 4 семестра
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
      <DialogContent className="w-full max-w-6xl max-h-screen overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">Что если я изменю направление?</DialogTitle>
          <DialogDescription>
            Изучите альтернативные карьерные пути и посмотрите, сможете ли вы изменить направление за оставшееся время.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о текущей специализации */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              В настоящее время вы движетесь к становлению <strong>{currentProgress.selectedSpecialization?.name}</strong>.
              Вы находитесь в семестре {currentProgress.currentSemester} из 4.
            </AlertDescription>
          </Alert>

          {/* Выбор специализации */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Кем бы вы хотели стать вместо этого?</h3>
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

          {/* Кнопка анализа */}
          {selectedSpec && !analysisResult && (
            <Button onClick={handleAnalyze} size="lg" className="w-full">
              Проанализировать возможность
            </Button>
          )}

          {/* Результаты анализа */}
          {analysisResult && selectedSpec && (
            <div className="space-y-4 p-6 bg-secondary/50 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Сводка результатов */}
                <div className="space-y-4">
                  <Alert variant={analysisResult.feasible ? "default" : "destructive"}>
                    {analysisResult.feasible ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <AlertDescription className="font-medium">{analysisResult.reason}</AlertDescription>
                  </Alert>

                  {analysisResult.feasible && analysisResult.coursesNeeded && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Курсы, которые вам нужно будет пройти:</p>
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

                {/* Сравнение навыков */}
                <div>
                  <SkillRadarChart
                    currentSkills={currentProgress.currentSkills}
                    targetSkills={selectedSpec.requiredSkills}
                    showLegend={false}
                    className="[&_canvas]:h-[300px]!"
                  />
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3 pt-4">
                {analysisResult.feasible && onSwitch && (
                  <Button onClick={handleConfirmSwitch} size="lg" className="flex-1">
                    Перейти на {selectedSpec.name}
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
                    Попробовать другой путь
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
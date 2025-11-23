"use client"

import type { StudentProgress } from "@/types/types"
import { SkillRadarChart } from "@/components/radar-chart"
import { ProgressTimeline } from "@/components/progress-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap,TrendingUp, Trophy, BookOpen } from "lucide-react"

interface CompletionScreenProps {
  progress: StudentProgress
  onRestart?: () => void
}

export function CompletionPage({ progress, onRestart }: CompletionScreenProps) {
  const totalCourses = progress.semesterPlans.reduce((sum, sp) => sum + sp.courses.length, 0)

  const coreCount = progress.semesterPlans.flatMap((sp) => sp.courses).filter((c) => c.type === "Основной").length

  const electiveCount = totalCourses - coreCount

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-background dark:from-blue-950/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Главный раздел */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Ваш учебный план магистратуры готов!
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Вы построили индивидуальный путь, чтобы стать <strong>{progress.selectedSpecialization?.name}</strong>.
              Вот ваше полное 2-летнее путешествие.
            </p>
          </div>

          {/* Карточки статистики */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего курсов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-3xl font-bold">{totalCourses}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Основные курсы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <span className="text-3xl font-bold">{coreCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Факультативы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-3xl font-bold">{electiveCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Всего кредитов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-3xl font-bold">{progress.totalCredits}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Основное содержимое */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Временная шкала */}
            <ProgressTimeline
              semesterPlans={progress.semesterPlans}
              currentSemester={5} // Показать как все завершено
            />

            {/* Итоговые навыки */}
            <div className="space-y-6">
              {progress.selectedSpecialization && (
                <SkillRadarChart
                  currentSkills={progress.currentSkills}
                  targetSkills={progress.selectedSpecialization.requiredSkills}
                />
              )}

              <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Готовы к успеху</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Вы развили все ключевые компетенции, необходимые для выбранного карьерного пути. Ваши навыки
                    идеально соответствуют требованиям индустрии для {progress.selectedSpecialization?.name}.
                  </p>
                  <div className="pt-2">
                    <p className="text-sm font-medium">Ожидаемый диапазон зарплат:</p>
                    <p className="text-2xl font-bold text-blue-600">{progress.selectedSpecialization?.avgSalary}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Действия */}
          {onRestart && (
            <div className="flex justify-center pt-4">
              <Button onClick={onRestart} size="lg" variant="outline">
                Спланировать другой путь
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
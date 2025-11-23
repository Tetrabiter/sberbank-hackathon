"use client";

import { useState, useMemo } from "react";
import type { Course, Specialization, SkillRequirement } from "@/types/types";
import { CourseCard } from "@/components/course-card";
import { SkillRadarChart } from "@/components/radar-chart";
import { SkillProgressBars } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GraduationCap, Target } from "lucide-react";
import { calculateUpdatedSkills } from "@/lib/ml-recomender";
import { Link } from "react-router";

interface SemesterPlanningScreenProps {
  semester: number;
  specialization: Specialization;
  currentSkills: SkillRequirement;
  recommendedCourses: Course[];
  onConfirm: (selectedCourses: Course[]) => void;
  onWhatIf?: () => void;
}

export function SemesterPlanning({
  semester,
  specialization,
  currentSkills,
  recommendedCourses,
  onConfirm,
  onWhatIf,
}: SemesterPlanningScreenProps) {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);

  const toggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const selectedCourseObjects = recommendedCourses.filter((c) =>
    selectedCourses.has(c.id)
  );

  const totalCredits = selectedCourseObjects.reduce(
    (sum, c) => sum + c.credits,
    0
  );

  // Calculate preview skills
  const previewSkills = useMemo(() => {
    if (hoveredCourse && !selectedCourses.has(hoveredCourse.id)) {
      return calculateUpdatedSkills(currentSkills, [
        ...selectedCourseObjects,
        hoveredCourse,
      ]);
    } else if (selectedCourseObjects.length > 0) {
      return calculateUpdatedSkills(currentSkills, selectedCourseObjects);
    }
    return currentSkills;
  }, [hoveredCourse, selectedCourseObjects, currentSkills, selectedCourses]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold">
                  Semester {semester} Planning
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>Goal: {specialization.name}</span>
                <Badge variant="outline">{specialization.icon}</Badge>
              </div>
            </div>
            {onWhatIf && (
              <Button variant="outline" onClick={onWhatIf}>
                What If I Switch?
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Selection - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Recommended Courses for You
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI has analyzed your goal and current skills. These courses
                will help you build the expertise you need. Hover over courses
                to see their impact on your skill profile.
              </p>
            </div>

            <div className="space-y-4">
              {recommendedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSelected={selectedCourses.has(course.id)}
                  onToggle={() => toggleCourse(course.id)}
                  onHover={(hovering) =>
                    setHoveredCourse(hovering ? course : null)
                  }
                />
              ))}
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-6 bg-card border rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {selectedCourses.size} course
                    {selectedCourses.size !== 1 ? "s" : ""} selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalCredits} total credits
                  </p>
                </div>

                {semester === 4 ? (
                  <Link to={"/completion"}>
                    <Button
                      size="lg"
                      disabled={selectedCourses.size === 0}
                      onClick={() => onConfirm(selectedCourseObjects)}
                      className="gap-2"
                    >
                      Confirm & Continue
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    disabled={selectedCourses.size === 0}
                    onClick={() => onConfirm(selectedCourseObjects)}
                    className="gap-2"
                  >
                    Confirm & Continue
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Skill Visualization - Sticky sidebar */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              <SkillRadarChart
                currentSkills={currentSkills}
                targetSkills={specialization.requiredSkills}
                previewSkills={previewSkills}
              />

              <SkillProgressBars
                currentSkills={currentSkills}
                targetSkills={specialization.requiredSkills}
                previewSkills={previewSkills}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

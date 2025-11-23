import type { Course, Specialization, SkillRequirement, StudentProgress } from "@/types/types"
import { allCourses } from "@/data/courses"

/**
 * Neural network-inspired recommendation system
 * This simulates a recommendation algorithm that considers:
 * 1. Target specialization requirements
 * 2. Current skill levels
 * 3. Prerequisites
 * 4. Skill gap prioritization
 */

export function recommendCoursesForSemester(
  specialization: Specialization,
  currentSkills: SkillRequirement,
  completedCourseIds: string[],
  semester: number,
  maxCourses = 4,
): Course[] {
  // Filter available courses
  const availableCourses = allCourses.filter((course) => {
    // Already completed
    if (completedCourseIds.includes(course.id)) return false

    // Check prerequisites
    if (course.prerequisites) {
      const hasAllPrereqs = course.prerequisites.every((prereqId) => completedCourseIds.includes(prereqId))
      if (!hasAllPrereqs) return false
    }

    return true
  })

  // Calculate skill gaps
  const skillGaps: { [skill: string]: number } = {}
  Object.keys(specialization.requiredSkills).forEach((skill) => {
    const required = specialization.requiredSkills[skill]
    const current = currentSkills[skill] || 0
    skillGaps[skill] = Math.max(0, required - current)
  })

  // Score each course based on how well it fills skill gaps
  const scoredCourses = availableCourses.map((course) => {
    let score = 0

    // Score based on skill gap filling
    Object.keys(course.skillsImpact).forEach((skill) => {
      const impact = course.skillsImpact[skill]
      const gap = skillGaps[skill] || 0

      // Higher score if this course addresses a large skill gap
      score += impact * (1 + gap / 100)
    })

    // Bonus for core courses in early semesters
    if (course.type === "Основной" && semester <= 2) {
      score *= 1.5
    }

    // Slight randomness for variety
    score *= 0.95 + Math.random() * 0.1

    return { course, score }
  })

  // Sort by score and return top N
  scoredCourses.sort((a, b) => b.score - a.score)
  return scoredCourses.slice(0, maxCourses).map((sc) => sc.course)
}

export function calculateUpdatedSkills(currentSkills: SkillRequirement, selectedCourses: Course[]): SkillRequirement {
  const updatedSkills = { ...currentSkills }

  selectedCourses.forEach((course) => {
    Object.keys(course.skillsImpact).forEach((skill) => {
      const impact = course.skillsImpact[skill]
      updatedSkills[skill] = Math.min(100, (updatedSkills[skill] || 0) + impact)
    })
  })

  return updatedSkills
}

export function canSwitchSpecialization(
  currentProgress: StudentProgress,
  targetSpecialization: Specialization,
  remainingSemesters: number,
): { feasible: boolean; reason?: string; coursesNeeded?: Course[] } {
  // Calculate what skills are still needed
  const skillGaps: { [skill: string]: number } = {}
  Object.keys(targetSpecialization.requiredSkills).forEach((skill) => {
    const required = targetSpecialization.requiredSkills[skill]
    const current = currentProgress.currentSkills[skill] || 0
    skillGaps[skill] = Math.max(0, required - current)
  })

  // Check if we have any gaps
  const hasGaps = Object.values(skillGaps).some((gap) => gap > 0)
  if (!hasGaps) {
    return {
      feasible: true,
      reason: "You already meet all requirements!",
      coursesNeeded: [],
    }
  }

  // Try to recommend courses to fill gaps
  const completedCourseIds = currentProgress.semesterPlans
    .filter((sp) => sp.completed)
    .flatMap((sp) => sp.courses.map((c) => c.id))

  const coursesPerSemester = 4
// const maxCourses = remainingSemesters * coursesPerSemester

  // Get recommended courses
  const recommendedCourses: Course[] = []
  let simulatedSkills = { ...currentProgress.currentSkills }

  for (let i = 0; i < remainingSemesters; i++) {
    const semesterCourses = recommendCoursesForSemester(
      targetSpecialization,
      simulatedSkills,
      [...completedCourseIds, ...recommendedCourses.map((c) => c.id)],
      currentProgress.currentSemester + i,
      coursesPerSemester,
    )

    recommendedCourses.push(...semesterCourses)
    simulatedSkills = calculateUpdatedSkills(simulatedSkills, semesterCourses)
  }

  // Check if we can meet requirements
  const finalGaps: { [skill: string]: number } = {}
  Object.keys(targetSpecialization.requiredSkills).forEach((skill) => {
    const required = targetSpecialization.requiredSkills[skill]
    const final = simulatedSkills[skill] || 0
    finalGaps[skill] = Math.max(0, required - final)
  })

  const canMeetRequirements = Object.values(finalGaps).every((gap) => gap < 15) // Allow 15% tolerance

  if (canMeetRequirements) {
    return {
      feasible: true,
      reason: `Feasible! You'll need ${recommendedCourses.length} courses over ${remainingSemesters} semester(s).`,
      coursesNeeded: recommendedCourses,
    }
  } else {
    const biggestGaps = Object.entries(finalGaps)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, gap]) => gap >= 15)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill)

    return {
      feasible: false,
      reason: `Not enough time to build required skills in: ${biggestGaps.join(", ")}`,
    }
  }
}

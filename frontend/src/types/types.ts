export interface SkillRequirement {
  [skillName: string]: number // skill name -> required level
}

export interface Specialization {
  id: string
  name: string
  description: string
  marketabilityScore: number // 0-100
  avgSalary: string
  requiredSkills: SkillRequirement
  icon: string
}

export interface Course {
  id: string
  code: string
  name: string
  type: "Основной" | "Элективный"
  credits: number
  description: string
  skillsImpact: SkillRequirement // skills this course improves
  prerequisites?: string[] // course IDs
}

export type SkillCategory =
  | "Programming"
  | "Mathematics"
  | "Machine Learning"
  | "Data Engineering"
  | "Software Engineering"
  | "Cloud & DevOps"
  | "Business & Communication"

export interface Skill {
  name: string
  category: SkillCategory
  level: number // 0-100
}

export interface SemesterPlan {
  semester: number
  courses: Course[]
  completed: boolean
}

export interface StudentProgress {
  currentSemester: number
  selectedSpecialization: Specialization | null
  currentSkills: SkillRequirement
  semesterPlans: SemesterPlan[]
  totalCredits: number
}

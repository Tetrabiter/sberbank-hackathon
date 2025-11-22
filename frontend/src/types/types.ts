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
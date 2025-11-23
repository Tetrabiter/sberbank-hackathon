from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkillBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None

class SkillResponse(SkillBase):
    id: int

class CourseBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    difficulty: float
    semester_availability: List[int]
    workload_hours: int
    academic_major_id: Optional[int] = None

class CourseResponse(CourseBase):
    id: int
    skills: List[SkillResponse]

class AcademicMajorBase(BaseModel):
    name: str
    required_courses: List[int]
    elective_courses: List[int]
    possible_job_majors: List[str]
    description: Optional[str] = None

class AcademicMajorResponse(AcademicMajorBase):
    id: int

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    specialty: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    specialty: str
    current_goal: Optional[str] = None
    current_semester: int

class UserProfileResponse(UserResponse):
    skills: List[SkillResponse]
    completed_courses: List[Dict[str, Any]]

class RoadmapGenerationRequest(BaseModel):
    goal: str
    semester: int = 1

class RoadmapSelectionRequest(BaseModel):
    semester: int
    selected_courses: List[int]

class RoadmapResponse(BaseModel):
    id: int
    roadmap_data: Dict[str, Any]
    goal: str
    created_at: datetime

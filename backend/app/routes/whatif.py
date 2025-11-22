from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import User, Course, Skill
from app.llm_service import ollama_service
from jose import jwt
from app.config import settings

router = APIRouter(prefix="/whatif", tags=["whatif"])

def get_user_from_token(token: str, db: Session) -> User:
    """Extract user from JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return user
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

@router.post("/change-goal")
def analyze_goal_change(
    new_goal: str,
    token: str = None,
    db: Session = Depends(get_db)
):
    """
    Analyze what happens if user changes their career goal.
    Shows new required skills, feasibility, and updated roadmap.
    """
    user = get_user_from_token(token, db)
    
    # Get all available courses
    all_courses = db.query(Course).all()
    courses_data = [
        {
            "id": c.id,
            "name": c.name,
            "difficulty": c.difficulty,
            "workload_hours": c.workload_hours,
            "skills": [s.name for s in c.skills]
        }
        for c in all_courses
    ]
    
    # Get user's current skills
    current_skills = [s.name for s in user.skills]
    current_semester = user.current_semester
    
    # Generate roadmap for the new goal
    new_goal_roadmap = ollama_service.generate_roadmap_options(
        goal=new_goal,
        available_courses=courses_data,
        completed_skills=current_skills
    )
    
    # Analyze feasibility
    all_required_skills = set()
    for semester_courses in new_goal_roadmap:
        for course in semester_courses:
            all_required_skills.update(course.get("skills", []))
    
    skills_to_acquire = list(all_required_skills - set(current_skills))
    
    # Calculate semesters needed
    semesters_needed = len(new_goal_roadmap)
    total_workload = sum(
        sum(c.get("workload_hours", 0) for c in semester)
        for semester in new_goal_roadmap
    )
    
    # Format detailed roadmap
    formatted_roadmap = []
    for semester, courses in enumerate(new_goal_roadmap, 1):
        semester_courses = []
        for course_data in courses:
            course = db.query(Course).filter(Course.id == course_data.get("id")).first()
            if course:
                semester_courses.append({
                    "id": course.id,
                    "name": course.name,
                    "code": course.code,
                    "difficulty": course.difficulty,
                    "workload_hours": course.workload_hours,
                    "skills": [s.name for s in course.skills]
                })
        formatted_roadmap.append({
            "semester": current_semester + semester - 1,
            "courses": semester_courses
        })
    
    # Determine feasibility based on difficulty and workload
    avg_difficulty = sum(
        c.get("difficulty", 5) for semester in new_goal_roadmap
        for c in semester
    ) / max(len([c for s in new_goal_roadmap for c in s]), 1)
    
    feasibility = {
        "is_achievable": True,
        "difficulty_level": "High" if avg_difficulty > 7 else "Medium" if avg_difficulty > 4 else "Low",
        "average_difficulty": round(avg_difficulty, 2),
        "estimated_semesters": semesters_needed,
        "total_workload_hours": total_workload,
        "time_to_completion_from_now": f"{current_semester + semesters_needed - 1} semester" if current_semester + semesters_needed - 1 == 1 else f"{current_semester + semesters_needed - 1} semesters"
    }
    
    return {
        "current_goal": user.current_goal,
        "new_goal": new_goal,
        "current_skills": current_skills,
        "new_skills_needed": skills_to_acquire,
        "feasibility": feasibility,
        "proposed_roadmap": formatted_roadmap,
        "comparison": {
            "skills_already_aligned": len(set(current_skills) & all_required_skills),
            "total_new_skills_needed": len(skills_to_acquire),
            "skill_overlap_percentage": round(
                (len(set(current_skills) & all_required_skills) / len(all_required_skills) * 100)
                if all_required_skills else 0, 2
            )
        }
    }

@router.post("/career-path-comparison")
def compare_career_paths(
    alternative_goals: List[str],
    token: str = None,
    db: Session = Depends(get_db)
):
    """
    Compare current goal with multiple alternative career paths.
    Shows effort needed, skill overlap, and feasibility for each.
    """
    user = get_user_from_token(token, db)
    
    # Get all available courses
    all_courses = db.query(Course).all()
    courses_data = [
        {
            "id": c.id,
            "name": c.name,
            "difficulty": c.difficulty,
            "workload_hours": c.workload_hours,
            "skills": [s.name for s in c.skills]
        }
        for c in all_courses
    ]
    
    current_skills = set(s.name for s in user.skills)
    
    # Analyze current goal
    current_roadmap = ollama_service.generate_roadmap_options(
        goal=user.current_goal or "Unknown",
        available_courses=courses_data,
        completed_skills=list(current_skills)
    )
    
    current_goal_analysis = _analyze_goal(
        user.current_goal or "Unknown",
        current_roadmap,
        current_skills
    )
    
    # Analyze alternative goals
    alternative_analysis = []
    for goal in alternative_goals:
        roadmap = ollama_service.generate_roadmap_options(
            goal=goal,
            available_courses=courses_data,
            completed_skills=list(current_skills)
        )
        
        analysis = _analyze_goal(goal, roadmap, current_skills)
        alternative_analysis.append(analysis)
    
    # Sort by effort (semesters needed)
    alternatives_sorted = sorted(alternative_analysis, key=lambda x: x["effort"]["semesters_needed"])
    
    return {
        "current_goal_analysis": current_goal_analysis,
        "alternative_goals": alternatives_sorted,
        "recommendation": f"Based on your current skills, {alternatives_sorted[0]['goal']} would require the least effort"
    }

@router.get("/skill-readiness/{goal}")
def check_skill_readiness(
    goal: str,
    token: str = None,
    db: Session = Depends(get_db)
):
    """
    Check if user's current skills are sufficient for a specific goal/course.
    Returns readiness percentage and recommended prerequisites.
    """
    user = get_user_from_token(token, db)
    current_skills = set(s.name for s in user.skills)
    
    # Get all courses related to the goal
    all_courses = db.query(Course).all()
    goal_related_courses = [c for c in all_courses if goal.lower() in c.name.lower()]
    
    if not goal_related_courses:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No courses found for goal: {goal}")
    
    # Analyze required skills
    all_required_skills = set()
    for course in goal_related_courses:
        all_required_skills.update(s.name for s in course.skills)
    
    matching_skills = current_skills & all_required_skills
    missing_skills = all_required_skills - current_skills
    
    readiness_percentage = round(
        (len(matching_skills) / len(all_required_skills) * 100) if all_required_skills else 0, 2
    )
    
    # Find prerequisites (courses that teach missing skills)
    prerequisites = []
    for course in all_courses:
        course_skills = set(s.name for s in course.skills)
        if course_skills & missing_skills:
            prerequisites.append({
                "course_id": course.id,
                "course_name": course.name,
                "teaches_missing_skills": list(course_skills & missing_skills),
                "difficulty": course.difficulty
            })
    
    return {
        "goal": goal,
        "readiness_percentage": readiness_percentage,
        "current_matching_skills": list(matching_skills),
        "missing_skills": list(missing_skills),
        "recommended_prerequisites": sorted(prerequisites, key=lambda x: x["difficulty"]),
        "ready_to_start": readiness_percentage >= 60,
        "recommendation": "You are ready to start!" if readiness_percentage >= 60 else f"Complete {len(prerequisites)} prerequisite courses first"
    }

def _analyze_goal(goal: str, roadmap: List, current_skills: set) -> Dict[str, Any]:
    """Helper function to analyze a goal/roadmap"""
    all_skills_needed = set()
    for semester_courses in roadmap:
        for course in semester_courses:
            all_skills_needed.update(course.get("skills", []))
    
    skills_overlap = len(current_skills & all_skills_needed)
    new_skills_needed = len(all_skills_needed - current_skills)
    total_workload = sum(
        sum(c.get("workload_hours", 0) for c in semester)
        for semester in roadmap
    )
    
    return {
        "goal": goal,
        "effort": {
            "semesters_needed": len(roadmap),
            "total_workload_hours": total_workload,
            "average_workload_per_semester": round(total_workload / len(roadmap), 2) if roadmap else 0
        },
        "skills": {
            "current_skills_applicable": skills_overlap,
            "new_skills_to_learn": new_skills_needed,
            "skill_alignment_percentage": round((skills_overlap / len(all_skills_needed) * 100) if all_skills_needed else 0, 2)
        }
    }

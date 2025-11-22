from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import User, Course, UserRoadmap, RoadmapOption
from app.schemas import RoadmapGenerationRequest, RoadmapSelectionRequest, RoadmapResponse
from app.llm_service import ollama_service
from jose import jwt
from app.config import settings

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

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

@router.post("/generate")
def generate_roadmap_options(
    request: RoadmapGenerationRequest,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Generate roadmap options for user based on their goal"""
    user = get_user_from_token(token, db)
    user.current_goal = request.goal
    
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
    
    # Get user's completed skills
    user_skills = [s.name for s in user.skills]
    
    # Generate roadmap options using Ollama
    roadmap_options = ollama_service.generate_roadmap_options(
        goal=request.goal,
        available_courses=courses_data,
        completed_skills=user_skills
    )
    
    # Store roadmap options in database for reference
    for semester, courses in enumerate(roadmap_options, 1):
        course_ids = [c.get("id") for c in courses]
        option = RoadmapOption(
            user_id=user.id,
            semester=semester,
            course_options=course_ids
        )
        db.add(option)
    
    db.commit()
    
    # Format response with full course details
    formatted_options = []
    for semester, courses in enumerate(roadmap_options, 1):
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
        formatted_options.append(semester_courses)
    
    return {
        "goal": request.goal,
        "roadmap_options": formatted_options,
        "generated_at": datetime.utcnow()
    }

@router.post("/select")
def select_courses_for_semester(
    request: RoadmapSelectionRequest,
    token: str = None,
    db: Session = Depends(get_db)
):
    """User selects courses for a semester"""
    user = get_user_from_token(token, db)
    
    # Get selected courses
    selected_courses = db.query(Course).filter(Course.id.in_(request.selected_courses)).all()
    
    # Create or update roadmap
    if not user.roadmap:
        user.roadmap = UserRoadmap(
            user_id=user.id,
            goal=user.current_goal or "Unknown",
            roadmap_data={}
        )
    
    # Update roadmap with selected courses
    if not user.roadmap.roadmap_data:
        user.roadmap.roadmap_data = {}
    
    user.roadmap.roadmap_data[f"semester_{request.semester}"] = [
        {"id": c.id, "name": c.name} for c in selected_courses
    ]
    user.roadmap.updated_at = datetime.utcnow()
    
    # Update user's skills based on completed courses
    if request.semester > user.current_semester:
        # Only add skills from previous semesters as completed
        for course in selected_courses:
            for skill in course.skills:
                if skill not in user.skills:
                    user.skills.append(skill)
    
    db.commit()
    db.refresh(user)
    
    return {
        "semester": request.semester,
        "selected_courses": [c.name for c in selected_courses],
        "message": "Courses selected successfully"
    }

@router.get("/current")
def get_current_roadmap(token: str = None, db: Session = Depends(get_db)):
    """Get user's current roadmap"""
    user = get_user_from_token(token, db)
    
    if not user.roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No roadmap found")
    
    return {
        "id": user.roadmap.id,
        "goal": user.roadmap.goal,
        "roadmap_data": user.roadmap.roadmap_data,
        "created_at": user.roadmap.created_at,
        "updated_at": user.roadmap.updated_at
    }

@router.post("/next-semester")
def get_next_semester_recommendations(
    token: str = None,
    db: Session = Depends(get_db)
):
    """Get AI recommendations for next semester based on current progress"""
    user = get_user_from_token(token, db)
    
    # Get completed courses
    completed_courses = [
        {
            "id": cc.course.id,
            "name": cc.course.name
        }
        for cc in user.completed_courses
    ]
    
    # Get all available courses
    all_courses = db.query(Course).all()
    available_courses_data = [
        {
            "id": c.id,
            "name": c.name,
            "difficulty": c.difficulty,
            "workload_hours": c.workload_hours,
            "skills": [s.name for s in c.skills]
        }
        for c in all_courses
    ]
    
    # Get user's skills
    user_skills = [s.name for s in user.skills]
    
    # Generate recommendations
    recommendations = ollama_service.recommend_next_semester_courses(
        goal=user.current_goal or "General",
        completed_courses=completed_courses,
        available_courses=available_courses_data,
        current_skills=user_skills
    )
    
    return {
        "next_semester": user.current_semester + 1,
        "recommended_courses": recommendations,
        "reason": "Based on your completed courses and career goal"
    }

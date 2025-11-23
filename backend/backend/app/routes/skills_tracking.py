from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import User, CompletedCourse, Skill
from jose import jwt
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/skills", tags=["skills_tracking"])

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

@router.get("/user", response_model=List[Dict[str, Any]])
def get_user_skills(token: str = None, db: Session = Depends(get_db)):
    """Get all skills acquired by the user"""
    user = get_user_from_token(token, db)
    
    skills = []
    for skill in user.skills:
        skills.append({
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "description": skill.description,
            "acquired_from_courses": [c.name for c in skill.courses if any(
                cc.course_id == c.id for cc in user.completed_courses
            )]
        })
    
    return skills

@router.post("/mark-course-complete")
def mark_course_complete(
    course_id: int,
    semester: int,
    grade: float = 4.0,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Mark a course as completed and update user skills"""
    user = get_user_from_token(token, db)
    
    # Create completed course record
    completed_course = CompletedCourse(
        user_id=user.id,
        course_id=course_id,
        semester=semester,
        grade=grade,
        completed_at=datetime.utcnow()
    )
    
    db.add(completed_course)
    
    # Add associated skills to user
    course = db.query(CompletedCourse).filter(
        CompletedCourse.course_id == course_id
    ).first()
    
    if course:
        # Get the course object to find its skills
        from app.models import Course
        course_obj = db.query(Course).filter(Course.id == course_id).first()
        if course_obj:
            for skill in course_obj.skills:
                if skill not in user.skills:
                    user.skills.append(skill)
    
    # Update user's current semester if needed
    if semester > user.current_semester:
        user.current_semester = semester
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Course marked as complete",
        "course_id": course_id,
        "new_skills_acquired": [s.name for s in user.skills]
    }

@router.get("/skill-progression")
def get_skill_progression(token: str = None, db: Session = Depends(get_db)):
    """Get detailed skill progression tracking"""
    user = get_user_from_token(token, db)
    
    skill_progression = {
        "total_skills": len(user.skills),
        "skills_by_category": {},
        "skill_acquisition_timeline": []
    }
    
    # Organize skills by category
    for skill in user.skills:
        if skill.category not in skill_progression["skills_by_category"]:
            skill_progression["skills_by_category"][skill.category] = []
        skill_progression["skills_by_category"][skill.category].append(skill.name)
    
    # Get skill acquisition timeline based on completed courses
    timeline = []
    for completed in sorted(user.completed_courses, key=lambda x: x.semester):
        course = completed.course
        skills_from_course = [s.name for s in course.skills]
        timeline.append({
            "semester": completed.semester,
            "course": course.name,
            "skills_acquired": skills_from_course,
            "grade": completed.grade,
            "completed_at": completed.completed_at
        })
    
    skill_progression["skill_acquisition_timeline"] = timeline
    
    return skill_progression

@router.post("/add-skill")
def add_skill_to_user(
    skill_id: int,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Manually add a skill to user (admin/verification endpoint)"""
    user = get_user_from_token(token, db)
    
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    
    if skill not in user.skills:
        user.skills.append(skill)
    
    db.commit()
    
    return {
        "message": "Skill added to user",
        "skill": skill.name,
        "user_skills_count": len(user.skills)
    }

@router.delete("/remove-skill/{skill_id}")
def remove_skill_from_user(
    skill_id: int,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Remove a skill from user"""
    user = get_user_from_token(token, db)
    
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    
    if skill in user.skills:
        user.skills.remove(skill)
    
    db.commit()
    
    return {"message": "Skill removed from user"}

@router.get("/recommendations")
def get_skill_recommendations(token: str = None, db: Session = Depends(get_db)):
    """Get recommended skills to acquire next"""
    user = get_user_from_token(token, db)
    
    from app.models import Course
    
    # Get all skills from available courses
    all_skills = set()
    user_skill_ids = set(s.id for s in user.skills)
    
    courses = db.query(Course).all()
    for course in courses:
        for skill in course.skills:
            if skill.id not in user_skill_ids:
                all_skills.add((skill.id, skill.name, skill.category))
    
    recommendations = [
        {"id": s[0], "name": s[1], "category": s[2]}
        for s in sorted(all_skills, key=lambda x: x[1])
    ]
    
    return {
        "current_skills_count": len(user.skills),
        "available_skills_to_learn": len(recommendations),
        "recommended_skills": recommendations[:10]  # Top 10 recommendations
    }

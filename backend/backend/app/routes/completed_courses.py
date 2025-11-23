from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CompletedCourse, User, Course
from datetime import datetime
from jose import jwt
from app.config import settings

router = APIRouter(prefix="/completed", tags=["completed_courses"])

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

@router.get("/")
def get_completed_courses(token: str = None, db: Session = Depends(get_db)):
    """Get all completed courses for current user"""
    user = get_user_from_token(token, db)
    
    completed = []
    for cc in user.completed_courses:
        completed.append({
            "id": cc.id,
            "course_id": cc.course_id,
            "course_name": cc.course.name,
            "course_code": cc.course.code,
            "semester": cc.semester,
            "grade": cc.grade,
            "completed_at": cc.completed_at
        })
    
    return sorted(completed, key=lambda x: x["semester"])

@router.post("/{course_id}")
def mark_course_complete(
    course_id: int,
    semester: int,
    grade: float = 4.0,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Mark a course as completed"""
    user = get_user_from_token(token, db)
    
    # Check if course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Check if already completed
    existing = db.query(CompletedCourse).filter(
        (CompletedCourse.user_id == user.id) & 
        (CompletedCourse.course_id == course_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course already marked as completed")
    
    # Create completed course record
    completed = CompletedCourse(
        user_id=user.id,
        course_id=course_id,
        semester=semester,
        grade=grade,
        completed_at=datetime.utcnow()
    )
    
    db.add(completed)
    
    # Add course skills to user
    for skill in course.skills:
        if skill not in user.skills:
            user.skills.append(skill)
    
    db.commit()
    
    return {
        "message": "Course marked as complete",
        "course": course.name,
        "semester": semester,
        "grade": grade
    }

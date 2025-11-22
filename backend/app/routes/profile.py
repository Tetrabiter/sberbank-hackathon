from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserProfileResponse, UserResponse
from jose import jwt
from app.config import settings

router = APIRouter(prefix="/profile", tags=["profile"])

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

@router.get("/me", response_model=UserProfileResponse)
def get_profile(token: str = None, db: Session = Depends(get_db)):
    """Get user profile with skills and completed courses"""
    user = get_user_from_token(token, db)
    
    completed_courses = []
    for cc in user.completed_courses:
        completed_courses.append({
            "course_id": cc.course_id,
            "course_name": cc.course.name,
            "semester": cc.semester,
            "grade": cc.grade,
            "completed_at": cc.completed_at
        })
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "specialty": user.specialty,
        "current_goal": user.current_goal,
        "current_semester": user.current_semester,
        "skills": user.skills,
        "completed_courses": completed_courses
    }

@router.put("/goal")
def update_goal(goal: str, token: str = None, db: Session = Depends(get_db)):
    """Update user's career goal"""
    user = get_user_from_token(token, db)
    user.current_goal = goal
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm(user)

@router.put("/semester")
def update_semester(semester: int, token: str = None, db: Session = Depends(get_db)):
    """Update user's current semester"""
    user = get_user_from_token(token, db)
    user.current_semester = semester
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm(user)

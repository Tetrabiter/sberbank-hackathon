from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Course, Academic_Major, Skill
from app.schemas import CourseResponse, CourseBase, AcademicMajorResponse, AcademicMajorBase

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseResponse])
def get_all_courses(db: Session = Depends(get_db)):
    """Get all available courses"""
    courses = db.query(Course).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get specific course details"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course

@router.get("/major/{major_id}", response_model=List[CourseResponse])
def get_courses_by_major(major_id: int, db: Session = Depends(get_db)):
    """Get all courses for a specific academic major"""
    courses = db.query(Course).filter(Course.academic_major_id == major_id).all()
    return courses

@router.get("/semester/{semester}", response_model=List[CourseResponse])
def get_courses_by_semester(semester: int, db: Session = Depends(get_db)):
    """Get courses available in a specific semester"""
    courses = db.query(Course).all()
    return [c for c in courses if semester in c.semester_availability]

@router.post("/", response_model=CourseResponse)
def create_course(course: CourseBase, db: Session = Depends(get_db)):
    """Create a new course (admin)"""
    db_course = Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course_update: CourseBase, db: Session = Depends(get_db)):
    """Update course details"""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    for key, value in course_update.dict().items():
        setattr(db_course, key, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    """Delete a course"""
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"detail": "Course deleted"}

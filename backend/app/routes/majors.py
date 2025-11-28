from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Academic_Major, Course
from app.schemas import AcademicMajorResponse, AcademicMajorBase

router = APIRouter(prefix="/majors", tags=["majors"])

@router.get("/", response_model=List[AcademicMajorResponse])
def get_all_majors(db: Session = Depends(get_db)):
    """Get all academic majors"""
    majors = db.query(Academic_Major).all()
    return majors

@router.get("/{major_id}", response_model=AcademicMajorResponse)
def get_major(major_id: int, db: Session = Depends(get_db)):
    """Get specific major details"""
    major = db.query(Academic_Major).filter(Academic_Major.id == major_id).first()
    if not major:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    return major

@router.get("/name/{major_name}", response_model=AcademicMajorResponse)
def get_major_by_name(major_name: str, db: Session = Depends(get_db)):
    """Get major by name"""
    major = db.query(Academic_Major).filter(Academic_Major.name == major_name).first()
    if not major:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    return major

@router.post("/", response_model=AcademicMajorResponse)
def create_major(major: AcademicMajorBase, db: Session = Depends(get_db)):
    """Create a new academic major"""
    db_major = Academic_Major(**major.dict())
    db.add(db_major)
    db.commit()
    db.refresh(db_major)
    return db_major

@router.put("/{major_id}", response_model=AcademicMajorResponse)
def update_major(major_id: int, major_update: AcademicMajorBase, db: Session = Depends(get_db)):
    """Update major details"""
    db_major = db.query(Academic_Major).filter(Academic_Major.id == major_id).first()
    if not db_major:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    
    for key, value in major_update.dict().items():
        setattr(db_major, key, value)
    
    db.commit()
    db.refresh(db_major)
    return db_major

@router.delete("/{major_id}")
def delete_major(major_id: int, db: Session = Depends(get_db)):
    """Delete an academic major"""
    db_major = db.query(Academic_Major).filter(Academic_Major.id == major_id).first()
    if not db_major:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Major not found")
    
    db.delete(db_major)
    db.commit()
    return {"detail": "Major deleted"}

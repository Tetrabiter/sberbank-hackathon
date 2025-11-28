from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Skill
from app.schemas import SkillBase, SkillResponse

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("/", response_model=List[SkillResponse])
def get_all_skills(db: Session = Depends(get_db)):
    """Get all available skills"""
    skills = db.query(Skill).all()
    return skills

@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    """Get specific skill details"""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return skill

@router.get("/category/{category}", response_model=List[SkillResponse])
def get_skills_by_category(category: str, db: Session = Depends(get_db)):
    """Get skills by category"""
    skills = db.query(Skill).filter(Skill.category == category).all()
    return skills

@router.post("/", response_model=SkillResponse)
def create_skill(skill: SkillBase, db: Session = Depends(get_db)):
    """Create a new skill"""
    db_skill = Skill(**skill.dict())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, skill_update: SkillBase, db: Session = Depends(get_db)):
    """Update skill details"""
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    
    for key, value in skill_update.dict().items():
        setattr(db_skill, key, value)
    
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    """Delete a skill"""
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    
    db.delete(db_skill)
    db.commit()
    return {"detail": "Skill deleted"}

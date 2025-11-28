from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Association table for many-to-many relationship between users and skills
user_skills = Table(
    'user_skills',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

# Association table for courses and skills
course_skills = Table(
    'course_skills',
    Base.metadata,
    Column('course_id', Integer, ForeignKey('courses.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    specialty = Column(String)  # Academic major
    current_goal = Column(String)  # Desired job specialty
    current_semester = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    completed_courses = relationship("CompletedCourse", back_populates="user")
    roadmap = relationship("UserRoadmap", back_populates="user", uselist=False)
    skills = relationship("Skill", secondary=user_skills, back_populates="users")
    
class Academic_Major(Base):
    __tablename__ = "academic_majors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    required_courses = Column(JSON)  # List of course IDs
    elective_courses = Column(JSON)  # List of course IDs
    possible_job_majors = Column(JSON)  # List of job specialties
    description = Column(String)

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True)
    description = Column(String)
    difficulty = Column(Float)  # 1-10 scale
    semester_availability = Column(JSON)  # List of semesters when available
    academic_major_id = Column(Integer, ForeignKey("academic_majors.id"))
    workload_hours = Column(Integer)  # Estimated hours per week
    
    # Relationships
    skills = relationship("Skill", secondary=course_skills, back_populates="courses")
    completed_by = relationship("CompletedCourse", back_populates="course")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)  # e.g., "Programming", "Frontend", "Backend"
    description = Column(String)
    
    # Relationships
    users = relationship("User", secondary=user_skills, back_populates="skills")
    courses = relationship("Course", secondary=course_skills, back_populates="skills")

class CompletedCourse(Base):
    __tablename__ = "completed_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    semester = Column(Integer)
    grade = Column(Float)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="completed_courses")
    course = relationship("Course", back_populates="completed_by")

class UserRoadmap(Base):
    __tablename__ = "user_roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    roadmap_data = Column(JSON)  # Contains semester-wise course selections
    goal = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="roadmap")

class RoadmapOption(Base):
    __tablename__ = "roadmap_options"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    semester = Column(Integer)
    course_options = Column(JSON)  # List of course lists (each list is a recommended set)
    generated_at = Column(DateTime, default=datetime.utcnow)

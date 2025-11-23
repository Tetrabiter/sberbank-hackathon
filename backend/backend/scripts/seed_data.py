"""
Database seeding script to populate initial data
Run with: python scripts/seed_data.py
"""

import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, init_db
from app.models import Academic_Major, Course, Skill

def seed_database():
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Create skills
        skills_data = [
            Skill(name="Python", category="Programming Language"),
            Skill(name="JavaScript", category="Programming Language"),
            Skill(name="React", category="Frontend Framework"),
            Skill(name="Node.js", category="Backend Framework"),
            Skill(name="SQL", category="Database"),
            Skill(name="MongoDB", category="Database"),
            Skill(name="HTML/CSS", category="Frontend Basics"),
            Skill(name="Git", category="Version Control"),
            Skill(name="Docker", category="DevOps"),
            Skill(name="REST APIs", category="Backend Development"),
            Skill(name="GraphQL", category="Backend Development"),
            Skill(name="Machine Learning", category="AI/ML"),
            Skill(name="Data Analysis", category="Data Science"),
            Skill(name="C#", category="Programming Language"),
            Skill(name=".NET", category="Backend Framework"),
        ]
        
        for skill in skills_data:
            if not db.query(Skill).filter(Skill.name == skill.name).first():
                db.add(skill)
        
        db.commit()
        print("✓ Skills created")
        
        # Get skill objects
        python_skill = db.query(Skill).filter(Skill.name == "Python").first()
        js_skill = db.query(Skill).filter(Skill.name == "JavaScript").first()
        react_skill = db.query(Skill).filter(Skill.name == "React").first()
        node_skill = db.query(Skill).filter(Skill.name == "Node.js").first()
        sql_skill = db.query(Skill).filter(Skill.name == "SQL").first()
        html_skill = db.query(Skill).filter(Skill.name == "HTML/CSS").first()
        git_skill = db.query(Skill).filter(Skill.name == "Git").first()
        docker_skill = db.query(Skill).filter(Skill.name == "Docker").first()
        rest_skill = db.query(Skill).filter(Skill.name == "REST APIs").first()
        
        # Create courses
        courses_data = [
            # Frontend Fundamentals
            Course(
                name="HTML/CSS Fundamentals",
                code="FE101",
                description="Learn the basics of HTML and CSS",
                difficulty=2.0,
                semester_availability=[1],
                workload_hours=5,
                skills=[html_skill]
            ),
            Course(
                name="JavaScript Fundamentals",
                code="FE102",
                description="Core JavaScript concepts and syntax",
                difficulty=3.0,
                semester_availability=[1],
                workload_hours=6,
                skills=[js_skill]
            ),
            # Backend Fundamentals
            Course(
                name="Python Fundamentals",
                code="BE101",
                description="Introduction to Python programming",
                difficulty=2.5,
                semester_availability=[1],
                workload_hours=6,
                skills=[python_skill]
            ),
            Course(
                name="SQL Basics",
                code="DB101",
                description="Introduction to SQL and databases",
                difficulty=2.5,
                semester_availability=[1],
                workload_hours=5,
                skills=[sql_skill]
            ),
            # Frontend Advanced
            Course(
                name="React Masterclass",
                code="FE201",
                description="Advanced React development",
                difficulty=5.0,
                semester_availability=[2, 3],
                workload_hours=8,
                skills=[react_skill, js_skill]
            ),
            Course(
                name="Modern JavaScript ES6+",
                code="FE202",
                description="Advanced JavaScript features",
                difficulty=4.5,
                semester_availability=[2],
                workload_hours=6,
                skills=[js_skill]
            ),
            # Backend Advanced
            Course(
                name="Node.js Backend Development",
                code="BE201",
                description="Building APIs with Node.js",
                difficulty=5.0,
                semester_availability=[2, 3],
                workload_hours=8,
                skills=[node_skill, rest_skill]
            ),
            Course(
                name="Advanced Python",
                code="BE202",
                description="Object-oriented and functional programming",
                difficulty=4.5,
                semester_availability=[2],
                workload_hours=7,
                skills=[python_skill]
            ),
            Course(
                name="REST API Design",
                code="BE203",
                description="RESTful API best practices",
                difficulty=4.0,
                semester_availability=[2, 3],
                workload_hours=6,
                skills=[rest_skill, python_skill, node_skill]
            ),
            # DevOps
            Course(
                name="Docker & Containerization",
                code="DEVOPS101",
                description="Docker basics and container orchestration",
                difficulty=5.0,
                semester_availability=[3, 4],
                workload_hours=7,
                skills=[docker_skill]
            ),
            Course(
                name="Git & Version Control",
                code="DEVOPS102",
                description="Git fundamentals and collaboration",
                difficulty=2.0,
                semester_availability=[1],
                workload_hours=3,
                skills=[git_skill]
            ),
        ]
        
        for course in courses_data:
            if not db.query(Course).filter(Course.code == course.code).first():
                db.add(course)
        
        db.commit()
        print("✓ Courses created")
        
        # Create academic majors
        majors_data = [
            Academic_Major(
                name="Computer Science",
                required_courses=[1, 2, 3, 4],  # Course IDs
                elective_courses=[5, 6, 7, 8],
                possible_job_majors=["Full Stack Developer", "Frontend Developer", "Backend Developer", "Software Engineer"],
                description="General Computer Science program"
            ),
            Academic_Major(
                name="Web Development",
                required_courses=[1, 2, 3, 4],
                elective_courses=[5, 7, 8],
                possible_job_majors=["Full Stack Developer", "Frontend Developer", "Web Developer"],
                description="Specialized in web development"
            ),
        ]
        
        for major in majors_data:
            if not db.query(Academic_Major).filter(Academic_Major.name == major.name).first():
                db.add(major)
        
        db.commit()
        print("✓ Academic majors created")
        print("✓ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

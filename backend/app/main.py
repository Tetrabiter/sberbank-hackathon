from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import auth, profile, courses, majors, skills, skills_tracking, roadmap, whatif

app = FastAPI(
    title="Curriculum Planner API",
    description="AI-powered curriculum planning backend",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # или конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
def startup():
    init_db()

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(courses.router)
app.include_router(majors.router)
app.include_router(skills.router)
app.include_router(skills_tracking.router)
app.include_router(roadmap.router)
app.include_router(whatif.router)  # Added whatif routes

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

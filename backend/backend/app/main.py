from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import auth, profile, courses, majors, skills, skills_tracking, roadmap, whatif
import os

app = FastAPI(
    title="Curriculum Planner API",
    description="AI-powered curriculum planning backend",
    version="1.0.0"
)

# Configure allowed origins - can be customized via environment variables
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Specific origins instead of wildcard for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
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

@app.get("/health/llm")
def llm_health_check():
    """Check if Ollama neural network server is accessible"""
    from app.llm_service import GeminiService
    gem = GeminiService()
    try:
        result = gem.test_llm_connection()
        return {"status": "connected", "llm_service": result}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Curriculum Planner - FastAPI Backend

An AI-powered curriculum planning system that generates personalized learning roadmaps for students based on their career goals, using Ollama LLM integration.

## Features

- **User Authentication**: JWT-based registration and login
- **AI-Powered Roadmap Generation**: Uses Ollama LLM to generate 4-semester learning paths
- **Skill Tracking**: Monitors student skill acquisition throughout their journey
- **Dynamic Course Selection**: Adaptive recommendations based on completed courses and workload
- **What-If Analysis**: Explores alternative career paths and goal changes
- **Student Profiles**: Detailed tracking of progress, skills, and completed courses

## Project Structure

\`\`\`
app/
├── models.py           # SQLAlchemy database models
├── schemas.py          # Pydantic request/response schemas
├── database.py         # Database connection and initialization
├── auth.py            # JWT authentication logic
├── config.py          # Configuration and settings
├── llm_service.py     # Ollama LLM integration
├── main.py            # FastAPI app initialization
└── routes/
    ├── auth.py        # Authentication endpoints
    ├── profile.py     # User profile endpoints
    ├── courses.py     # Course management
    ├── majors.py      # Academic major management
    ├── skills.py      # Skill management
    ├── skills_tracking.py  # Skill tracking and progression
    ├── roadmap.py     # Roadmap generation and selection
    └── whatif.py      # What-if analysis endpoints
\`\`\`

## Installation

1. **Clone and setup environment**:
   \`\`\`bash
   git clone <repo>
   cd curriculum-planner-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Create .env file**:
   \`\`\`
   DATABASE_URL=sqlite:///./curriculum.db
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=mistral
   SECRET_KEY=your-secret-key-change-this
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   \`\`\`

4. **Ensure Ollama is running**:
   \`\`\`bash
   ollama serve
   # In another terminal: ollama pull mistral
   \`\`\`

5. **Run the server**:
   \`\`\`bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

6. **Seed the database** (optional):
   \`\`\`bash
   python scripts/seed_data.py
   \`\`\`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Profile
- `GET /profile/me` - Get user profile with skills and completed courses
- `PUT /profile/goal` - Update career goal
- `PUT /profile/semester` - Update current semester

### Courses & Majors
- `GET /courses/` - Get all courses
- `GET /courses/{course_id}` - Get specific course
- `GET /courses/semester/{semester}` - Get courses available in semester
- `GET /majors/` - Get all academic majors
- `GET /majors/{major_id}` - Get specific major

### Roadmap Generation
- `POST /roadmap/generate` - Generate initial roadmap based on goal
- `POST /roadmap/select` - Select courses for a semester
- `GET /roadmap/current` - Get current roadmap
- `POST /roadmap/next-semester` - Get recommendations for next semester

### Skill Tracking
- `GET /skills/user` - Get user's acquired skills
- `POST /skills/mark-course-complete` - Mark course as completed
- `GET /skills/skill-progression` - Get detailed skill progression
- `GET /skills/recommendations` - Get skill recommendations

### What-If Analysis
- `POST /whatif/change-goal` - Analyze changing career goal
- `POST /whatif/career-path-comparison` - Compare multiple career paths
- `GET /whatif/skill-readiness/{goal}` - Check readiness for a specific goal

## Frontend Integration

### Example: Register and Login
\`\`\`javascript
// Register
const response = await fetch('http://localhost:8000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'secure_password',
    first_name: 'John',
    last_name: 'Doe',
    specialty: 'Computer Science'
  })
});

// Login
const loginResponse = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'secure_password'
  })
});
const { access_token } = await loginResponse.json();
\`\`\`

### Example: Generate Roadmap
\`\`\`javascript
const response = await fetch('http://localhost:8000/roadmap/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    goal: 'Full Stack Developer',
    semester: 1
  })
});
const roadmap = await response.json();
\`\`\`

## Database Schema

**Users** - Store user profiles and progress
**Courses** - Available courses with details
**Academic_Majors** - Program information
**Skills** - Available skills categorized
**CompletedCourses** - Track user progress
**UserRoadmaps** - Store generated roadmaps
**RoadmapOptions** - Generated options for each semester

## Configuration

Key environment variables:
- `DATABASE_URL` - Database connection string (SQLite, PostgreSQL, etc.)
- `OLLAMA_URL` - Ollama server URL
- `OLLAMA_MODEL` - Model to use (mistral, llama2, neural-chat, etc.)
- `SECRET_KEY` - JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time

## Development

### Adding New Routes
1. Create new file in `app/routes/`
2. Define router with `APIRouter`
3. Include router in `app/main.py`

### Extending LLM Capabilities
Edit `app/llm_service.py` to add new prompt templates and parsing logic.

## Testing

Use FastAPI's interactive docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Performance Notes

- Roadmap generation may take 10-30 seconds (Ollama inference time)
- Use caching for frequently accessed courses/majors
- Consider async database operations for production scale

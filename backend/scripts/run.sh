#!/bin/bash

# Curriculum Planner Backend Startup Script

echo "Starting Curriculum Planner Backend..."
echo "======================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Seed database
echo "Seeding database with sample data..."
python scripts/seed_data.py

# Start the server
echo "Starting FastAPI server on http://0.0.0.0:8000"
echo "API Documentation available at: http://localhost:8000/docs"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

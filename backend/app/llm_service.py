import requests
import json
from typing import List, Dict, Any
from app.config import settings

class OllamaService:
    """Service for interacting with Ollama LLM"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_URL
        self.model = settings.OLLAMA_MODEL
    
    def generate_roadmap_options(
        self,
        goal: str,
        available_courses: List[Dict[str, Any]],
        completed_skills: List[str],
        difficulty_preference: str = "medium",
        workload_limit: int = 20
    ) -> List[List[Dict[str, Any]]]:
        """
        Generate course options for each semester using Ollama
        
        Args:
            goal: Target job specialty/career goal
            available_courses: List of courses with details
            completed_skills: Skills the student has already acquired
            difficulty_preference: "easy", "medium", or "hard"
            workload_limit: Max hours per week
        
        Returns:
            List of course option sets (each set is for a semester)
        """
        
        prompt = self._build_roadmap_prompt(
            goal, available_courses, completed_skills, difficulty_preference, workload_limit
        )
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.7
                },
                timeout=60
            )
            response.raise_for_status()
            
            result = response.json()
            generated_text = result.get("response", "")
            
            # Parse the LLM response to extract course options
            course_options = self._parse_roadmap_response(generated_text, available_courses)
            return course_options
            
        except requests.exceptions.RequestException as e:
            print(f"Error calling Ollama: {e}")
            # Fallback: return random courses if LLM fails
            return self._get_fallback_roadmap(available_courses, workload_limit)
    
    def recommend_next_semester_courses(
        self,
        goal: str,
        completed_courses: List[Dict[str, Any]],
        available_courses: List[Dict[str, Any]],
        current_skills: List[str],
        workload_limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Generate course recommendations for the next semester"""
        
        prompt = self._build_next_semester_prompt(
            goal, completed_courses, available_courses, current_skills, workload_limit
        )
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.7
                },
                timeout=60
            )
            response.raise_for_status()
            
            result = response.json()
            generated_text = result.get("response", "")
            
            courses = self._parse_course_recommendations(generated_text, available_courses)
            return courses
            
        except requests.exceptions.RequestException as e:
            print(f"Error calling Ollama: {e}")
            return self._get_fallback_courses(available_courses, workload_limit)
    
    def _build_roadmap_prompt(
        self, goal: str, courses: List, skills: List[str], difficulty: str, workload: int
    ) -> str:
        """Build prompt for initial roadmap generation"""
        
        courses_json = json.dumps(
            [{
                "id": c.get("id"),
                "name": c.get("name"),
                "difficulty": c.get("difficulty"),
                "workload": c.get("workload_hours"),
                "skills": c.get("skills", [])
            } for c in courses],
            indent=2
        )
        
        return f"""You are an expert curriculum planner. Based on the student's goal and available courses, 
create a 4-semester learning roadmap (2 years) that progressively builds skills needed to achieve their goal.

Goal: {goal}
Student's Current Skills: {", ".join(skills) if skills else "None"}
Available Courses: {courses_json}
Difficulty Preference: {difficulty}
Max Weekly Workload: {workload} hours

Requirements:
1. Return EXACTLY 4 lists of courses (one per semester)
2. Each semester should have 3-4 related courses
3. Total workload per semester should not exceed {workload} hours
4. Prerequisites should be considered (foundational courses before advanced)
5. Format output as JSON with structure: {{"semester_1": [course_ids], "semester_2": [course_ids], ...}}
6. Only use course IDs that exist in the available courses

Generate the roadmap:"""
    
    def _build_next_semester_prompt(
        self, goal: str, completed: List, available: List, skills: List[str], workload: int
    ) -> str:
        """Build prompt for next semester recommendations"""
        
        available_json = json.dumps(
            [{
                "id": c.get("id"),
                "name": c.get("name"),
                "difficulty": c.get("difficulty"),
                "workload": c.get("workload_hours"),
                "skills": c.get("skills", [])
            } for c in available],
            indent=2
        )
        
        completed_names = [c.get("name") for c in completed]
        
        return f"""You are an expert curriculum planner. The student has completed: {", ".join(completed_names)}
They have acquired these skills: {", ".join(skills)}
Their goal is: {goal}

Available courses for next semester: {available_json}

Recommend 3-4 courses that:
1. Build on their completed courses and skills
2. Move them toward their goal
3. Don't exceed {workload} hours total workload
4. Are appropriately challenging for their level

Format output as JSON: {{"recommended_courses": [course_ids]}}"""
    
    def _parse_roadmap_response(self, response_text: str, available_courses: List) -> List:
        """Parse LLM response to extract course options"""
        try:
            # Try to extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                parsed = json.loads(json_str)
                
                result = []
                for i in range(1, 5):
                    semester_key = f"semester_{i}"
                    if semester_key in parsed:
                        course_ids = parsed[semester_key]
                        courses = [c for c in available_courses if c.get("id") in course_ids]
                        result.append(courses)
                
                if len(result) == 4:
                    return result
        except (json.JSONDecodeError, ValueError):
            pass
        
        # Fallback
        return self._get_fallback_roadmap(available_courses, 20)
    
    def _parse_course_recommendations(self, response_text: str, available_courses: List) -> List:
        """Parse course recommendations from LLM response"""
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                parsed = json.loads(json_str)
                
                course_ids = parsed.get("recommended_courses", [])
                return [c for c in available_courses if c.get("id") in course_ids]
        except (json.JSONDecodeError, ValueError):
            pass
        
        return self._get_fallback_courses(available_courses, 20)
    
    def _get_fallback_roadmap(self, courses: List, workload_limit: int) -> List:
        """Fallback roadmap generation"""
        result = []
        for semester in range(4):
            semester_courses = []
            total_workload = 0
            for course in courses:
                if total_workload + course.get("workload_hours", 5) <= workload_limit:
                    semester_courses.append(course)
                    total_workload += course.get("workload_hours", 5)
                    if len(semester_courses) >= 4:
                        break
            result.append(semester_courses)
        return result
    
    def _get_fallback_courses(self, courses: List, workload_limit: int) -> List:
        """Fallback course recommendations"""
        result = []
        total_workload = 0
        for course in courses[:5]:
            if total_workload + course.get("workload_hours", 5) <= workload_limit:
                result.append(course)
                total_workload += course.get("workload_hours", 5)
        return result

# Create singleton instance
ollama_service = OllamaService()

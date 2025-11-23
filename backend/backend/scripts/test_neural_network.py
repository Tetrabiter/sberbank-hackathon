"""
Test script to verify connection between FastAPI backend and Google Gemini LLM
Run this on the Backend computer to diagnose Gemini API connectivity issues
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.llm_service import gemini_service

def test_gemini_connection():
    """Test connection to Google Gemini API"""
    print("\n" + "="*70)
    print("NEURAL NETWORK (GOOGLE GEMINI) CONNECTIVITY TEST")
    print("="*70)
    
    print(f"\nLLM Provider: Google Gemini")
    print(f"Model: {settings.GEMINI_MODEL}")
    print("API Key: " + ("*" * len(settings.GOOGLE_GEMINI_API_KEY[:-4])) + settings.GOOGLE_GEMINI_API_KEY[-4:] if settings.GOOGLE_GEMINI_API_KEY else "NOT SET")
    
    try:
        print("\n[1] Testing connection to Google Gemini API...")
        result = gemini_service.test_llm_connection()
        
        if result.get("status") == "connected":
            print("✓ Successfully connected to Google Gemini")
            print(f"  Model: {result.get('model')}")
            print(f"  Message: {result.get('message')}")
        else:
            print(f"✗ Failed to connect to Google Gemini")
            print(f"  Status: {result.get('status')}")
            print(f"  Error: {result.get('error')}")
            return False
        
        # Test prompt generation
        print(f"\n[2] Testing prompt generation with '{settings.GEMINI_MODEL}'...")
        
        from app.llm_service import genai
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        test_prompt = "What is 2+2? Answer in one sentence."
        
        response = model.generate_content(test_prompt)
        generated = response.text.strip()
        
        print(f"✓ Model '{settings.GEMINI_MODEL}' generated a response")
        print(f"  Prompt: '{test_prompt}'")
        print(f"  Response: '{generated}'")
        
        print("\n" + "="*70)
        print("✓ NEURAL NETWORK TEST PASSED")
        print("✓ Google Gemini is accessible and responding correctly")
        print("="*70 + "\n")
        return True
        
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        print(f"\n  Troubleshooting:")
        print(f"  1. Verify GOOGLE_GEMINI_API_KEY is set in .env file")
        print(f"  2. Check API key validity at https://ai.google.dev/")
        print(f"  3. Ensure you have internet connection to reach Google's API")
        print(f"  4. Check if the model '{settings.GEMINI_MODEL}' is available")
        return False

def main():
    print("\nRunning Neural Network Connectivity Test...")
    print("This test verifies connection to Google Gemini API")
    
    success = test_gemini_connection()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

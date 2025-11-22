"""
Comprehensive test script to verify all three servers are connected
Run this on the Backend machine to test the entire system
"""
import requests
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings


def test_all_connections():
    """Test complete server connectivity"""
    print("\n" + "=" * 70)
    print("COMPREHENSIVE MULTI-COMPUTER SYSTEM TEST")
    print("=" * 70)
    print("\nArchitecture:")
    print("  Computer A (Neural Network): Ollama on port 11434")
    print("  Computer B (Backend):        FastAPI on port 8000")
    print("  Computer C (Frontend):       React on port 3000")

    results = {
        "neural_network": None,
        "backend_health": None,
        "backend_to_neural_network": None,
        "cors_configuration": None,
    }

    # Test 1: Neural Network (Ollama)
    print("\n" + "-" * 70)
    print("[1] NEURAL NETWORK (OLLAMA) TEST")
    print(f"    Location: Computer A")
    print(f"    URL: {settings.OLLAMA_URL}")
    print("-" * 70)

    try:
        response = requests.get(f"{settings.OLLAMA_URL}/api/tags", timeout=5)
        response.raise_for_status()
        models = response.json().get("models", [])

        print(f"✓ Connected to Ollama")
        print(f"  Available models: {len(models)}")

        model_exists = any(m['name'].startswith(settings.OLLAMA_MODEL) for m in models)
        if model_exists:
            print(f"  ✓ Model '{settings.OLLAMA_MODEL}' is available")
            results["neural_network"] = "success"
        else:
            print(f"  ✗ Model '{settings.OLLAMA_MODEL}' not found")
            results["neural_network"] = "model_missing"

    except Exception as e:
        print(f"✗ Connection failed: {str(e)}")
        results["neural_network"] = "failed"

    # Test 2: Backend Health
    print("\n" + "-" * 70)
    print("[2] BACKEND SERVER TEST")
    print("    Location: Computer B (this computer)")
    print("    URL: http://localhost:8000")
    print("-" * 70)

    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        response.raise_for_status()
        health = response.json()
        print(f"✓ Backend is running")
        print(f"  Status: {health.get('status')}")
        results["backend_health"] = "success"
    except Exception as e:
        print(f"✗ Backend not accessible: {str(e)}")
        results["backend_health"] = "failed"

    # Test 3: Backend to Neural Network
    print("\n" + "-" * 70)
    print("[3] BACKEND → NEURAL NETWORK CONNECTION TEST")
    print(f"    Backend connects to Ollama at: {settings.OLLAMA_URL}")
    print("-" * 70)

    try:
        response = requests.get("http://localhost:8000/health/llm", timeout=10)
        response.raise_for_status()
        llm_health = response.json()
        status = llm_health.get("status")

        if status == "connected":
            print(f"✓ Backend is connected to Neural Network")
            results["backend_to_neural_network"] = "success"
        else:
            print(f"✗ Backend cannot reach Neural Network")
            print(f"  Error: {llm_health.get('error')}")
            results["backend_to_neural_network"] = "failed"

    except Exception as e:
        print(f"✗ Could not check Backend-to-NeuralNet status: {str(e)}")
        results["backend_to_neural_network"] = "failed"

    # Test 4: CORS Configuration
    print("\n" + "-" * 70)
    print("[4] CORS CONFIGURATION TEST")
    print("    For Frontend (Computer C) to access Backend (Computer B)")
    print("-" * 70)

    try:
        response = requests.options(
            "http://localhost:8000/health",
            headers={"Origin": "http://localhost:3000"},
            timeout=5
        )

        allow_origin = response.headers.get("Access-Control-Allow-Origin")
        allow_methods = response.headers.get("Access-Control-Allow-Methods")
        allow_headers = response.headers.get("Access-Control-Allow-Headers")

        if allow_origin:
            print(f"✓ CORS is configured")
            print(f"  Allow-Origin: {allow_origin}")
            print(f"  Allow-Methods: {allow_methods}")
            results["cors_configuration"] = "success"
        else:
            print(f"✗ CORS headers not found")
            results["cors_configuration"] = "failed"

    except Exception as e:
        print(f"✗ CORS test failed: {str(e)}")
        results["cors_configuration"] = "failed"

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)

    for test_name, result in results.items():
        status_icon = "✓" if result == "success" else "✗"
        print(f"{status_icon} {test_name.replace('_', ' ').title()}: {result.upper()}")

    all_success = all(v == "success" for v in results.values())

    print("\n" + "=" * 70)
    if all_success:
        print("✓ ALL TESTS PASSED")
        print("✓ System is ready for Frontend integration!")
        print("\nNext steps:")
        print("  1. Start React Frontend on Computer C")
        print("  2. Point frontend to: http://<COMPUTER_B_IP>:8000")
        print("  3. Use API endpoints to register and create roadmaps")
        print("=" * 70 + "\n")
        return 0
    else:
        print("✗ SOME TESTS FAILED")
        print("\nFailing tests:")
        for test_name, result in results.items():
            if result != "success":
                print(f"  • {test_name}: {result}")
        print("\nCommon fixes:")
        print("  1. Ollama: Ensure running on Computer A: ollama serve")
        print("  2. Backend: Ensure running on Computer B: uvicorn app.main:app --reload --host 0.0.0.0")
        print("  3. Check .env file for correct OLLAMA_URL and ALLOWED_ORIGINS")
        print("=" * 70 + "\n")
        return 1


if __name__ == "__main__":
    sys.exit(test_all_connections())

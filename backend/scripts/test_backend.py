"""
Test script to verify FastAPI backend is running and accessible
Run this from any computer to test the Backend server
"""
import requests
import json
import sys
import argparse


def test_backend_connection(backend_url):
    """Test connection to FastAPI backend"""
    print("\n" + "=" * 70)
    print("BACKEND SERVER CONNECTIVITY TEST")
    print("=" * 70)

    print(f"\nTarget URL: {backend_url}")
    print("(This should point to Computer B where FastAPI is running)")

    try:
        print("\n[1] Testing basic backend health...")
        response = requests.get(f"{backend_url}/health", timeout=5)
        response.raise_for_status()
        health = response.json()
        print(f"✓ Backend is running and healthy")
        print(f"  Status: {health.get('status')}")

        print("\n[2] Testing LLM (Neural Network) health...")
        response = requests.get(f"{backend_url}/health/llm", timeout=5)
        response.raise_for_status()
        llm_health = response.json()
        status = llm_health.get("status")

        if status == "connected":
            print(f"✓ Backend is connected to Neural Network")
            print(f"  LLM Status: {status}")
        else:
            print(f"⚠ Backend to Neural Network connection issue")
            print(f"  LLM Status: {status}")
            print(f"  Error: {llm_health.get('error', 'Unknown')}")

        print("\n[3] Testing CORS headers for frontend origin...")
        test_origins = [
            "http://localhost:3000",
            "http://localhost:5173"
        ]

        for origin in test_origins:
            response = requests.options(
                f"{backend_url}/health",
                headers={"Origin": origin},
                timeout=5
            )

            allow_origin = response.headers.get("Access-Control-Allow-Origin")
            if allow_origin:
                print(f"✓ CORS enabled for origin: {origin}")
            else:
                print(f"⚠ CORS not enabled for origin: {origin}")

        print("\n[4] Testing API documentation...")
        response = requests.get(f"{backend_url}/docs", timeout=5)
        response.raise_for_status()
        print(f"✓ API documentation is available at: {backend_url}/docs")

        print("\n" + "=" * 70)
        print("✓ BACKEND TEST PASSED")
        print("✓ Backend is running and accessible")
        print("=" * 70 + "\n")
        return True

    except requests.exceptions.ConnectionError:
        print(f"\n✗ CONNECTION ERROR")
        print(f"  Cannot reach {backend_url}")
        print(f"\n  Troubleshooting:")
        print(f"  1. Verify Computer B IP address and port")
        print(f"  2. Ensure Backend is running on Computer B:")
        print(f"     $ uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        print(f"  3. Check firewall on Computer B - port 8000 must be open")
        print(f"  4. Test from command line: curl {backend_url}/health")
        return False

    except requests.exceptions.Timeout:
        print(f"\n✗ TIMEOUT ERROR")
        print(f"  Backend at {backend_url} is not responding")
        print(f"  Check if the server is running and reachable")
        return False

    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Test Backend Server Connectivity")
    parser.add_argument(
        "--backend-url",
        default="http://localhost:8090",
        help="Backend URL (default: http://localhost:8090)"
    )

    args = parser.parse_args()

    print("\nRunning Backend Connectivity Test...")
    print("For multi-computer setup: python scripts/test_backend.py --backend-url http://192.168.1.101:8000")

    success = test_backend_connection(args.backend_url)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

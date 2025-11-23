/**
 * Simple test utilities for React Frontend to verify backend connectivity
 * Copy this file to your React project and use in a test component
 */

interface BackendTestResult {
  endpoint: string
  success: boolean
  message: string
  data?: any
}

interface AuthTestResult extends BackendTestResult {
  token?: string
}

/**
 * Test basic backend health endpoint
 * Call this to verify the backend is running and accessible
 */
export async function testBackendHealth(backendUrl: string): Promise<BackendTestResult> {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return {
        endpoint: "/health",
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      endpoint: "/health",
      success: true,
      message: "Backend is healthy",
      data: data,
    }
  } catch (error: any) {
    return {
      endpoint: "/health",
      success: false,
      message: `Connection error: ${error.message}`,
    }
  }
}

/**
 * Test neural network (LLM) connectivity through backend
 * Verifies backend can reach Ollama on Computer A
 */
export async function testLLMHealth(backendUrl: string): Promise<BackendTestResult> {
  try {
    const response = await fetch(`${backendUrl}/health/llm`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return {
        endpoint: "/health/llm",
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const isConnected = data.status === "connected"

    return {
      endpoint: "/health/llm",
      success: isConnected,
      message: isConnected ? "Neural network is connected" : `Neural network issue: ${data.error}`,
      data: data,
    }
  } catch (error: any) {
    return {
      endpoint: "/health/llm",
      success: false,
      message: `Connection error: ${error.message}`,
    }
  }
}

/**
 * Test user registration (creates a test user)
 * Verifies full backend functionality
 */
export async function testUserRegistration(
  backendUrl: string,
  testEmail = "test@example.com",
): Promise<AuthTestResult> {
  try {
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: "TestPassword123!",
        full_name: "Test User",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        endpoint: "/api/auth/register",
        success: false,
        message: `Registration failed: ${data.detail || data.message}`,
        data: data,
      }
    }

    return {
      endpoint: "/api/auth/register",
      success: true,
      message: "User registered successfully",
      data: data,
      token: data.access_token,
    }
  } catch (error: any) {
    return {
      endpoint: "/api/auth/register",
      success: false,
      message: `Connection error: ${error.message}`,
    }
  }
}

/**
 * Test CORS by making a preflight request
 * Verifies backend CORS configuration
 */
export async function testCORS(backendUrl: string): Promise<BackendTestResult> {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type",
      },
    })

    const hasAccessControl = response.headers.has("Access-Control-Allow-Origin")
    const allowedOrigin = response.headers.get("Access-Control-Allow-Origin")

    return {
      endpoint: "CORS Preflight",
      success: hasAccessControl,
      message: hasAccessControl ? `CORS enabled for origin: ${allowedOrigin}` : "CORS headers not found",
      data: {
        allowedOrigin: allowedOrigin,
        allowedMethods: response.headers.get("Access-Control-Allow-Methods"),
        allowedHeaders: response.headers.get("Access-Control-Allow-Headers"),
      },
    }
  } catch (error: any) {
    return {
      endpoint: "CORS Preflight",
      success: false,
      message: `CORS test error: ${error.message}`,
    }
  }
}

/**
 * Run all connectivity tests
 * Returns array of all test results
 */
export async function runAllTests(backendUrl: string): Promise<BackendTestResult[]> {
  const results: BackendTestResult[] = []

  results.push(await testBackendHealth(backendUrl))
  results.push(await testLLMHealth(backendUrl))
  results.push(await testCORS(backendUrl))

  return results
}

/**
 * Helper function to get backend URL from environment or user input
 */
export function getBackendUrl(): string {
  // Check for environment variable first
  if (typeof window !== "undefined") {
    // For Next.js frontend
    if ((window as any).NEXT_PUBLIC_API_URL) {
      return (window as any).NEXT_PUBLIC_API_URL
    }

    // For React/Vite frontend
    const envUrl = import.meta.env?.VITE_API_URL
    if (envUrl) {
      return envUrl
    }
  }

  // Fallback to localhost for development
  return "http://localhost:8000"
}

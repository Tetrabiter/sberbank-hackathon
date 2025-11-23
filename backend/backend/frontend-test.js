/**
 * Simple Node.js test script for React project
 * Can be run from frontend project to test backend connectivity before starting app
 */

const http = require("http")
const https = require("https")

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const protocol = urlObj.protocol === "https:" ? https : http

    protocol
      .request(urlObj, { method: "GET", timeout: 5000, ...options }, (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => resolve({ status: res.statusCode, data: data, headers: res.headers }))
      })
      .on("error", reject)
      .end()
  })
}

async function runTests() {
  console.log("\n" + "=".repeat(70))
  console.log("FRONTEND BACKEND CONNECTIVITY TEST")
  console.log("=".repeat(70))
  console.log(`\nBackend URL: ${BACKEND_URL}`)
  console.log("Running tests to verify backend is accessible from frontend...\n")

  let passed = 0
  let failed = 0

  // Test 1: Health Check
  console.log("[1] Testing Backend Health...")
  try {
    const health = await makeRequest(`${BACKEND_URL}/health`)
    if (health.status === 200) {
      console.log("✓ Backend is running\n")
      passed++
    } else {
      console.log(`✗ Unexpected status: ${health.status}\n`)
      failed++
    }
  } catch (e) {
    console.log(`✗ Cannot reach backend: ${e.message}`)
    console.log("  Make sure backend is running: uvicorn app.main:app --host 0.0.0.0\n")
    failed++
  }

  // Test 2: LLM Health
  console.log("[2] Testing Neural Network Connection...")
  try {
    const llmHealth = await makeRequest(`${BACKEND_URL}/health/llm`)
    if (llmHealth.status === 200) {
      console.log("✓ Can check neural network status\n")
      passed++
    } else {
      console.log(`✗ Unexpected status: ${llmHealth.status}\n`)
      failed++
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}\n`)
    failed++
  }

  // Test 3: CORS
  console.log("[3] Testing CORS Configuration...")
  try {
    const corsTest = await makeRequest(`${BACKEND_URL}/health`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3000" },
    })
    const hasAccessControl = corsTest.headers["access-control-allow-origin"]
    if (hasAccessControl) {
      console.log(`✓ CORS enabled: ${hasAccessControl}\n`)
      passed++
    } else {
      console.log("✗ CORS headers not found\n")
      failed++
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}\n`)
    failed++
  }

  // Summary
  console.log("=".repeat(70))
  console.log(`RESULTS: ${passed} passed, ${failed} failed`)
  console.log("=".repeat(70) + "\n")

  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(console.error)

# Multi-Server Deployment Guide

This document explains how to set up the curriculum planner with three separate servers (Neural Network, Backend, Frontend) running on different computers.

## Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Your Network                            │
├──────────────────┬──────────────────┬──────────────────────┤
│                  │                  │                      │
│  Computer A      │  Computer B      │  Computer C          │
│  (Neural Net)    │  (Backend)       │  (Frontend)          │
│                  │                  │                      │
│  Ollama Server   │  FastAPI Backend │  React App           │
│  Port: 11434     │  Port: 8000      │  Port: 3000          │
│                  │                  │                      │
│  ollama serve    │  uvicorn ...     │  npm run dev         │
└──────────────────┴──────────────────┴──────────────────────┘
         ↓                  ↓                   ↓
      :11434            :8000               :3000
\`\`\`

## Prerequisites

- Python 3.8+ (Backend)
- Node.js 16+ (Frontend)
- Ollama (Neural Network)
- Network connectivity between all three computers

## Step 1: Setup Neural Network Server (Ollama)

**Computer A - Neural Network Server**

1. Install Ollama from https://ollama.ai
2. Start the Ollama server on port 11434:
   \`\`\`bash
   ollama serve
   \`\`\`
3. Pull the mistral model (or your preferred model):
   \`\`\`bash
   # In another terminal
   ollama pull mistral
   \`\`\`

**Verify Ollama is accessible:**
\`\`\`bash
curl http://localhost:11434/api/tags
\`\`\`

## Step 2: Setup Backend Server (FastAPI)

**Computer B - Backend Server**

1. Clone the repository and navigate to backend:
   \`\`\`bash
   git clone <repo>
   cd curriculum-planner-backend
   \`\`\`

2. Create virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. Create `.env` file with network addresses:
   \`\`\`
   DATABASE_URL=sqlite:///./curriculum.db
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Point to Computer A (Neural Network)
   OLLAMA_URL=http://<COMPUTER_A_IP>:11434
   OLLAMA_MODEL=mistral
   
   # Allow requests from all Frontend origins
   ALLOWED_ORIGINS=http://<COMPUTER_C_IP>:3000,http://<COMPUTER_C_IP>:5173
   \`\`\`

5. Replace placeholders:
   - `<COMPUTER_A_IP>` - IP address of Computer A (e.g., 192.168.1.100)
   - `<COMPUTER_C_IP>` - IP address of Computer C (e.g., 192.168.1.102)

6. Initialize database:
   \`\`\`bash
   python scripts/seed_data.py
   \`\`\`

7. Start the backend server (bind to 0.0.0.0 to accept remote connections):
   \`\`\`bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

**Verify Backend is accessible from Computer C:**
\`\`\`bash
curl http://<COMPUTER_B_IP>:8000/health
\`\`\`

## Step 3: Setup Frontend Server (React)

**Computer C - Frontend Server**

1. Clone the frontend repository:
   \`\`\`bash
   git clone <frontend-repo>
   cd curriculum-planner-frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create `.env.local` file:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://<COMPUTER_B_IP>:8000
   \`\`\`

4. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

   The app will be available at `http://localhost:3000`

## Testing Connectivity

### Test 1: Neural Network ↔ Backend

Run on Computer B:
\`\`\`bash
python scripts/test_neural_network.py
\`\`\`

This will verify the backend can communicate with Ollama on Computer A.

### Test 2: Backend Server Health

Run on Computer C (or any computer with network access):
\`\`\`bash
curl http://<COMPUTER_B_IP>:8000/health
curl http://<COMPUTER_B_IP>:8000/health/llm
\`\`\`

### Test 3: Frontend React Connectivity

Open your browser and navigate to the connectivity test page:
- If using Next.js: You'll see status indicators for all connections
- Tests will automatically run and show connection status

### Test 4: Full End-to-End

1. Register a user from the React frontend
2. Generate a roadmap
3. Verify the backend created database entries
4. Check that Ollama was called for roadmap generation

## Common Issues & Solutions

### Issue: Backend cannot reach Ollama

**Problem:**
\`\`\`
Error: Cannot reach Ollama at http://<COMPUTER_A_IP>:11434
\`\`\`

**Solutions:**
1. Verify Computer A IP address: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
2. Ensure Ollama is running: `ollama serve`
3. Check firewall on Computer A - port 11434 must be accessible
4. Test from Computer B: `curl http://<COMPUTER_A_IP>:11434/api/tags`

### Issue: Frontend cannot reach Backend

**Problem:**
\`\`\`
CORS error or connection refused
\`\`\`

**Solutions:**
1. Verify Computer B IP address
2. Ensure backend is running: `uvicorn app.main:app --host 0.0.0.0`
3. Check firewall on Computer B - port 8000 must be accessible
4. Update `.env.local` with correct IP: `NEXT_PUBLIC_API_URL=http://<COMPUTER_B_IP>:8000`
5. Verify CORS is configured in backend `.env`:
   \`\`\`
   ALLOWED_ORIGINS=http://<COMPUTER_C_IP>:3000
   \`\`\`

### Issue: CORS errors in browser console

**Solutions:**
1. Check that backend has CORS middleware enabled (it should be in `app/main.py`)
2. Verify `ALLOWED_ORIGINS` includes your frontend origin
3. Backend must be restarted after changing `.env`:
   \`\`\`bash
   # Stop current backend
   Ctrl+C
   # Restart
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

### Issue: Model not found in Ollama

**Problem:**
\`\`\`
Error: model "mistral" not found
\`\`\`

**Solutions:**
1. Pull the model on Computer A:
   \`\`\`bash
   ollama pull mistral
   \`\`\`
2. List available models:
   \`\`\`bash
   ollama list
   \`\`\`
3. Update `OLLAMA_MODEL` in backend `.env` if using different model

## Production Deployment

For production deployment on the same or different machines:

1. **Use environment variables** instead of hardcoding IPs
2. **Enable HTTPS** for frontend and backend
3. **Configure proper firewall rules** - only expose necessary ports
4. **Use domain names** instead of IPs where possible
5. **Set up proper authentication** and rate limiting
6. **Monitor server logs** for errors and performance issues

### Example Production .env for Backend

\`\`\`
DATABASE_URL=postgresql://user:password@db.example.com/curriculum
OLLAMA_URL=http://ollama.internal:11434
OLLAMA_MODEL=mistral
SECRET_KEY=<strong-random-key>
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=https://app.example.com,https://www.app.example.com
\`\`\`

### Example Production .env.local for Frontend

\`\`\`
NEXT_PUBLIC_API_URL=https://api.example.com
\`\`\`

## Network Diagram

\`\`\`
Internet
   ↓
[Firewall]
   ↓
┌─────────────────────────────────────┐
│      Local Network / VPN            │
├─────────────┬───────────┬───────────┤
│             │           │           │
v             v           v           v
Computer A   Computer B  Computer C  (Optional)
(Ollama)     (Backend)   (Frontend)  (Database)
:11434       :8000       :3000       :5432
\`\`\`

## Troubleshooting Commands

### Check if port is open and accessible

**From Computer B to Computer A:**
\`\`\`bash
telnet <COMPUTER_A_IP> 11434
curl http://<COMPUTER_A_IP>:11434/api/tags
\`\`\`

**From Computer C to Computer B:**
\`\`\`bash
telnet <COMPUTER_B_IP> 8000
curl http://<COMPUTER_B_IP>:8000/health
\`\`\`

### View server logs

**Ollama:**
\`\`\`bash
# Check Ollama process
ps aux | grep ollama
\`\`\`

**Backend:**
\`\`\`bash
# Check uvicorn logs (should show connection attempts)
# Logs appear in terminal where you ran uvicorn
\`\`\`

**Frontend:**
\`\`\`bash
# Browser Developer Tools (F12) → Console tab
# Shows API requests and CORS errors
\`\`\`

## Support

For issues or questions:
1. Check the test scripts output
2. Review server logs
3. Verify network connectivity between computers
4. Ensure all environment variables are correctly set

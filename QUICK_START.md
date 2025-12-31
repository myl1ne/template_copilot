# Quick Start Guide

This guide will help you get the Gamified LLM Research Platform up and running.

## Prerequisites

- **Python 3.9+** - For backend
- **Node.js 16+** - For frontend  
- **Firebase Project** (optional) - For persistent storage

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/myl1ne/template_copilot.git
cd template_copilot
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment (optional)
cp .env.example .env
# Edit .env if you have Firebase credentials
```

**Note:** The backend will run in DEMO MODE without Firebase credentials, using in-memory storage.

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### Start the Backend

```bash
cd backend
python main.py
```

The backend API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will open automatically at `http://localhost:3000`

## First Steps

### 1. Create Your First Agent

1. Click the **"Create Agent"** button on the dashboard
2. Give your agent a name (e.g., "Research Assistant")
3. Enter a task prompt (e.g., "Research quantum computing applications")
4. Optionally select a template (e.g., "Researcher")
5. Set a computation budget (default: 100)
6. Click **"Create Agent"**

### 2. Start the Agent

1. Click on your newly created agent card
2. Click the **"Start Agent"** button
3. Watch the execution logs appear in real-time

### 3. Spawn a Child Agent (Optional)

When an agent is running:

1. Click **"Spawn Child"** button
2. Create a sub-agent with a related task
3. The child will use part of the parent's budget

### 4. Complete an Agent

When you're ready to finish:

1. Click **"Complete"** button
2. Enter a result or summary
3. Earn XP and level up!

## Demo Mode vs Production

### Demo Mode (No Firebase)
- ✅ Fully functional for testing
- ✅ All features work
- ❌ Data is stored in memory only
- ❌ Lost on server restart

### Production Mode (With Firebase)
- ✅ Persistent data storage
- ✅ Scalable for multiple users
- ✅ Data survives restarts
- 📝 Requires Firebase setup (see below)

## Firebase Setup (Optional)

For persistent storage:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database

### 2. Get Credentials

1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `backend/firebase-credentials.json`

### 3. Update Configuration

Edit `backend/.env`:
```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
FIREBASE_PROJECT_ID=your-project-id
```

### 4. Restart Backend

The backend will now use Firestore for persistent storage!

## Exploring Agent Templates

Navigate to the **Templates** page to see available agent types:

- 🔍 **Auditor** - Reviews and verifies outputs
- ⚖️ **Ethical Committee** - Evaluates ethical concerns
- 🧠 **Critical Thinker** - Analyzes logic and arguments
- 📚 **Researcher** - Gathers and synthesizes information
- 📝 **Summarizer** - Condenses complex information

## Gamification Features

### Leveling System
- Complete agents to earn Experience Points (XP)
- Level up to unlock new templates and features
- Each level requires `level × 1000` XP

### Computation Budget
- Start with 1000 computation units
- Each agent consumes budget based on complexity
- Gain more budget by leveling up

### Agent Depth
- Create hierarchies up to 5 levels deep
- Deeper agents earn more XP when completed

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Reinstall dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend won't start
- Check Node version: `node --version` (need 16+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 is available

### "Demo Mode" warning
- This is normal without Firebase credentials
- Everything works, data just isn't persistent
- Set up Firebase for production use

### No real AI processing
- Current version simulates agent thinking
- LLM integration coming in v0.2.0
- See roadmap for details

## Next Steps

- Explore the **[Backend README](backend/README.md)** for API details
- Check out **[Frontend README](frontend/README.md)** for UI components
- Read the **[Roadmap](docs/roadmap.md)** for upcoming features
- Report issues on [GitHub](https://github.com/myl1ne/template_copilot/issues)

## Getting Help

- **Documentation**: See `docs/` folder
- **API Docs**: Visit `http://localhost:8000/docs` when backend is running
- **Issues**: GitHub Issues for bugs and feature requests
- **Examples**: Check the templates library for inspiration

---

Happy experimenting with AI agents! 🤖✨

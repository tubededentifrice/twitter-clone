# CLAUDE.md - Project Information

## Project Structure
- backend/ - FastAPI backend
- frontend/ - Legacy Bootstrap-based frontend
- frontend/react-app/ - React-based frontend

## Common Commands

### Backend
- Start development server: `cd backend && uvicorn app.main:app --reload`
- Install dependencies: `cd backend && pip install -r requirements.txt`
- Create virtual environment: `cd backend && python -m venv venv`
- Activate virtual environment: 
  - Windows: `backend\venv\Scripts\activate`
  - Unix/MacOS: `source backend/venv/bin/activate`

### React Frontend
- Install dependencies: `cd frontend/react-app && npm install`
- Start development server: `cd frontend/react-app && npm start`
- Build for production: `cd frontend/react-app && npm run build`

### Legacy Frontend
- Serve legacy frontend: `cd frontend && python -m http.server 8080`

### Testing
- Run backend tests: `cd backend && pytest`
- Run React tests: `cd frontend/react-app && npm test`

### Development Script
- Run all services with interactive selection: `./run_local.sh`

## Code Style Preferences
- Python: PEP 8
- React/JavaScript: ES6+, using functional components with hooks
- HTML/CSS: Bootstrap conventions
- Always use Linux line endings (LF) for all files

## Project Documentation
- Maintain prompt history in numbered files (PROMPT_HISTORY_001.md, PROMPT_HISTORY_002.md, etc.), 001 being the oldest
- Start a new prompt history file when the current file reaches 150 lines or more: make sure to check the latest PROMPT_HISTORY file length BEFORE adding to it, and create a new file accordingly
- Add each new user prompt to the current prompt history file with date, context, and outcome
- Update README.md when adding significant features

## Important Reminders
- ALWAYS update the current prompt history file after each prompt with a brief summary of the request and actions taken
- Check the line count of the current prompt history file and create a new numbered file when it exceeds 150 lines
- Ensure all files maintain Linux line endings (LF, not CRLF)
- After each significant change, consider running linting and tests
# CLAUDE.md - Project Information

## Project Structure
- backend/ - FastAPI backend
- frontend/ - Bootstrap-based frontend

## Common Commands

### Backend
- Start development server: `cd backend && uvicorn app.main:app --reload`
- Install dependencies: `cd backend && pip install -r requirements.txt`
- Create virtual environment: `cd backend && python -m venv venv`
- Activate virtual environment: 
  - Windows: `backend\venv\Scripts\activate`
  - Unix/MacOS: `source backend/venv/bin/activate`

### Frontend
- Serve frontend: `cd frontend && python -m http.server 8080`

### Testing
- Run backend tests: `cd backend && pytest`

## Code Style Preferences
- Python: PEP 8
- HTML/CSS: Bootstrap conventions
- JavaScript: ES6+
- Always use Linux line endings (LF) for all files

## Project Documentation
- Keep all prompt history in PROMPT_HISTORY.md to track the development journey
- Add each new user prompt to PROMPT_HISTORY.md with date, context, and outcome
- Update README.md when adding significant features

## Important Reminders
- ALWAYS update PROMPT_HISTORY.md after each prompt with a brief summary of the request and actions taken
- Ensure all files maintain Linux line endings (LF, not CRLF)
- After each significant change, consider running linting and tests
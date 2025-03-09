# CLAUDE.md - Project Information

## Project Structure
- `backend/` - FastAPI backend
- `frontend/react-app/` - React frontend

## Common Commands

### Backend
```bash
# Start server
cd backend && uvicorn app.main:app --reload

# Setup
cd backend && python -m venv venv
cd backend && pip install -r requirements.txt

# Activate venv
# Windows: backend\venv\Scripts\activate
# Unix/MacOS: source backend/venv/bin/activate

# Test
cd backend && pytest
```

### Frontend
```bash
# Start server
cd frontend/react-app && npm start

# Setup
cd frontend/react-app && npm install

# Build
cd frontend/react-app && npm run build

# Test
cd frontend/react-app && npm test
```

### Development
```bash
# Run all services with selection menu
./run_local.sh
```

## Code Style
- Python: PEP 8
- JavaScript: ES6+, functional components with hooks
- CSS: Bootstrap conventions
- Always use Linux line endings (LF)

## Documentation Rules
- PROMPT_HISTORY files are numbered sequentially (001, 002, etc.)
- CHECK file length BEFORE adding to prompt history
- CREATE new file when current exceeds 150 lines
- ALWAYS update prompt history with:
  1. Task heading (###)
  2. User prompt in "User Prompt:" section
  3. Claude's actions in "Claude:" section
- UPDATE README.md for significant features

## After Each Task
- MAINTAIN Linux line endings (LF, not CRLF)
- RUN linting and tests for significant changes
- GIT add and commit all changed files
- ENSURE newline at end of files
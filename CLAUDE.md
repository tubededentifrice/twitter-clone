# Twitter Clone Project Info

## Commands

### Development
```bash
# Run both backend and frontend
./scripts/dev.sh

# Backend only
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend only
cd frontend && npm run dev
```

### Testing
```bash
# Install pytest
cd backend && source venv/bin/activate && pip install pytest pytest-cov

# Run all tests
cd backend && source venv/bin/activate && pytest

# Run single test
cd backend && source venv/bin/activate && pytest tests/path_to_test.py::test_function -v
```

### Linting/Formatting
```bash
# Backend
cd backend && source venv/bin/activate && pip install black flake8 isort mypy
cd backend && source venv/bin/activate && black . && flake8 . && isort . && mypy .

# Frontend
cd frontend && npm run lint
```

## Code Style

### Backend
- **Imports**: Group stdlib, third-party, local imports. Use `isort`.
- **Formatting**: Use Black with 88 char line length.
- **Types**: Use type hints everywhere. Run mypy for validation.
- **Naming**: snake_case for functions/variables, PascalCase for classes.
- **Error handling**: Use explicit try/except. No bare excepts.
- **Docstrings**: Google style docstrings for all public functions.

### Frontend
- **Framework**: Next.js with Bootstrap 5
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error handling**: Use try/catch for API calls, propagate with ErrorBoundary
- **File structure**: Group by feature in `/app`
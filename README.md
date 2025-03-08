# Twitter Clone

A simplified Twitter clone built with FastAPI and Bootstrap.

## Project Overview

This project is a basic Twitter clone with the following features:
- User authentication (signup, login)
- Posting tweets (with 256 character limit)
- Tweet feed showing all posts in reverse chronological order

Planned features:
- Following users
- User profiles
- Like and retweet functionality
- Timeline showing only tweets from followed users

## Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: HTML, CSS, JavaScript with Bootstrap
- **Database**: SQLite (development), PostgreSQL (production)

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js and npm (optional, for frontend development)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Start the development server:
   ```
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Start a simple HTTP server:
   ```
   python -m http.server 8080
   ```

3. Open your browser and navigate to `http://localhost:8080`

## Quick Start
To start both backend and frontend servers with one command, run:
```
./run_local.sh
```

## API Documentation
Once the backend server is running, access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
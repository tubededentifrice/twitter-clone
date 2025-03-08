# Twitter Clone

A simplified Twitter clone built with FastAPI (Python 3.12) and Next.js.

## Project Overview

This project is a basic Twitter clone with the following features:
- User authentication (signup, login)
- Posting tweets
- Following users
- Timeline view

## Technology Stack

### Backend
- Python 3.12
- FastAPI (Web framework)
- SQLAlchemy (ORM)
- SQLite (Database)

### Frontend
- Next.js
- React
- Bootstrap 5 (UI framework)

## Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Running Development Servers
You can run both frontend and backend development servers with a single command:

```bash
# From the project root
./scripts/dev.sh
```

This will start:
- Backend server at http://localhost:8000
- Frontend server at http://localhost:3000

## API Documentation

Once the backend server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
twitter-clone/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── auth/          # Authentication logic
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── requirements.txt   # Python dependencies
├── frontend/              # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── styles/            # CSS styles
│   └── package.json       # Node.js dependencies
└── scripts/               # Utility scripts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

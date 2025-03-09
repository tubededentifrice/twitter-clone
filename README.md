# Twitter Clone

A simplified Twitter clone built with FastAPI and React.

## Project Overview

This project is a basic Twitter clone with the following features:
- User authentication (signup, login)
- Posting tweets (with 280 character limit)
- Tweet feed showing all posts in reverse chronological order (accessible without login)
- User profiles with profile picture management
- Follow/unfollow users functionality
- Follower/following lists management
- Like and dislike reactions on tweets
- Tweet replies and conversations
- Clickable @mentions that link to user profiles

Planned features:
- Timeline showing only tweets from followed users
- Media attachments for tweets
- Hashtags and trending topics

## Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: React with Bootstrap
- **Database**: SQLite (development), PostgreSQL (production)

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 14+ and npm 6+

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

### React Frontend Setup
1. Navigate to the React frontend directory:
   ```
   cd frontend/react-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3025`

### Run All Services
Use the provided script to run all services with interactive selection:
```
./run_local.sh
```

## Docker Deployment

### Using Docker Compose
1. Build and start the services:
   ```
   docker-compose up -d
   ```

2. Stop the services:
   ```
   docker-compose down
   ```

### Configuring Backend URL
You can configure the API backend URL by setting the `BACKEND_URL` environment variable:

```yaml
environment:
  - BACKEND_URL=https://api.example.com
```

This can be:
- A full URL like `https://domain.com/api`
- A relative path like `/api`
- A local URL like `http://localhost:8000`

The default is `http://localhost:8000`.

### Publishing to Docker Hub
1. Make sure you have Docker installed and are logged in to Docker Hub:
   ```
   docker login
   ```

2. Use the provided script to build and publish:
   ```
   ./docker-publish.sh
   ```

   To publish with a version tag:
   ```
   ./docker-publish.sh v1.0.0
   ```

3. Pull the images from Docker Hub:
   ```
   docker pull tubededentifrice/twitter-clone
   ```

### Docker Volumes
The application uses Docker volumes to persist data:
- `twitter_config`: Stores configuration files including the SQLite database
- `twitter_uploads`: Stores user uploaded files

## Running Tests

### Backend Tests
The backend includes comprehensive unit tests for all API endpoints and utilities.

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the test script:
   ```
   ./run_tests.sh
   ```

This will:
- Set up a virtual environment if one doesn't exist
- Install required dependencies
- Run all tests with coverage reporting

You can also run specific test files:
```
./run_tests.sh tests/test_user.py
```

### Frontend Tests (React)
The React frontend includes unit tests for components and services.

1. Navigate to the React frontend directory:
   ```
   cd frontend/react-app
   ```

2. Run the tests:
   ```
   npm test
   ```

## API Documentation
Once the backend server is running, access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
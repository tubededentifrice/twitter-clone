from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pathlib import Path
import os

from .models.database import Base, engine, run_migrations
from .routers import user, tweet, profile

# Create database tables
Base.metadata.create_all(bind=engine)

# Run migrations to update database schema
run_migrations()

# Create uploads directory if it doesn't exist
uploads_dir = os.environ.get("UPLOADS_DIR", "uploads")
Path(uploads_dir).mkdir(exist_ok=True)

# Also create it in current working directory for tests
Path().joinpath("uploads").mkdir(exist_ok=True)

app = FastAPI(
    title="Twitter Clone API",
    description="A simple Twitter clone API built with FastAPI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in Docker
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router)
app.include_router(tweet.router)
app.include_router(profile.router)

# Mount static files directory for uploads
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Check if we're running in Docker with frontend build
frontend_build_path = os.path.join(os.path.dirname(__file__), "../../../frontend/build")
if os.path.exists(frontend_build_path):
    # Serve React frontend
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_build_path, "static")), name="static")
    
    @app.get("/{full_path:path}", response_class=HTMLResponse)
    async def serve_react_app(request: Request, full_path: str = ""):
        # Don't serve React app for API routes
        if full_path.startswith("api") or full_path == "docs" or full_path == "redoc":
            raise HTTPException(status_code=404, detail="API endpoint not found")
            
        index_path = os.path.join(frontend_build_path, "index.html")
        with open(index_path, "r") as f:
            return f.read()

@app.get("/")
async def root():
    return {"message": "Welcome to Twitter Clone API", "docs": "/docs"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
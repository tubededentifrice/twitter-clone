from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .models.database import Base, engine, run_migrations
from .routers import user, tweet, profile

# Create database tables
Base.metadata.create_all(bind=engine)

# Run migrations to update database schema
run_migrations()

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Also create it in current working directory for tests
Path().joinpath("uploads").mkdir(exist_ok=True)

app = FastAPI(title="Twitter Clone API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router)
app.include_router(tweet.router)
app.include_router(profile.router)

# Mount static files directory for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
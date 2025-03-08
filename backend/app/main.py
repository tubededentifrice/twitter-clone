from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models.database import Base, engine
from .routers import user, tweet

# Create database tables
Base.metadata.create_all(bind=engine)

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

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
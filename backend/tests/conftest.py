import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.models.database import Base, get_db
from app.models.models import User, Tweet
from app.utils.security import get_password_hash

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency to use our test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create a test client that can be used by all tests
@pytest.fixture
def client():
    yield TestClient(app)

# Helper function to create a test user and get a token
def create_test_user(username="testuser", email="test@example.com", password="password"):
    # Create a test user
    hashed_password = get_password_hash(password)
    db = TestingSessionLocal()
    db_user = User(username=username, email=email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Get a token
    client = TestClient(app)
    response = client.post(
        "/api/users/login",
        json={"username": username, "password": password}
    )
    return response.json()

# Helper function to create a test database session
@pytest.fixture
def db_session():
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    
    yield db
    
    # Clean up the database
    Base.metadata.drop_all(bind=engine)
    
# Create a utility function to verify the database is clean between tests
@pytest.fixture(autouse=True)
def cleanup_database():
    # This will run before each test
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # This will run after each test
    Base.metadata.drop_all(bind=engine)
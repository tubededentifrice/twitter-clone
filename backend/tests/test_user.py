from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.models.database import Base, get_db
from app.models.models import User
from app.utils.security import get_password_hash

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the tables
Base.metadata.create_all(bind=engine)

# Override the get_db dependency to use our test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Test client
client = TestClient(app)

# Test fixture to create a test environment
@pytest.fixture
def test_db():
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user
    hashed_password = get_password_hash("testpassword")
    db = TestingSessionLocal()
    db_user = User(username="existinguser", email="existing@example.com", hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    yield db
    
    # Clean up the database
    Base.metadata.drop_all(bind=engine)

# Test user registration
def test_register_user():
    response = client.post(
        "/api/users/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "newuser"

# Test user registration with duplicate username
def test_register_duplicate_username(test_db):
    response = client.post(
        "/api/users/register",
        json={
            "username": "existinguser",  # This username already exists
            "email": "another@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "username already registered" in data["detail"].lower()

# Test user registration with duplicate email
def test_register_duplicate_email(test_db):
    response = client.post(
        "/api/users/register",
        json={
            "username": "anotheruser",
            "email": "existing@example.com",  # This email already exists
            "password": "password123"
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "email already registered" in data["detail"].lower()

# Test user login with valid credentials
def test_login_valid_credentials(test_db):
    response = client.post(
        "/api/users/login",
        json={
            "username": "existinguser",
            "password": "testpassword"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "existinguser"

# Test user login with invalid username
def test_login_invalid_username():
    response = client.post(
        "/api/users/login",
        json={
            "username": "nonexistentuser",
            "password": "testpassword"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "incorrect username or password" in data["detail"].lower()

# Test user login with invalid password
def test_login_invalid_password(test_db):
    response = client.post(
        "/api/users/login",
        json={
            "username": "existinguser",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "incorrect username or password" in data["detail"].lower()
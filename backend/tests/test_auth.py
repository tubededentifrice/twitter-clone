from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys
import time
from datetime import timedelta

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.models.database import Base, get_db
from app.models.models import User
from app.utils.security import get_password_hash, verify_password, create_access_token, verify_token

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

# Test fixture to create a test environment with a user
@pytest.fixture
def test_user():
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user
    hashed_password = get_password_hash("testpassword")
    db = TestingSessionLocal()
    db_user = User(username="testuser", email="test@example.com", hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    yield db_user
    
    # Clean up the database
    Base.metadata.drop_all(bind=engine)

# Test password hashing and verification
def test_password_hash_and_verify():
    password = "mysecurepassword"
    hashed = get_password_hash(password)
    
    # Verify that the hash is different from the password
    assert hashed != password
    
    # Verify that the password verification works
    assert verify_password(password, hashed) == True
    
    # Verify that wrong password fails
    assert verify_password("wrongpassword", hashed) == False

# Test token creation and verification
def test_token_create_and_verify():
    # Create token data
    data = {"sub": "testuser", "id": 1}
    
    # Create token
    token = create_access_token(data)
    
    # Verify token
    payload = verify_token(token)
    assert payload.get("sub") == "testuser"
    assert payload.get("id") == 1

# Test token expiration
def test_token_expiration():
    # Create token data
    data = {"sub": "testuser", "id": 1}
    
    # Create token with very short expiration
    token = create_access_token(data, expires_delta=timedelta(seconds=1))
    
    # Token should be valid initially
    payload = verify_token(token)
    assert payload.get("sub") == "testuser"
    
    # Wait for token to expire
    time.sleep(2)
    
    # Token should be invalid now
    with pytest.raises(Exception):
        verify_token(token)

# Test authentication middleware
def test_auth_middleware(test_user):
    # Create a valid token for the test user
    token = create_access_token({"sub": test_user.username, "id": test_user.id})
    
    # Test accessing a protected endpoint with a valid token
    response = client.get(
        "/api/profile/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    
    # Test accessing a protected endpoint with an invalid token
    response = client.get(
        "/api/profile/me",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401
    
    # Test accessing a protected endpoint without a token
    response = client.get("/api/profile/me")
    assert response.status_code == 401

# Test with malformed tokens
def test_malformed_token():
    # Test with malformed header
    response = client.get(
        "/api/profile/me",
        headers={"Authorization": "malformedheader"}
    )
    assert response.status_code == 401
    
    # Test with invalid token format
    response = client.get(
        "/api/profile/me",
        headers={"Authorization": "Bearer invalid.token.format"}
    )
    assert response.status_code == 401
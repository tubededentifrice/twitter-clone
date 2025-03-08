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
from app.models.models import User, Tweet
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
    response = client.post(
        "/api/users/login",
        json={"username": username, "password": password}
    )
    return response.json()

# Test fixture to create a test environment with users and tweets
@pytest.fixture
def test_env():
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    # Create test users
    user1 = create_test_user("user1", "user1@example.com", "password1")
    user2 = create_test_user("user2", "user2@example.com", "password2")
    
    # Create tweets for user1
    db = TestingSessionLocal()
    db_tweets = [
        Tweet(content=f"Test tweet {i} from user1", author_id=user1["user_id"])
        for i in range(1, 6)  # 5 tweets
    ]
    db.add_all(db_tweets)
    
    # Create tweets for user2
    db_tweets2 = [
        Tweet(content=f"Test tweet {i} from user2", author_id=user2["user_id"])
        for i in range(1, 4)  # 3 tweets
    ]
    db.add_all(db_tweets2)
    db.commit()
    
    yield {
        "user1": user1,
        "user2": user2
    }
    
    # Clean up the database
    Base.metadata.drop_all(bind=engine)

# Test creating a tweet
def test_create_tweet(test_env):
    token = test_env["user1"]["access_token"]
    
    response = client.post(
        "/api/tweets/",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "This is a new test tweet"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "This is a new test tweet"
    assert data["author_username"] == "user1"

# Test creating a tweet with invalid content (too long)
def test_create_tweet_too_long(test_env):
    token = test_env["user1"]["access_token"]
    
    # Create a tweet with content that exceeds the 256 character limit
    long_content = "x" * 257
    
    response = client.post(
        "/api/tweets/",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": long_content}
    )
    
    assert response.status_code == 422  # Validation error

# Test creating a tweet without authentication
def test_create_tweet_without_auth():
    response = client.post(
        "/api/tweets/",
        json={"content": "This tweet should not be created"}
    )
    
    assert response.status_code == 401  # Unauthorized

# Test getting all tweets with pagination
def test_get_all_tweets(test_env):
    response = client.get("/api/tweets/?skip=0&limit=10")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8  # At least 8 tweets (5 from user1 and 3 from user2)
    
    # Test pagination
    response = client.get("/api/tweets/?skip=0&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    
    response = client.get("/api/tweets/?skip=5&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3  # At least 3 more tweets

# Test getting tweets by user
def test_get_tweets_by_user(test_env):
    response = client.get("/api/tweets/user/user1")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5  # User1 has 5 tweets
    for tweet in data:
        assert tweet["author_username"] == "user1"
    
    response = client.get("/api/tweets/user/user2")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3  # User2 has 3 tweets
    for tweet in data:
        assert tweet["author_username"] == "user2"

# Test getting tweet count for a user
def test_get_tweet_count(test_env):
    response = client.get("/api/tweets/count/user1")
    
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 5  # User1 has 5 tweets
    
    response = client.get("/api/tweets/count/user2")
    
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3  # User2 has 3 tweets

# Test getting tweets for a non-existent user
def test_get_tweets_nonexistent_user():
    response = client.get("/api/tweets/user/nonexistentuser")
    
    assert response.status_code == 404  # Not found
    
    response = client.get("/api/tweets/count/nonexistentuser")
    
    assert response.status_code == 404  # Not found
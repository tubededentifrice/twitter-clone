from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys
import base64

# Add the parent directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.models.database import Base, get_db
from app.models.models import User, followers
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

# Helper function to create follower relationship
def create_follower_relationship(follower_id, followed_id):
    db = TestingSessionLocal()
    follower = db.query(User).filter(User.id == follower_id).first()
    followed = db.query(User).filter(User.id == followed_id).first()
    follower.following.append(followed)
    db.commit()

# Test fixture to create a test environment with users
@pytest.fixture
def test_env():
    # Create the tables
    Base.metadata.create_all(bind=engine)
    
    # Create a test user
    user1 = create_test_user("user1", "user1@example.com", "password1")
    user2 = create_test_user("user2", "user2@example.com", "password2")
    user3 = create_test_user("user3", "user3@example.com", "password3")
    
    # Create follower relationships
    db = TestingSessionLocal()
    user1_obj = db.query(User).filter(User.username == "user1").first()
    user2_obj = db.query(User).filter(User.username == "user2").first()
    user3_obj = db.query(User).filter(User.username == "user3").first()
    
    # user1 follows user2 and user3
    user1_obj.following.append(user2_obj)
    user1_obj.following.append(user3_obj)
    
    # user2 follows user1
    user2_obj.following.append(user1_obj)
    
    db.commit()
    
    yield {
        "user1": user1,
        "user2": user2,
        "user3": user3,
        "user1_obj": user1_obj,
        "user2_obj": user2_obj,
        "user3_obj": user3_obj
    }
    
    # Clean up the database
    Base.metadata.drop_all(bind=engine)

# Test getting a user's profile
def test_get_my_profile(test_env):
    token = test_env["user1"]["access_token"]
    
    response = client.get(
        "/api/profile/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "user1"
    assert data["follower_count"] == 1  # user2 follows user1
    assert data["following_count"] == 2  # user1 follows user2 and user3

# Test getting followers list
def test_get_followers(test_env):
    token = test_env["user1"]["access_token"]
    
    response = client.get(
        "/api/profile/followers/list",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["username"] == "user2"

# Test getting following list
def test_get_following(test_env):
    token = test_env["user1"]["access_token"]
    
    response = client.get(
        "/api/profile/following/list",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    usernames = [user["username"] for user in data]
    assert "user2" in usernames
    assert "user3" in usernames

# Test following a user
def test_follow_user(test_env):
    # Create a new user to follow
    new_user = create_test_user("newuser", "new@example.com", "password")
    token = test_env["user1"]["access_token"]
    
    response = client.post(
        f"/api/profile/follow/newuser",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    
    # Check that the user is now following the new user
    response = client.get(
        "/api/profile/following/list",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    data = response.json()
    usernames = [user["username"] for user in data]
    assert "newuser" in usernames

# Test unfollowing a user
def test_unfollow_user(test_env):
    token = test_env["user1"]["access_token"]
    
    # Unfollow user2
    response = client.post(
        f"/api/profile/unfollow/user2",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    
    # Check that the user is no longer following user2
    response = client.get(
        "/api/profile/following/list",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    data = response.json()
    usernames = [user["username"] for user in data]
    assert "user2" not in usernames
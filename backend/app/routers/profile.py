from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
import os
from typing import List
import base64
from pathlib import Path

from ..models.database import get_db
from ..models.models import User
from ..schemas.user import UserProfile, UserUpdate, UserFollow, UserWithFollowers, FollowUser
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/profile",
    tags=["profile"],
    responses={404: {"description": "Not found"}},
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Count followers and following
    follower_count = len(current_user.followers)
    following_count = len(current_user.following)
    
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "profile_picture": current_user.profile_picture,
        "created_at": current_user.created_at,
        "is_active": current_user.is_active,
        "follower_count": follower_count,
        "following_count": following_count
    }

@router.get("/{username}", response_model=UserProfile)
async def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Count followers and following
    follower_count = len(user.followers)
    following_count = len(user.following)
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_picture": user.profile_picture,
        "created_at": user.created_at,
        "is_active": user.is_active,
        "follower_count": follower_count,
        "following_count": following_count
    }

@router.post("/update-profile-picture")
async def update_profile_picture(
    profile_picture: str = Form(...),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # The profile_picture is expected to be a base64 encoded image string
    try:
        # Remove header part (e.g., "data:image/png;base64,")
        if "," in profile_picture:
            profile_picture = profile_picture.split(",")[1]
        
        # Generate a unique filename based on username
        file_name = f"profile_{current_user.id}.jpg"
        file_path = UPLOAD_DIR / file_name
        
        # Decode and save the image
        try:
            img_data = base64.b64decode(profile_picture)
            with open(file_path, "wb") as f:
                f.write(img_data)
        except Exception as e:
            print(f"Error decoding/saving image: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image data: {str(e)}"
            )
            
        # Update the user record with the profile picture path
        current_user.profile_picture = f"/uploads/{file_name}"
        db.commit()
        
        return {"message": "Profile picture updated successfully", "profile_picture": current_user.profile_picture}
    except Exception as e:
        print(f"Profile picture update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update profile picture: {str(e)}"
        )

@router.get("/followers/list", response_model=List[FollowUser])
async def get_followers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    followers_list = []
    for follower in current_user.followers:
        followers_list.append({
            "username": follower.username,
            "profile_picture": follower.profile_picture
        })
    return followers_list

@router.get("/{username}/followers", response_model=List[FollowUser])
async def get_user_followers(username: str, db: Session = Depends(get_db)):
    # Get the user by username
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return the followers list
    followers_list = []
    for follower in user.followers:
        followers_list.append({
            "username": follower.username,
            "profile_picture": follower.profile_picture
        })
    return followers_list

@router.get("/{username}/following", response_model=List[FollowUser])
async def get_user_following(username: str, db: Session = Depends(get_db)):
    # Get the user by username
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return the following list
    following_list = []
    for following in user.following:
        following_list.append({
            "username": following.username,
            "profile_picture": following.profile_picture
        })
    return following_list

@router.get("/following/list", response_model=List[FollowUser])
async def get_following(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    following_list = []
    for following in current_user.following:
        following_list.append({
            "username": following.username,
            "profile_picture": following.profile_picture
        })
    return following_list

@router.post("/follow/{username}")
async def follow_user(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.username == username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself"
        )
    
    user_to_follow = db.query(User).filter(User.username == username).first()
    if not user_to_follow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already following
    if user_to_follow in current_user.following:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already following this user"
        )
    
    # Add to following
    current_user.following.append(user_to_follow)
    db.commit()
    
    return {"message": f"You are now following {username}"}

@router.post("/unfollow/{username}")
async def unfollow_user(username: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_to_unfollow = db.query(User).filter(User.username == username).first()
    if not user_to_unfollow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if following
    if user_to_unfollow not in current_user.following:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not following this user"
        )
    
    # Remove from following
    current_user.following.remove(user_to_unfollow)
    db.commit()
    
    return {"message": f"You have unfollowed {username}"}
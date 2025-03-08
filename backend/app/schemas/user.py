from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    profile_picture: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserFollow(BaseModel):
    user_id: int

class FollowUser(BaseModel):
    username: str
    profile_picture: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class User(UserBase):
    id: int
    profile_picture: Optional[str] = None
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True
        
class UserProfile(User):
    follower_count: int
    following_count: int
    
    class Config:
        from_attributes = True
        
class UserWithFollowers(User):
    followers: List[FollowUser]
    following: List[FollowUser]
    
    class Config:
        from_attributes = True
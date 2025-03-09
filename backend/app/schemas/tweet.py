from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class TweetBase(BaseModel):
    content: str = Field(..., max_length=256)

class TweetCreate(TweetBase):
    parent_id: Optional[int] = None

class ReactionCreate(BaseModel):
    reaction_type: str = Field(..., pattern="^(like|dislike)$")

class Tweet(TweetBase):
    id: int
    created_at: datetime
    author_id: int
    author_username: str
    parent_id: Optional[int] = None
    replies_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    dislikes_count: Optional[int] = 0
    user_reaction: Optional[str] = None  # Will be populated for authenticated users

    class Config:
        from_attributes = True

class TweetDetail(Tweet):
    replies: Optional[List["TweetDetail"]] = []

    class Config:
        from_attributes = True

# Resolve forward references
TweetDetail.model_rebuild()
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TweetBase(BaseModel):
    content: str = Field(..., max_length=256)

class TweetCreate(TweetBase):
    pass

class Tweet(TweetBase):
    id: int
    created_at: datetime
    author_id: int
    author_username: str

    class Config:
        from_attributes = True
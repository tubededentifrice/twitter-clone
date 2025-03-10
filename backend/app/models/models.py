from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

# Association table for followers/following relationship
followers = Table(
    "followers",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("followed_id", Integer, ForeignKey("users.id"), primary_key=True)
)

# Association table for tweet reactions (likes/dislikes)
tweet_reactions = Table(
    "tweet_reactions",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("tweet_id", Integer, ForeignKey("tweets.id"), primary_key=True),
    Column("reaction_type", String, nullable=False)  # "like" or "dislike"
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_picture = Column(String, nullable=True, default=None)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    tweets = relationship("Tweet", back_populates="author")
    
    # Followers relationship
    followers = relationship(
        "User", 
        secondary=followers,
        primaryjoin=(followers.c.followed_id == id),
        secondaryjoin=(followers.c.follower_id == id),
        backref="following"
    )
    
    # Tweet reactions relationship
    tweet_reactions = relationship("Tweet", secondary=tweet_reactions, back_populates="reacted_by")

class Tweet(Base):
    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(256), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author_id = Column(Integer, ForeignKey("users.id"))
    parent_id = Column(Integer, ForeignKey("tweets.id"), nullable=True)
    
    # Relationships
    author = relationship("User", back_populates="tweets")
    replies = relationship("Tweet", backref="parent", remote_side=[id])
    reacted_by = relationship("User", secondary=tweet_reactions, back_populates="tweet_reactions")
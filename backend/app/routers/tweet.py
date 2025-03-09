from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models.database import get_db
from ..models.models import Tweet, User
from ..schemas.tweet import TweetCreate, Tweet as TweetSchema, TweetDetail
from ..utils.auth import get_current_user

router = APIRouter(
    prefix="/api/tweets",
    tags=["tweets"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=TweetSchema, status_code=status.HTTP_201_CREATED)
async def create_tweet(tweet: TweetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_tweet = Tweet(
        content=tweet.content,
        author_id=current_user.id,
        parent_id=tweet.parent_id
    )
    
    db.add(db_tweet)
    db.commit()
    db.refresh(db_tweet)
    
    # Create response with author username
    return {
        "id": db_tweet.id,
        "content": db_tweet.content,
        "created_at": db_tweet.created_at,
        "author_id": db_tweet.author_id,
        "author_username": current_user.username,
        "parent_id": db_tweet.parent_id,
        "replies_count": 0
    }

@router.get("/", response_model=List[TweetSchema])
async def get_tweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Only get top-level tweets (not replies) for the main feed
    tweets = db.query(Tweet).filter(Tweet.parent_id == None).order_by(Tweet.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add author username to each tweet
    result = []
    for tweet in tweets:
        author = db.query(User).filter(User.id == tweet.author_id).first()
        # Count replies for each tweet
        replies_count = db.query(Tweet).filter(Tweet.parent_id == tweet.id).count()
        result.append({
            "id": tweet.id,
            "content": tweet.content,
            "created_at": tweet.created_at,
            "author_id": tweet.author_id,
            "author_username": author.username if author else "Unknown",
            "parent_id": tweet.parent_id,
            "replies_count": replies_count
        })
    
    return result

@router.get("/count/{username}")
async def get_tweet_count(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get count of tweets by this user
    count = db.query(Tweet).filter(Tweet.author_id == user.id).count()
    return {"count": count, "username": username}

@router.get("/user/{username}", response_model=List[TweetSchema])
async def get_user_tweets(username: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only get top-level tweets (not replies) for user profile
    tweets = db.query(Tweet).filter(Tweet.author_id == user.id, Tweet.parent_id == None).order_by(Tweet.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for tweet in tweets:
        # Count replies for each tweet
        replies_count = db.query(Tweet).filter(Tweet.parent_id == tweet.id).count()
        result.append({
            "id": tweet.id,
            "content": tweet.content,
            "created_at": tweet.created_at,
            "author_id": tweet.author_id,
            "author_username": user.username,
            "parent_id": tweet.parent_id,
            "replies_count": replies_count
        })
    
    return result

@router.get("/{tweet_id}", response_model=TweetDetail)
async def get_tweet(tweet_id: int, db: Session = Depends(get_db)):
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tweet not found"
        )
    
    author = db.query(User).filter(User.id == tweet.author_id).first()
    
    # Get replies to this tweet
    replies = db.query(Tweet).filter(Tweet.parent_id == tweet.id).order_by(Tweet.created_at.asc()).all()
    
    # Create the response with nested replies
    result = {
        "id": tweet.id,
        "content": tweet.content,
        "created_at": tweet.created_at,
        "author_id": tweet.author_id,
        "author_username": author.username if author else "Unknown",
        "parent_id": tweet.parent_id,
        "replies_count": len(replies),
        "replies": []
    }
    
    # Add replies
    for reply in replies:
        reply_author = db.query(User).filter(User.id == reply.author_id).first()
        reply_replies_count = db.query(Tweet).filter(Tweet.parent_id == reply.id).count()
        
        result["replies"].append({
            "id": reply.id,
            "content": reply.content,
            "created_at": reply.created_at,
            "author_id": reply.author_id,
            "author_username": reply_author.username if reply_author else "Unknown",
            "parent_id": reply.parent_id,
            "replies_count": reply_replies_count,
            "replies": []
        })
    
    return result
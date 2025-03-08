from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from ..models.database import get_db
from ..models.models import Tweet, User
from ..schemas.tweet import TweetCreate, Tweet as TweetSchema
from ..utils.security import verify_token, SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/api/tweets",
    tags=["tweets"],
    responses={404: {"description": "Not found"}},
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/", response_model=TweetSchema, status_code=status.HTTP_201_CREATED)
async def create_tweet(tweet: TweetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_tweet = Tweet(
        content=tweet.content,
        author_id=current_user.id
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
        "author_username": current_user.username
    }

@router.get("/", response_model=List[TweetSchema])
async def get_tweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tweets = db.query(Tweet).order_by(Tweet.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add author username to each tweet
    result = []
    for tweet in tweets:
        author = db.query(User).filter(User.id == tweet.author_id).first()
        result.append({
            "id": tweet.id,
            "content": tweet.content,
            "created_at": tweet.created_at,
            "author_id": tweet.author_id,
            "author_username": author.username if author else "Unknown"
        })
    
    return result
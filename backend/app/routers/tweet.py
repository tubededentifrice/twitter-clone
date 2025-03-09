from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional

from ..models.database import get_db
from ..models.models import Tweet, User, tweet_reactions
from ..schemas.tweet import TweetCreate, Tweet as TweetSchema, TweetDetail, ReactionCreate
from ..utils.auth import get_current_user, get_current_user_optional

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
        "replies_count": 0,
        "likes_count": 0,
        "dislikes_count": 0,
        "user_reaction": None
    }

@router.get("/", response_model=List[TweetSchema])
async def get_tweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    # Only get top-level tweets (not replies) for the main feed
    tweets = db.query(Tweet).filter(Tweet.parent_id == None).order_by(Tweet.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add author username to each tweet
    result = []
    for tweet in tweets:
        author = db.query(User).filter(User.id == tweet.author_id).first()
        # Count replies for each tweet
        replies_count = db.query(Tweet).filter(Tweet.parent_id == tweet.id).count()
        
        # Count likes and dislikes
        likes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
            and_(
                tweet_reactions.c.tweet_id == tweet.id,
                tweet_reactions.c.reaction_type == "like"
            )
        ).scalar()
        
        dislikes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
            and_(
                tweet_reactions.c.tweet_id == tweet.id,
                tweet_reactions.c.reaction_type == "dislike"
            )
        ).scalar()
        
        # Get user's reaction if authenticated
        user_reaction = None
        if current_user:
            reaction = db.execute(
                tweet_reactions.select().where(
                    and_(
                        tweet_reactions.c.user_id == current_user.id,
                        tweet_reactions.c.tweet_id == tweet.id
                    )
                )
            ).first()
            if reaction:
                user_reaction = reaction.reaction_type
        
        result.append({
            "id": tweet.id,
            "content": tweet.content,
            "created_at": tweet.created_at,
            "author_id": tweet.author_id,
            "author_username": author.username if author else "Unknown",
            "parent_id": tweet.parent_id,
            "replies_count": replies_count,
            "likes_count": likes_count,
            "dislikes_count": dislikes_count,
            "user_reaction": user_reaction
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
async def get_user_tweets(username: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
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
        
        # Count likes and dislikes
        likes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
            and_(
                tweet_reactions.c.tweet_id == tweet.id,
                tweet_reactions.c.reaction_type == "like"
            )
        ).scalar()
        
        dislikes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
            and_(
                tweet_reactions.c.tweet_id == tweet.id,
                tweet_reactions.c.reaction_type == "dislike"
            )
        ).scalar()
        
        # Get user's reaction if authenticated
        user_reaction = None
        if current_user:
            reaction = db.execute(
                tweet_reactions.select().where(
                    and_(
                        tweet_reactions.c.user_id == current_user.id,
                        tweet_reactions.c.tweet_id == tweet.id
                    )
                )
            ).first()
            if reaction:
                user_reaction = reaction.reaction_type
        
        result.append({
            "id": tweet.id,
            "content": tweet.content,
            "created_at": tweet.created_at,
            "author_id": tweet.author_id,
            "author_username": user.username,
            "parent_id": tweet.parent_id,
            "replies_count": replies_count,
            "likes_count": likes_count,
            "dislikes_count": dislikes_count,
            "user_reaction": user_reaction
        })
    
    return result

@router.get("/{tweet_id}", response_model=TweetDetail)
async def get_tweet(tweet_id: int, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tweet not found"
        )
    
    author = db.query(User).filter(User.id == tweet.author_id).first()
    
    # Get replies to this tweet
    replies = db.query(Tweet).filter(Tweet.parent_id == tweet.id).order_by(Tweet.created_at.asc()).all()
    
    # Count likes and dislikes
    likes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
        and_(
            tweet_reactions.c.tweet_id == tweet.id,
            tweet_reactions.c.reaction_type == "like"
        )
    ).scalar()
    
    dislikes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
        and_(
            tweet_reactions.c.tweet_id == tweet.id,
            tweet_reactions.c.reaction_type == "dislike"
        )
    ).scalar()
    
    # Get user's reaction if authenticated
    user_reaction = None
    if current_user:
        reaction = db.execute(
            tweet_reactions.select().where(
                and_(
                    tweet_reactions.c.user_id == current_user.id,
                    tweet_reactions.c.tweet_id == tweet.id
                )
            )
        ).first()
        if reaction:
            user_reaction = reaction.reaction_type
    
    # Create the response with nested replies
    result = {
        "id": tweet.id,
        "content": tweet.content,
        "created_at": tweet.created_at,
        "author_id": tweet.author_id,
        "author_username": author.username if author else "Unknown",
        "parent_id": tweet.parent_id,
        "replies_count": len(replies),
        "likes_count": likes_count,
        "dislikes_count": dislikes_count,
        "user_reaction": user_reaction,
        "replies": []
    }
    
    # Add replies
    for reply in replies:
        reply_author = db.query(User).filter(User.id == reply.author_id).first()
        reply_replies_count = db.query(Tweet).filter(Tweet.parent_id == reply.id).count()
        
        # Count likes and dislikes for reply
        reply_likes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
            and_(
                tweet_reactions.c.tweet_id == reply.id,
                tweet_reactions.c.reaction_type == "like"
            )
        ).scalar()
        
        reply_dislikes_count = db.query(func.count(tweet_reactions.c.user_id)).filter(
            and_(
                tweet_reactions.c.tweet_id == reply.id,
                tweet_reactions.c.reaction_type == "dislike"
            )
        ).scalar()
        
        # Get user's reaction to reply if authenticated
        reply_user_reaction = None
        if current_user:
            reply_reaction = db.execute(
                tweet_reactions.select().where(
                    and_(
                        tweet_reactions.c.user_id == current_user.id,
                        tweet_reactions.c.tweet_id == reply.id
                    )
                )
            ).first()
            if reply_reaction:
                reply_user_reaction = reply_reaction.reaction_type
        
        result["replies"].append({
            "id": reply.id,
            "content": reply.content,
            "created_at": reply.created_at,
            "author_id": reply.author_id,
            "author_username": reply_author.username if reply_author else "Unknown",
            "parent_id": reply.parent_id,
            "replies_count": reply_replies_count,
            "likes_count": reply_likes_count,
            "dislikes_count": reply_dislikes_count,
            "user_reaction": reply_user_reaction,
            "replies": []
        })
    
    return result

@router.post("/{tweet_id}/reaction", status_code=status.HTTP_201_CREATED)
async def create_reaction(
    tweet_id: int, 
    reaction: ReactionCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Check if tweet exists
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tweet not found"
        )
    
    # Check if user already reacted to this tweet
    existing_reaction = db.execute(
        tweet_reactions.select().where(
            and_(
                tweet_reactions.c.user_id == current_user.id,
                tweet_reactions.c.tweet_id == tweet_id
            )
        )
    ).first()
    
    if existing_reaction:
        # If reaction type is different, update it
        if existing_reaction.reaction_type != reaction.reaction_type:
            db.execute(
                tweet_reactions.update().where(
                    and_(
                        tweet_reactions.c.user_id == current_user.id,
                        tweet_reactions.c.tweet_id == tweet_id
                    )
                ).values(reaction_type=reaction.reaction_type)
            )
            db.commit()
            return {"message": f"Reaction updated to {reaction.reaction_type}"}
        else:
            # If reaction type is the same, remove it (toggle off)
            db.execute(
                tweet_reactions.delete().where(
                    and_(
                        tweet_reactions.c.user_id == current_user.id,
                        tweet_reactions.c.tweet_id == tweet_id
                    )
                )
            )
            db.commit()
            return {"message": f"Reaction removed"}
    else:
        # Add new reaction
        db.execute(
            tweet_reactions.insert().values(
                user_id=current_user.id,
                tweet_id=tweet_id,
                reaction_type=reaction.reaction_type
            )
        )
        db.commit()
        return {"message": f"Reaction {reaction.reaction_type} added"}
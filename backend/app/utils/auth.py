from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from jose import JWTError, jwt

from ..models.database import get_db
from ..models.models import User
from ..utils.security import verify_token, SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login", auto_error=False)

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

# Dependency to get current user but return None if not authenticated
async def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if token is None:
        print("DEBUG - No token provided for optional authentication")
        return None
    
    try:
        token_data = verify_token(token)
        if token_data is None:
            print("DEBUG - Token verification failed for optional authentication")
            return None
        
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if user:
            print(f"DEBUG - Successfully authenticated optional user: {user.username} (ID: {user.id})")
        else:
            print(f"DEBUG - User not found for ID: {token_data.user_id}")
        return user
    except Exception as e:
        print(f"DEBUG - Error in optional authentication: {str(e)}")
        return None
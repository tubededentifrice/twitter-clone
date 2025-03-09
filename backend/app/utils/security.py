from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from ..schemas.user import TokenData

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "YOUR_SECRET_KEY_HERE"  # In production, use a secure randomly generated key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    """Verify that the plain password matches the hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash a password for storing"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT token with an optional expiration time"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str):
    """Verify a JWT token and return the token data"""
    if not token:
        print("DEBUG - Empty token provided to verify_token")
        return None
        
    try:
        # Print the token for debugging (just first 10 chars)
        token_preview = token[:10] + "..." if len(token) > 10 else token
        print(f"DEBUG - Verifying token: {token_preview}")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"DEBUG - Decoded token payload: {payload}")
        
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        
        if username is None or user_id is None:
            print(f"DEBUG - Missing fields in token payload: username={username}, user_id={user_id}")
            return None
            
        # Add debug output
        print(f"DEBUG - Token verification successful: user_id={user_id}, username={username}")
        return TokenData(username=username, user_id=user_id)
    except JWTError as e:
        print(f"DEBUG - JWT error in token verification: {str(e)}")
        return None
    except Exception as e:
        print(f"DEBUG - Unexpected error in token verification: {str(e)}")
        return None
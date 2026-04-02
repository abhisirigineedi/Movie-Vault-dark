from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.config import settings
import jwt

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        unparsed_user_id = payload.get("sub")
        if unparsed_user_id is None:
            raise credentials_exception
        user_id = int(unparsed_user_id)
    except (jwt.PyJWTError, ValueError, TypeError):
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

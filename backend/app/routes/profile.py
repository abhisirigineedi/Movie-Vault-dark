from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

from pydantic import BaseModel, condecimal, Field
from datetime import datetime

class MovieBase(BaseModel):
    name: str = Field(..., min_length=1)
    genre: str = Field(..., min_length=1)
    year: int = Field(..., ge=1888, le=datetime.now().year + 5)
    rating: float = Field(..., ge=0.0, le=5.0)

class MovieCreate(MovieBase):
    pass

class MovieUpdate(MovieBase):
    pass

class MovieResponse(MovieBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

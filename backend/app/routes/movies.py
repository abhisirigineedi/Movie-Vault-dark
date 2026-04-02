from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.movie import MovieCreate, MovieUpdate, MovieResponse
from app.models.movie import Movie
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[MovieResponse])
def get_movies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    movies = db.query(Movie).filter(Movie.user_id == current_user.id).offset(skip).limit(limit).all()
    return movies

@router.post("/", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(movie_in: MovieCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_movie = Movie(**movie_in.model_dump(), user_id=current_user.id)
    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)
    return new_movie

@router.put("/{movie_id}", response_model=MovieResponse)
def update_movie(movie_id: int, movie_in: MovieUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    movie = db.query(Movie).filter(Movie.id == movie_id, Movie.user_id == current_user.id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    update_data = movie_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(movie, key, value)
    
    db.commit()
    db.refresh(movie)
    return movie

@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(movie_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    movie = db.query(Movie).filter(Movie.id == movie_id, Movie.user_id == current_user.id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    db.delete(movie)
    db.commit()
    return None

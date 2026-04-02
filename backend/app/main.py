from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.db.base import Base
from app.routes import auth as auth_router, movies as movies_router, profile as profile_router

# Creates the database tables
Base.metadata.create_all(bind=engine)

# Disable docs to meet production requirements
app = FastAPI(title="Movie Vault API", docs_url=None, redoc_url=None, openapi_url=None)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5173/",
    "http://127.0.0.1:5173/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Important for HTTP-only cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(movies_router.router, prefix="/api/movies", tags=["movies"])
app.include_router(profile_router.router, prefix="/api/profile", tags=["profile"])

@app.get("/")
def read_root():
    return {"message": "API is running successfully"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Entrypoint for running via Python or Render
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)

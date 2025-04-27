from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import Base, engine
from routers import auth_routes, income_routes, expense_routes, dashboard_routes
from dependencies import get_current_user
from schemas import UserResponse
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(debug=True)

origins = ["http://localhost:5174", "http://localhost:5173"]

# CORS middleware to enable frontend-backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory for serving profile images # ADDED
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Routers
app.include_router(auth_routes.router, prefix="/api/v1/auth")
app.include_router(dashboard_routes.router, prefix="/api/v1")
app.include_router(income_routes.router, prefix="/api/v1")
app.include_router(expense_routes.router, prefix="/api/v1")


# Protected route to get current user
@app.get("/api/v1/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

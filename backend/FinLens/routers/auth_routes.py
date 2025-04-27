from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from schemas import UserCreate, UserResponse, Token
from crud import get_user_by_email, create_user
from auth import verify_password, create_access_token
from datetime import timedelta
from typing import Optional
from dependencies import get_db, get_current_user
from models import User
import os
import uuid


router = APIRouter(tags=["Authorization"])


@router.post("/register", response_model=UserResponse)
async def register(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    db_user = get_user_by_email(db, email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_create_data = UserCreate(full_name=full_name, email=email, password=password)
    profile_image_path = None

    if profile_image:
        try:
            file_extension = profile_image.filename.split(".")[-1].lower()
            if file_extension not in ["jpg", "jpeg", "png"]:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image format. Only JPG, JPEG, and PNG are allowed.",
                )

            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            upload_dir = "static/profile_images"  # directory ti store uploaded images
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, unique_filename)

            with open(file_path, "wb") as image_file:
                content = await profile_image.read()
                image_file.write(content)

            profile_image_path = file_path  # Store the local file path

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error uploading image: {e}")

    return create_user(db, user_create_data, profile_image_path=profile_image_path)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/getUser", response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_user)):
    return current_user

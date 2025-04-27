from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from fastapi import UploadFile


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    profile_image: Optional[UploadFile] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    created_at: datetime
    profile_image: Optional[str]

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: Optional[str] = None


class IncomeBase(BaseModel):
    source: str
    icon: Optional[str]
    amount: float
    date: datetime


class IncomeCreate(IncomeBase):
    pass


class IncomeResponse(IncomeBase):
    id: int

    class Config:
        orm_mode = True


class ExpenseBase(BaseModel):
    category: str
    icon: Optional[str]
    amount: float
    date: datetime


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int

    class Config:
        orm_mode = True

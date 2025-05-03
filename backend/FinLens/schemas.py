from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
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


# New Budget schemas
class BudgetBase(BaseModel):
    category: str
    icon: Optional[str]
    amount: float


class BudgetCreate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class BudgetAlert(BaseModel):
    category: str
    budget: float
    spent: float
    status: str  # "NEAR_LIMIT" or "EXCEEDED"
    icon: Optional[str] = None


# OCR schemas
class OCRLineItem(BaseModel):
    description: str
    category: str
    amount: float


class OCRResponse(BaseModel):
    merchant: str
    categorized: Dict[str, float]
    line_items: List[OCRLineItem]
    uncategorized_lines: List[str]

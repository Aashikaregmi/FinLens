from sqlalchemy.orm import Session
from models import User, Income, Expense
from schemas import UserCreate, IncomeCreate, ExpenseCreate
from auth import get_password_hash
from typing import Optional


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(
    db: Session, user: UserCreate, profile_image_path: Optional[str] = None
):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password,
        profile_image=profile_image_path,  # Store the profile image path/URL
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Income CRUD operations
def create_income(db: Session, income: IncomeCreate, user_id: int):
    db_income = Income(
        source=income.source,
        amount=income.amount,
        date=income.date,
        icon=income.icon,
        user_id=user_id,
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


def get_incomes(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_income_by_id(db: Session, income_id: int, user_id: int):
    return (
        db.query(Income)
        .filter(Income.id == income_id, Income.user_id == user_id)
        .first()
    )


def delete_income(db: Session, income_id: int, user_id: int):
    db_income = (
        db.query(Income)
        .filter(Income.id == income_id, Income.user_id == user_id)
        .first()
    )
    if db_income:
        db.delete(db_income)
        db.commit()
        return True
    return False


# Expense CRUD operations
def create_expense(db: Session, expense: ExpenseCreate, user_id: int):
    db_expense = Expense(
        category=expense.category,
        amount=expense.amount,
        date=expense.date,
        icon=expense.icon,
        user_id=user_id,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expenses(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_expense_by_id(db: Session, expense_id: int, user_id: int):
    return (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )


def delete_expense(db: Session, expense_id: int, user_id: int):
    db_expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if db_expense:
        db.delete(db_expense)
        db.commit()
        return True
    return False

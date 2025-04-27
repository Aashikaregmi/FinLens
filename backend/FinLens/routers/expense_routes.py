import tempfile
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import ExpenseResponse, ExpenseCreate
from crud import get_expenses, create_expense, get_expense_by_id, delete_expense
from dependencies import get_current_user, get_db
from fastapi.responses import FileResponse
from starlette.background import BackgroundTasks
from models import User
import pandas as pd
import os

router = APIRouter(prefix="/expense", tags=["Expense"])


@router.get("/download")
def download_expense_data(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    background_tasks = BackgroundTasks()
    temp_file_path = None
    try:
        items = get_expenses(db, user_id=current_user.id)
        if not items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No expense data found for this user",
            )
        df = pd.DataFrame([item.__dict__ for item in items])
        df.drop("_sa_instance_state", axis=1, inplace=True, errors="ignore")

        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp_file:
            df.to_excel(tmp_file.name, index=False, engine="openpyxl")
            temp_file_path = tmp_file.name
            background_tasks.add_task(os.remove, temp_file_path)

        return FileResponse(
            temp_file_path,
            filename="expense_data.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            background=background_tasks,
        )
    except Exception as e:
        print(
            f"An error occurred during expense Excel generation or file response: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating expense Excel file: {e}",
        )
    finally:
        if temp_file_path and not background_tasks.tasks:
            os.remove(temp_file_path)


@router.post("/", response_model=ExpenseResponse)
def add_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_expense(db, expense, user_id=current_user.id)


@router.get("/", response_model=List[ExpenseResponse])
def fetch_expenses(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return get_expenses(db, user_id=current_user.id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def fetch_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_expense = get_expense_by_id(db, expense_id=expense_id, user_id=current_user.id)
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )
    return db_expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_expense = get_expense_by_id(db, expense_id=expense_id, user_id=current_user.id)
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found or you do not have permission to delete it",
        )
    delete_expense(db, expense_id=expense_id, user_id=current_user.id)
    return None

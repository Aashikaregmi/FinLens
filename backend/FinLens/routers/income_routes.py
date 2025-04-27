from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from starlette.background import BackgroundTasks
from sqlalchemy.orm import Session
from schemas import IncomeCreate, IncomeResponse
from crud import create_income, get_incomes, get_income_by_id, delete_income
from dependencies import get_current_user, get_db
from models import User
from typing import List
import pandas as pd
import os
import tempfile

router = APIRouter(prefix="/income", tags=["Income"])


@router.post("/", response_model=IncomeResponse)
def add_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_income(db, income, user_id=current_user.id)


@router.get("/", response_model=List[IncomeResponse])
def fetch_all_incomes(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return get_incomes(db, user_id=current_user.id)


@router.get("/download")
def download_income_data(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    background_tasks = BackgroundTasks()
    temp_file_path = None
    try:
        items = get_incomes(db, user_id=current_user.id)
        if not items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No income data found for this user",
            )
        df = pd.DataFrame([item.__dict__ for item in items])
        df.drop("_sa_instance_state", axis=1, inplace=True, errors="ignore")

        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp_file:
            df.to_excel(tmp_file.name, index=False, engine="openpyxl")
            temp_file_path = tmp_file.name
            background_tasks.add_task(os.remove, temp_file_path)

        return FileResponse(
            temp_file_path,
            filename="income_data.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            background=background_tasks,
        )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating Excel file: {e}",
        )
    finally:
        # Ensure cleanup happens even if temp_file was not created due to an error
        if temp_file_path and not background_tasks.tasks:
            os.remove(temp_file_path)


@router.get("/{income_id}", response_model=IncomeResponse)
def fetch_income_by_id(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_income = get_income_by_id(db, income_id=income_id, user_id=current_user.id)
    if not db_income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Income not found"
        )
    return db_income


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income_by_id(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_income = get_income_by_id(db, income_id=income_id, user_id=current_user.id)
    if not db_income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found or you do not have permission to delete it",
        )
    delete_income(db, income_id=income_id, user_id=current_user.id)
    return None

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func
from datetime import datetime
from decimal import Decimal  # Add this import

from dependencies import get_db, get_current_user
from models import Budget, Expense, User
from schemas import BudgetCreate, BudgetResponse, BudgetAlert

router = APIRouter(tags=["Budget"])  # Remove the prefix


@router.post("/budget/set", response_model=BudgetResponse)
def set_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Check if budget already exists for this category and user
        existing_budget = (
            db.query(Budget)
            .filter(
                Budget.user_id == current_user.id, Budget.category == budget.category
            )
            .first()
        )

        if existing_budget:
            # Update existing budget
            existing_budget.amount = budget.amount
            existing_budget.icon = budget.icon
            existing_budget.updated_at = datetime
            db.commit()
            db.refresh(existing_budget)
            return existing_budget
        else:
            # Create new budget
            new_budget = Budget(
                user_id=current_user.id,
                category=budget.category,
                amount=budget.amount,
                icon=budget.icon,
            )
            db.add(new_budget)
            db.commit()
            db.refresh(new_budget)
            return new_budget
    except Exception as e:
        print(f"Error in set_budget: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set budget: {str(e)}")


@router.get("/budget/all", response_model=List[BudgetResponse])
def get_all_budgets(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
        return budgets
    except Exception as e:
        print(f"Error in get_all_budgets: {str(e)}")
        return []


@router.get("/budget/alerts", response_model=List[BudgetAlert])
def get_budget_alerts(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    try:
        # Get current month to calculate monthly expenses
        now = datetime.utcnow()
        start_of_month = datetime(now.year, now.month, 1)
        if now.month == 12:
            end_of_month = datetime(now.year + 1, 1, 1)
        else:
            end_of_month = datetime(now.year, now.month + 1, 1)

        # Get all budgets for user
        budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()

        alerts = []
        for budget in budgets:
            # Calculate total spent in this category for the current month
            result = (
                db.query(func.sum(Expense.amount))
                .filter(
                    Expense.user_id == current_user.id,
                    Expense.category == budget.category,
                    Expense.date >= start_of_month,
                    Expense.date < end_of_month,
                )
                .scalar()
            )

            total_spent = Decimal("0") if result is None else result

            # Check if budget threshold is reached
            if total_spent > budget.amount:
                alerts.append(
                    {
                        "category": budget.category,
                        "budget": float(budget.amount),
                        "spent": float(total_spent),
                        "status": "EXCEEDED",
                        "icon": budget.icon,
                    }
                )
            elif total_spent >= budget.amount * Decimal(
                "0.8"
            ):  # 80% of budget - FIXED LINE
                alerts.append(
                    {
                        "category": budget.category,
                        "budget": float(budget.amount),
                        "spent": float(total_spent),
                        "status": "NEAR_LIMIT",
                        "icon": budget.icon,
                    }
                )

        return alerts
    except Exception as e:
        print(f"Error in get_budget_alerts: {str(e)}")
        return []

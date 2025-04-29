from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, desc
from dependencies import get_db, get_current_user
from models import Income, Expense, User
from datetime import datetime, timedelta

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    user_id = current_user.id

    # Calculate total income
    total_income = (
        db.query(func.sum(Income.amount)).filter(Income.user_id == user_id).scalar()
        or 0
    )

    # Calculate total expense
    total_expense = (
        db.query(func.sum(Expense.amount)).filter(Expense.user_id == user_id).scalar()
        or 0
    )

    # Calculate net balance
    net_balance = total_income - total_expense

    # Get recent transactions (last 5 income and 5 expenses)
    recent_income = (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .order_by(desc(Income.date))
        .limit(5)
        .all()
    )
    recent_expense = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(desc(Expense.date))
        .limit(5)
        .all()
    )
    recent_transactions = []
    for income in recent_income:
        recent_transactions.append(
            {
                "type": "income",
                "source": income.source,
                "icon": income.icon,
                "date": income.date,
                "amount": float(income.amount),
            }
        )
    for expense in recent_expense:
        recent_transactions.append(
            {
                "type": "expense",
                "category": expense.category,
                "icon": expense.icon,
                "date": expense.date,
                "amount": float(expense.amount),
            }
        )
    recent_transactions.sort(key=lambda x: x["date"], reverse=True)
    recent_transactions = recent_transactions[:5]

    # Get expenses for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    last_30_days_expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id, Expense.date >= thirty_days_ago)
        .order_by(desc(Expense.date))
        .all()
    )
    last_30_days_expenses_data = {
        "transactions": [
            {
                "category": exp.category,
                "amount": float(exp.amount),
                "date": exp.date,
                "icon": exp.icon,
            }  # Include icon here
            for exp in last_30_days_expenses
        ]
    }

    # Get income for the last 60 days
    sixty_days_ago = datetime.utcnow() - timedelta(days=60)
    last_60_days_income = (
        db.query(Income)
        .filter(Income.user_id == user_id, Income.date >= sixty_days_ago)
        .order_by(desc(Income.date))
        .all()
    )
    last_60_days_income_data = {
        "transactions": [
            {
                "source": inc.source,
                "amount": float(inc.amount),
                "date": inc.date,
                "icon": inc.icon,
            }  # Include icon here
            for inc in last_60_days_income
        ]
    }

    return {
        "totalBalance": net_balance,
        "totalIncome": total_income,
        "totalExpense": total_expense,
        "RecentTransactions": recent_transactions,
        "last30DaysExpenses": last_30_days_expenses_data,
        "last60DaysIncome": last_60_days_income_data,
    }

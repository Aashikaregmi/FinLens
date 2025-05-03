from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    income = relationship("Income", back_populates="owner", cascade="all, delete")
    expense = relationship("Expense", back_populates="owner", cascade="all, delete")
    budget = relationship("Budget", back_populates="owner", cascade="all, delete")


class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    source = Column(String(100))
    icon = Column(String(255), nullable=True)
    amount = Column(DECIMAL(10, 2))
    date = Column(DateTime)

    owner = relationship("User", back_populates="income")


class Expense(Base):
    __tablename__ = "expense"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String(100))
    icon = Column(String(255), nullable=True)
    amount = Column(DECIMAL(10, 2))
    date = Column(DateTime)

    owner = relationship("User", back_populates="expense")


class Budget(Base):
    __tablename__ = "budget"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String(100))
    icon = Column(String(255), nullable=True)
    amount = Column(DECIMAL(10, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="budget")

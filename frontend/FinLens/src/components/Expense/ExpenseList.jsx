import moment from 'moment';
import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';

const ExpenseList = ({transactions, onDelete, onDownload}) => {
  return (
    <div className="card">
        <div className="flex items-center justify-between">
            <h5 className="text-lg">All Expenses</h5>
            <button className="card-btn" onClick={onDownload}>
                Download <LuArrowRight className="text-base" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {transactions?.map((expense) => (
                <TransactionInfoCard
                    key={expense._id}
                    title={expense.category}
                    icon={expense.icon}
                    date={moment(expense.date).format("Do MMM")}
                    amount={expense.amount}
                    type="expense"
                    onDelete={() => {
                        // console.log("Deleting expense with ID:", expense.id); // Debugging log
                        onDelete(expense.id);
                    }}
                />
            ))}
        </div>
    </div>
  )
}

export default ExpenseList;

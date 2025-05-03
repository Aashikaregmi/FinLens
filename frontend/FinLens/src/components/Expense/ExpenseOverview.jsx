import React, { useEffect, useState } from 'react';
import { FaChartPie, FaPlus, FaUpload } from 'react-icons/fa';
import { prepareExpenseLineChartData } from '../../utils/helper';
import CustomLineChart from '../Charts/CustomLineChart';

const ExpenseOverview = ({ transactions, onAddExpenseClick, onScanReceiptClick, onManageBudgetClick }) => { 
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareExpenseLineChartData(transactions);
        setChartData(result);

        return () => { }
    }, [transactions])

    return (
        <div className="card">
            <div className="flex items-center justify-between flex-wrap">
                <div className="">
                    <h5 className="text-lg">Expense Overview</h5>
                    <p className="texts-xs text-gray-400 mt-0 5">
                        Track your spending trends over time and gain insights on where your money goes.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="add-btn" onClick={onScanReceiptClick}> 
                        <FaUpload className="text-lg" />
                        Scan Receipt
                    </button>
                    
                    <button className="add-btn" onClick={onManageBudgetClick}> 
                        <FaChartPie className="text-lg" />
                        Manage Budget
                    </button>
                    
                    <button className="add-btn" onClick={onAddExpenseClick}> 
                        <FaPlus className="text-lg" />
                        Add Expense
                    </button>
                </div>
            </div>

            <div className="mt-10">
                <CustomLineChart data={chartData} />
            </div>
        </div>
    )
}

export default ExpenseOverview;
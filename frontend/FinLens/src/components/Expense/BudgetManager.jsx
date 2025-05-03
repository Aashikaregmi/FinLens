import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaExclamationCircle, FaExclamationTriangle, FaSave, FaSpinner } from 'react-icons/fa';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import EmojiPickerPopup from "../EmojiPickerPopup";
import Input from "../Inputs/Input";

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState({
    category: "",
    amount: "",
    icon: ""
  });
  const [alerts, setAlerts] = useState([]);

  const handleChange = (key, value) => setBudget({...budget, [key]: value});

  // Fetch existing budgets
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.BUDGET.GET_ALL_BUDGETS);
      if (response.data) {
        setBudgets(response.data);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch budget alerts
  const fetchBudgetAlerts = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.BUDGET.GET_ALERTS);
      if (response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error("Error fetching budget alerts:", error);
    }
  };

  // Set/update budget
  const handleSetBudget = async () => {
    if (!budget.category.trim()) {
      toast.error("Category is required");
      return;
    }
    
    if (!budget.amount || isNaN(budget.amount) || Number(budget.amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0");
      return;
    }
    
    try {
      await axiosInstance.post(API_PATHS.BUDGET.SET_BUDGET, {
        category: budget.category,
        amount: Number(budget.amount),
        icon: budget.icon
      });
      
      toast.success("Budget set successfully");
      setBudget({
        category: "",
        amount: "",
        icon: ""
      });
      fetchBudgets();
      fetchBudgetAlerts();
    } catch (error) {
      console.error("Error setting budget:", error);
      toast.error("Failed to set budget");
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchBudgetAlerts();
  }, []);

  // Function to render icon (either as image or emoji)
  const renderIcon = (iconValue) => {
    if (!iconValue) return '💰';
    
    // Check if it's a URL
    if (iconValue.startsWith('http')) {
      return (
        <img 
          src={iconValue} 
          alt="Category icon" 
          className="w-6 h-6" 
        />
      );
    }
    
    // If it's just an emoji character
    return iconValue;
  };

  // Format currency with Rs. prefix
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  return (
    <div>
      <p className="texts-xs text-gray-400 mb-4">
        Set monthly budgets for different expense categories and get alerts when you approach or exceed your limits.
      </p>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Set Budget</h2>
        
        <EmojiPickerPopup 
          icon={budget.icon}
          onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
        />

        <Input 
          value={budget.category}
          onChange={({target}) => handleChange("category", target.value)}
          label="Category"
          placeholder="Rent, groceries, etc"
          type="text"
        />
        
        <Input 
          value={budget.amount}
          onChange={({target}) => handleChange("amount", target.value)}
          label="Budget Amount"
          placeholder="Enter monthly budget amount"
          type="number"
        />
        
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="add-btn add-btn-fill"
            onClick={handleSetBudget}
          >
            <FaSave className="text-lg" />
            Set Budget
          </button>
        </div>
      </div>
      
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Budget Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-4 rounded-md ${
                  alert.status === 'EXCEEDED' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-center mb-2">
                  {alert.status === 'EXCEEDED' ? (
                    <FaExclamationCircle className="text-red-500 mr-2" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-500 mr-2" />
                  )}
                  <span className="mr-2">{renderIcon(alert.icon)}</span>
                  <p className="font-medium">{alert.category}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Budget: {formatCurrency(alert.budget)}</span>
                  <span>Spent: {formatCurrency(alert.spent)}</span>
                </div>
                <p className="text-sm mt-1">
                  {alert.status === 'EXCEEDED' 
                    ? `You've exceeded your budget by ${formatCurrency(alert.spent - alert.budget)}!` 
                    : `You've used ${Math.round((alert.spent / alert.budget) * 100)}% of your budget!`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-lg font-medium mb-4">Your Budgets</h2>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <FaSpinner className="text-lg animate-spin mr-2" />
            <p>Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <p className="text-gray-500 p-4 text-center">No budgets set yet</p>
        ) : (
          <div className="space-y-2">
            {budgets.map((budget) => (
              <div key={budget.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <span className="mr-2">{renderIcon(budget.icon)}</span>
                  <span className="font-medium">{budget.category}</span>
                </div>
                <span className="font-medium">{formatCurrency(budget.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
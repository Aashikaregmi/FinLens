import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import DeleteAlert from '../../components/DeleteAlert';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import BudgetManager from '../../components/Expense/BudgetManager';
import ExpenseList from '../../components/Expense/ExpenseList';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import ReceiptScanner from '../../components/Expense/ReceiptScanner';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/Modal';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  const[openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  // New states for OCR and Budget modals
  const[openScanReceiptModal, setOpenScanReceiptModal] = useState(false);
  const[openBudgetModal, setOpenBudgetModal] = useState(false);

  //Get All Expense Details
  const fetchExpenseDetails = async () => {
    if (loading) return;

    setLoading(true);

    try{
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );

      if(response.data){
        setExpenseData(response.data);
      }
    }catch(error){
      console.log("Something went wrong :( . Please try again", error)
    }finally{
      setLoading(false);
    }
  };

  //Handle Add Expense API call
  const handleAddExpense = async(expense) => {
    const {category, amount, date, icon} = expense;

    //Validation Checks

    if(!category.trim()){
      toast.error("Category is required.");
      return;
    }

    if(!amount || isNaN(amount) || Number(amount) <= 0){
      toast.error("Amount should be a valid number greater than 0.")
      return;
    }

    if(!date){
      toast.error("Date is required");
      return;
    }

    try{
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added sucessfully");
      fetchExpenseDetails();
    }catch(error){
      console.error(
        "Error adding expense",
        error.response?.data?.message || error.message
      );
    }
  };

  //Delete Expense
  const deleteExpense = async(id) => {
    try{
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));

      setOpenDeleteAlert({show: false, data: null});
      toast.success("Expense details deleted sucessfully");
      fetchExpenseDetails();
    }catch(error){
      console.error(
        "Error deleting expense",
        error.response?.data?.message || error.message
      );
    }
  };

  //handle download Expense details
  const handleDownloadExpenseDetails = async () => {
    try{
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,{
          responseType: "blob",
        }
      );

      //Create URL for Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }catch(error){
      console.error("Error downloading expense details :", error);
      toast.error("Failed to download expense details. Please try again later.")
    }
  };

  // Handle OCR scan completion
  const handleScanComplete = async (scanResults) => {
    setOpenScanReceiptModal(false);
    
    try {
      // Check if scan results contain categorized expenses
      if (scanResults && scanResults.categorized) {
        let addedCount = 0;
        
        // For each categorized expense, add it to the system
        for (const [category, amount] of Object.entries(scanResults.categorized)) {
          if (amount > 0) {
            await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
              category,
              amount,
              date: new Date().toISOString().split('T')[0], // Today's date
              icon: '', // Default icon or category-based icon
            });
            addedCount++;
          }
        }
        
        if (addedCount > 0) {
          toast.success(`${addedCount} expenses added from receipt`);
          fetchExpenseDetails(); // Refresh expense list
        } else {
          toast.error("No expenses could be extracted from the receipt");
        }
      } else {
        toast.error("No expenses could be extracted from the receipt");
      }
    } catch (error) {
      console.error("Error adding scanned expenses:", error);
      toast.error("Failed to add scanned expenses");
    }
  };

  useEffect(() => {
    fetchExpenseDetails();

    return()=>{};
  },[])

  return (
    <DashboardLayout activeMenu = "Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <ExpenseOverview
              transactions={expenseData}
              onAddExpenseClick={() => setOpenAddExpenseModal(true)}
              // Add new action handlers
              onScanReceiptClick={() => setOpenScanReceiptModal(true)}
              onManageBudgetClick={() => setOpenBudgetModal(true)} 
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({show: true, data: id});
            }}
            onDownload={handleDownloadExpenseDetails}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense}/>
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show: false, data:null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense detail ?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>

        {/* New modals */}
        <Modal
          isOpen={openScanReceiptModal}
          onClose={() => setOpenScanReceiptModal(false)}
          title="Scan Receipt"
        >
          <ReceiptScanner onScanComplete={handleScanComplete} />
        </Modal>

        <Modal
          isOpen={openBudgetModal}
          onClose={() => setOpenBudgetModal(false)}
          title="Manage Budgets"
        >
          <BudgetManager />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Expense;
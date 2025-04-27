import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import DeleteAlert from '../../components/DeleteAlert';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import IncomeList from '../../components/Income/IncomeList';
import IncomeOverview from '../../components/Income/IncomeOverview';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import Modal from '../../components/Modal';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';


const Income = () => {
  useUserAuth();

  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  const[openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  //Get All Income Details
  const fetchIncomeDetails = async () => {
    if (loading) return;

    setLoading(true);

    try{
      const response = await axiosInstance.get(
        `${API_PATHS.INCOME.GET_ALL_INCOME}`
      );

      if(response.data){
        setIncomeData(response.data);
      }
    }catch(error){
      console.log("Something went wrong :( . Please try again", error)
    }finally{
      setLoading(false);
    }
  };

  //Handle Add Income API call
  const handleAddIncome = async(income) => {
    // console.log("handleAddIncome called with data:", income);
    const {source, amount, date, icon} = income;

    //Validation Checks

    if(!source.trim()){
      toast.error("Source is required.");
      return;
    }

    if(!amount || isNaN(amount) || Number(amount) <= 0){
      toast.error("Amount should be a valid number greater than 0.")
      return;
    }

    if(!date){
      if(!date){
        toast.error("Date is required.");
        await new Promise(resolve => setTimeout(resolve, 10)); 
        return;
      }
      return;
    }

    try{
      // console.log("Before axios.post");
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source,
        amount,
        date,
        icon,
      });

      setOpenAddIncomeModal(false);
      toast.success("Income added sucessfully");
      fetchIncomeDetails();
    }catch(error){
      console.error(
        "Error adding income",
        error.response?.data?.message || error.message
      );
    }
  };

  //Delete Income
  const deleteIncome = async(id) => {
    try{
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));

      setOpenDeleteAlert({show: false, data: null});
      toast.success("Income details deleted sucessfully");
      fetchIncomeDetails();
    }catch(error){
      console.error(
        "Error deleting income",
        error.response?.data?.message || error.message
      );
    }
  };

  //handle download income details 
  const handleDownloadIncomeDetails = async () => {
    try{
      const response = await axiosInstance.get(
        API_PATHS.INCOME.DOWNLOAD_INCOME,{
          responseType: "blob",
        }
      );

      //Create URL for Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url
      link.setAttribute("download", "income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }catch(error){
      console.error("Error downloading income details :", error);
      toast.error("Failed to download income details. Please try again later.")
    }
  };

  useEffect(() => {
    //Uncomment after implementing API Call!
    fetchIncomeDetails(); 

    //MOCK DATA from ../../mock/mockData'
    // setIncomeData(incomeMockData);
  
    return () => {}
  }, []);
  

  return (
    <DashboardLayout activeMenu = "Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <IncomeOverview 
            transactions = {incomeData}
            onAddIncome = {() => setOpenAddIncomeModal(true)}
            />
          </div>
        </div>

        <IncomeList 
          transactions={incomeData}
          onDelete={(id) => {
            setOpenDeleteAlert({show: true, data: id});
          }}
          onDownload={handleDownloadIncomeDetails}
        />

        <Modal
        isOpen={openAddIncomeModal}
        onClose={() => setOpenAddIncomeModal(false)}
        title = "Add Income"
        >
         <AddIncomeForm onAddIncome={handleAddIncome}/>
        </Modal>

        <Modal
        isOpen={openDeleteAlert.show}
        onClose={()=>setOpenDeleteAlert({show: false, data:null })}
        title="Delete income"
        >
          <DeleteAlert 
            content="Are you sure you want to delete this income detail ?"
            onDelete={()=> deleteIncome(openDeleteAlert.data)}
          />
        </Modal>
      </div>
      </DashboardLayout>
  )
}

export default Income;
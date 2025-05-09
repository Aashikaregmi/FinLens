import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../../components/Cards/InfoCard';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';

import { IoMdCard } from "react-icons/io";
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu";
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import { addThousandsSeperator } from '../../utils/helper';

//MOCK DATA FILE
// import { dashboardMockData } from '../../mock/mockData';


const Home = () => {
  useUserAuth(); //only displays Dashboards if there is user

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const[loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}`
      );

      if(response.data){
        setDashboardData(response.data);

      }
    } catch (error){
      console.log("Something went wrong. Please try again", error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //Uncomment after implementing API
    fetchDashboardData();

    // MOCK DATA from ../../mock/mockData'
    // setDashboardData(dashboardMockData);

    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu = "Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon = {<IoMdCard />}
            label = "Total Balance"
            value = {addThousandsSeperator(dashboardData?.totalBalance || 0)} //helper.js
            color = "bg-primary"
          />
          <InfoCard
            icon = {< LuWalletMinimal />}
            label = "Total Income"
            value = {addThousandsSeperator(dashboardData?.totalIncome || 0)} //helper.js
            color = "bg-orange-500"
          />
          <InfoCard
            icon = {<LuHandCoins />}
            label = "Total Expense"
            value = {addThousandsSeperator(dashboardData?.totalExpense || 0)} //helper.js
            color = "bg-red-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <RecentTransactions
             transactions = {dashboardData?.RecentTransactions}
             onSeeMore = {() => navigate("/expense")}
            />

            <FinanceOverview
            totalBalance = {dashboardData?.totalBalance || 0}
            totalIncome = {dashboardData?.totalIncome || 0}
            totalExpense = {dashboardData?.totalExpense || 0}
            />

            {dashboardData?.last30DaysExpenses && (
              <ExpenseTransactions
                transactions={dashboardData.last30DaysExpenses.transactions}
                onSeeMore={() => navigate("/expense")}
              />
              )}
            
            {console.log("Data being passed to Last30Days:", dashboardData?.last30DaysExpenses?.transactions)}
              <Last30DaysExpenses
                data={dashboardData?.last30DaysExpenses?.transactions || []}
                
              />

              {dashboardData?.last60DaysIncome && (
              <RecentIncomeWithChart 
                data={dashboardData?.last60DaysIncome?.transactions?.slice(0,4) || []}
                totalIncome={dashboardData?.totalIncome || 0}
              />
              )}

              <RecentIncome 
              transactions={dashboardData?.last60DaysIncome?.transactions || []}
              onSeeMore ={() => navigate("/income")}
              />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
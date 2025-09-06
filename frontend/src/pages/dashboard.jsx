import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/loading';
import api from '../libs/apiCall';
import Info from '../components/info';
import Stats from '../components/stats';
import DoughnutChart from '../components/piechart';
import Chart from '../components/chart';
import RecentTransactions from '../components/recent-transactions';
import Accounts from '../components/accounts';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardStats = async () => {
    const URL = `/transaction/dashboard`;

    try {
      const { data } = await api.get(URL);
      setData(data || {});
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error(error?.response?.data?.message || "Something unexpected happened. Try again later.");
      if (error?.response?.data?.status === "auth_failed") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/sign-in";
        return;
      }
      // Set default data to prevent infinite loading
      setData({
        availableBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        chartData: [],
        lastTransactions: [],
        lastAccount: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      if (!user || !token) {
        navigate("/sign-in", { replace: true });
        return;
      }
      
      try {
        setIsLoading(true);
        await fetchDashboardStats();
      } catch (error) {
        console.error("Dashboard initialization error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDashboard();
  }, [navigate]);
  

  if (isLoading) {
    return (
      <div className='flex items-center justify-center w-full h-[80vh]'>
        <Loading />
      </div>
    );
  }


  return (

    <div className='px-0 md:px-5 2xl:px-20' >

      <Info title="Dashboard" subTitle={"Monitor your financial activities"} />
      <Stats dt={{
        balance: data?.availableBalance,
        income: data?.totalIncome,
        expense: data?.totalExpense,
      }} />

      <div className='flex flex-col-reverse items-center gap-10 w-ful md:flex-row' >
        <Chart data={data?.chartData} />
        {data?.totalIncome > 0 && (
          <DoughnutChart 
            dt = {{
              balance: data?.availableBalance,
              income :data?.totalIncome,
              expense: data?.totalExpense,
            }}
          />
        )}
      </div>

      <div className='flex flex-col-reverse md:flex-row gap-0 md:gap-10 2xl:gap-20'>
        <RecentTransactions data={data?.lastTransactions} />
        {data?.lastAccount?.length > 0 && <Accounts data={data?.lastAccount} />}
      </div>

    </div>
  )
}

export default Dashboard;

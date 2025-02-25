import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Title from "./title";
import api from "../libs/apiCall";

const Chart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/transaction/dashboard");

      // Transform data into chart-friendly format
      const monthlyData = data.chartData?.map((item) => ({
        label: item.label,
        income: Number(item.income) || 0,
        expense: Number(item.expense) || 0,
      })) || [];

      setChartData(monthlyData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full flex-1">
      <Title title="Transaction Activity" />

      {isLoading ? (
        <p className="text-center py-10">Loading Chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height={500} className="mt-5">
          <LineChart width={500} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" padding={{ left: 30, right: 30 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="expense" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Chart;

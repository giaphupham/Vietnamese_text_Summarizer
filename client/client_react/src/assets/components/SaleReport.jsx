import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import HttpClient from './HttpClient';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesReport = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const response = await HttpClient.get(`${import.meta.env.VITE_REACT_APP_URL}/admin_report_sales`);
      setData(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch sales report');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  const totalRevenueData = {
    labels: ['Pro Subscription', 'Premium Subscription', 'Total Revenue'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [data.revenue_pro, data.revenue_premium, data.revenue_total],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3'],
      },
    ],
  };

  const monthlyLabels = data.monthly_revenues.map(revenue => revenue.month);
  const proData = data.monthly_revenues.map(revenue => revenue.revenue_pro);
  const premiumData = data.monthly_revenues.map(revenue => revenue.revenue_premium);

  const monthlyRevenueData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Pro Revenue',
        data: proData,
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Premium Revenue',
        data: premiumData,
        backgroundColor: '#FF9800',
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Revenue Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <Bar data={totalRevenueData} />
        </div>
        <div className="p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Monthly Revenue</h2>
        <Bar data={monthlyRevenueData} options={{
          indexAxis: 'x', // Horizontal bar chart
          scales: {
            x: {
              title: {
                display: true,
                text: 'Revenue ($)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          }
        }} />
      </div>
      </div>
    </div>
  );
};


export default SalesReport;

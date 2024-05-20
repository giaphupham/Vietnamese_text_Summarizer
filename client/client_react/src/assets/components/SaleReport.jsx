import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import HttpClient from './HttpClient';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const response = await HttpClient.get('http://127.0.0.1:5000/admin_report_sales');
      setReportData(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch sales report');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!reportData) {
    return <div>Loading...</div>;
  }

  const data = {
    labels: ['Pro Subscription', 'Premium Subscription', 'Total Revenue'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [reportData.revenue_pro, reportData.revenue_premium, reportData.revenue_total],
        backgroundColor: ['#3b82f6', '#10b981', '#f97316'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Report',
      },
    },
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <Bar data={data} options={options} />
    </div>
  );
};

export default SalesReport;

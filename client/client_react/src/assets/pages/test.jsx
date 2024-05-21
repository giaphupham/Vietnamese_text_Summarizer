import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // necessary for Chart.js v3 and above
import HttpClient from '../components/HttpClient';

const Test = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    HttpClient.get('http://127.0.0.1:5000/admin_report_sales', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.data)
      .then(data => {setData(data)
      console.log(data)
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

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


export default {
    routeProps: {
        path: "/test",
        main: Test,
    },
};

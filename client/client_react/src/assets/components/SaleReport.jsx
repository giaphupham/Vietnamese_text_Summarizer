import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HttpClient from './HttpClient';

const SalesReport = () => {
  const [salesReport, setSalesReport] = useState({});

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const response = await HttpClient.get('http://127.0.0.1:5000/admin_report_sales');
      setSalesReport(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sales Report</h2>
      <p>Pro Subscriptions: {salesReport.count_type_1}</p>
      <p>Premium Subscriptions: {salesReport.count_type_2}</p>
      <p>Revenue from Pro: ${salesReport.revenue_pro}</p>
      <p>Revenue from Premium: ${salesReport.revenue_premium}</p>
      <p>Total Revenue: ${salesReport.revenue_total}</p>
    </div>
  );
};

export default SalesReport;

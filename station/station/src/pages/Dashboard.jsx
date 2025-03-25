import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ userRole, onLogout }) => {
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [stats, setStats] = useState({
    totalSalesToday: 0,
    activeEmployees: 0,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF69B4'];
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (userRole === 'admin') {
      fetchSalesData();
      fetchActiveEmployees();
      fetchStockData();
    }
  }, [userRole]);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched sales:', data);

      const dayTotals = data.reduce((acc, item) => {
        acc[item.day] = (acc[item.day] || 0) + item.sales;
        return acc;
      }, {});
      const formattedData = Object.entries(dayTotals).map(([day, total]) => ({
        name: day,
        value: total,
      }));
      setSalesData(formattedData);

      const today = new Date().toLocaleString('en-US', { weekday: 'long' });
      const todaySales = data
        .filter(item => item.day === today)
        .reduce((sum, item) => sum + item.sales, 0) || 0;
      setStats(prev => ({ ...prev, totalSalesToday: todaySales }));
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
      setStats(prev => ({ ...prev, totalSalesToday: 0 }));
    }
  };

  const fetchActiveEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      const active = data.filter(record => record.status === 'Present' && record.checkIn && !record.checkOut).length;
      setStats(prev => ({ ...prev, activeEmployees: active }));
    } catch (error) {
      console.error('Error fetching active employees:', error);
      setStats(prev => ({ ...prev, activeEmployees: 0 }));
    }
  };

  const fetchStockData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stock', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched stock:', data);

      const formattedData = data.map(stock => ({
        name: stock.item,
        stock: stock.level,
      }));
      setStockData(formattedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData([]);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="bg-red-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-red-800">Access Denied</h2>
          <p className="text-red-700">Only administrators can access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Sales Today</h3>
          <p className="text-3xl font-bold">{stats.totalSalesToday.toLocaleString()}DH</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Employees</h3>
          <p className="text-3xl font-bold">{stats.activeEmployees}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Sales Distribution</h2>
        {salesData.length > 0 ? (
          <PieChart width={400} height={400}>
            <Pie
              data={salesData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <p className="text-center text-gray-500">No sales data available</p>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Stock Levels</h2>
        {stockData.length > 0 ? (
          <BarChart width={800} height={300} data={stockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#82ca9d" name="Stock Level" />
          </BarChart>
        ) : (
          <p className="text-center text-gray-500">No stock data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
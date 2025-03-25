import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Sales = ({ userRole, userStationId, onLogout }) => {
  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [stations, setStations] = useState([]);
  const [daySalesData, setDaySalesData] = useState([]);
  const [formData, setFormData] = useState({
    day: '',
    sales: '',
    productId: '',
    stationId: '', 
  });
  const [stats, setStats] = useState({
    todaySales: 0,
    weeklyAverage: 0,
    monthlyTotal: 0,
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF69B4'];

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      const fetchedStations = await fetchStations();
      if (userRole === 'manager' && userStationId) {
        const managerStation = fetchedStations.find(station => station._id === userStationId);
        if (managerStation) {
          setFormData(prev => ({ ...prev, stationId: managerStation.IdStation }));
          fetchSalesData(managerStation.IdStation);
        } else {
          console.error('Manager’s station not found in fetched stations');
        }
      }
    };
    loadData();
  }, [userRole, userStationId]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched products:', JSON.stringify(data, null, 2));
      setProducts(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      return [];
    }
  };

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/stations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched stations:', JSON.stringify(data, null, 2));
      setStations(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
      return [];
    }
  };

  const fetchSalesData = async (stationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const url = stationId
        ? `http://localhost:5000/api/sales?station=${stationId}`
        : 'http://localhost:5000/api/sales';
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Raw sales data:', JSON.stringify(data, null, 2));
      console.log('Products available during mapping:', JSON.stringify(products, null, 2));

      const formattedData = data.map(item => {
        const productId = parseInt(item.product);
        const product = products.find(p => p.IdProduit === productId) || {};
        console.log(`Mapping sale - Product ID: ${productId}, Found: ${product.NomProduit || 'Not found'}`);
        return {
          name: `${item.day.slice(0, 3)} - ${product.NomProduit || 'Unknown'}`,
          amount: item.sales,
          day: item.day,
          product: product.NomProduit || 'Unknown',
        };
      });
      setSalesData(formattedData);

      const dayTotals = data.reduce((acc, item) => {
        acc[item.day] = (acc[item.day] || 0) + item.sales;
        return acc;
      }, {});
      const pieData = Object.entries(dayTotals).map(([day, total]) => ({
        name: day,
        value: total,
      }));
      setDaySalesData(pieData);

      const today = new Date().toLocaleString('en-US', { weekday: 'long' });
      const todaySales = data
        .filter(item => item.day === today)
        .reduce((sum, item) => sum + item.sales, 0);
      const monthlyTotal = data.reduce((sum, item) => sum + item.sales, 0);
      const weeklyAverage = data.length > 0 ? monthlyTotal / data.length : 0;

      setStats({ todaySales, weeklyAverage, monthlyTotal });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData([]);
      setDaySalesData([]);
      setStats({ todaySales: 0, weeklyAverage: 0, monthlyTotal: 0 });
    }
  };

  const handleInputChange = (e) => {
    const value = ['productId', 'stationId'].includes(e.target.name) ? parseInt(e.target.value) || '' : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (e.target.name === 'stationId' && value && userRole === 'admin') {
      fetchSalesData(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting sales:', JSON.stringify(formData, null, 2));
    const { day, sales, productId, stationId } = formData;
    const salesNum = parseFloat(sales);

    if (!day || !salesNum || salesNum < 0 || !productId || !stationId) {
      alert('Please enter a valid day, sales amount, product, and station');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ day, sales: salesNum, productId, stationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error(`Failed to save sales! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      alert('Sales data saved successfully!');
      setFormData({ ...formData, day: '', sales: '', productId: '' });
      await fetchSalesData(stationId);
    } catch (error) {
      console.error('Error saving sales data:', error);
      alert('Failed to save sales data: ' + error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales</h1>
        {(userRole === 'admin' || (userRole === 'manager' && userStationId)) && (
          <button
            onClick={() => document.getElementById('sales-form').scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            New Sale
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Today's Sales</h3>
          <p className="text-3xl font-bold">{stats.todaySales.toLocaleString()}DH</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Total</h3>
          <p className="text-3xl font-bold">{stats.monthlyTotal.toLocaleString()}DH</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8" id="sales-form">
        <h2 className="text-xl font-semibold mb-4">Enter Daily Sales</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-4">
            <select
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Day</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              name="stationId"
              value={formData.stationId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              disabled={userRole === 'manager'}
            >
              <option value="">Select Station</option>
              {stations.map(station => (
                <option key={station.IdStation} value={station.IdStation}>
                  {station.NomStation}
                </option>
              ))}
            </select>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.IdProduit} value={product.IdProduit}>
                  {product.NomProduit}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="sales"
              value={formData.sales}
              onChange={handleInputChange}
              placeholder="Sales Amount"
              className="w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Save Sales
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sales History (By Product)</h2>
          {salesData.length > 0 ? (
            <BarChart width={800} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          ) : (
            <p className="text-center text-gray-500">No sales data available for this station</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Sales Distribution (By Day)</h2>
          {daySalesData.length > 0 ? (
            <PieChart width={400} height={400}>
              <Pie
                data={daySalesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {daySalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p className="text-center text-gray-500">No sales data available for this station</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No transactions available for this station
                    </td>
                  </tr>
                ) : (
                  salesData.map((sale, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{sale.day}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sale.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sale.amount.toLocaleString()}DH</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
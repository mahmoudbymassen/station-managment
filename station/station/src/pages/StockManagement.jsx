import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StockManagement = ({ userRole, userStationId, onLogout }) => {
  const [stockData, setStockData] = useState([]);
  const [stations, setStations] = useState([]);
  const [deliveryForm, setDeliveryForm] = useState({
    item: '',
    amount: '',
    supplier: '',
    scheduledDate: '',
    stationId: userRole === 'manager' ? '' : '', 
  });
  const [deliveries, setDeliveries] = useState([]);
  const THRESHOLD_PERCENTAGE = 20;

  useEffect(() => {
    const loadData = async () => {
      await fetchStations();
      await fetchStockData();
      await fetchDeliveries();
      if (userRole === 'manager' && userStationId) {
        const managerStation = stations.find(station => station._id === userStationId);
        if (managerStation) {
          setDeliveryForm(prev => ({ ...prev, stationId: managerStation.IdStation }));
        }
      }
    };
    loadData();
  }, [userRole, userStationId, stations]);

  const fetchStockData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/stock', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      const defaultItems = [
        { item: 'Fuel', level: 0, capacity: 10000 },
        { item: 'Lubricant', level: 0, capacity: 5000 },
      ];
      const formattedData = defaultItems.map(defaultItem => {
        const stock = data.find(item => item.item === defaultItem.item) || defaultItem;
        return {
          name: stock.item,
          level: stock.level,
          capacity: stock.capacity,
          percentage: (stock.level / stock.capacity) * 100 || 0,
        };
      });
      setStockData(formattedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData([
        { name: 'Fuel', level: 0, capacity: 10000, percentage: 0 },
        { name: 'Lubricant', level: 0, capacity: 5000, percentage: 0 },
      ]);
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
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/stock/deliveries', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      console.log('Fetched deliveries:', JSON.stringify(data, null, 2));
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    const { item, amount, supplier, scheduledDate, stationId } = deliveryForm;
    const amountNum = parseFloat(amount);

    if (!item || isNaN(amountNum) || amountNum < 0 || !supplier || !scheduledDate || !stationId) {
      alert('Please fill all fields correctly, including selecting a station');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/stock/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item,
          amount: amountNum,
          supplier,
          scheduledDate,
          stationId: parseInt(stationId),
          confirmed: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error(`Failed to schedule delivery! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }

      alert('Delivery scheduled and stock updated successfully!');
      setDeliveryForm({ item: '', amount: '', supplier: '', scheduledDate: '', stationId: userRole === 'manager' ? deliveryForm.stationId : '' });
      await Promise.all([fetchStockData(), fetchDeliveries()]);
    } catch (error) {
      console.error('Error in delivery process:', error);
      alert('Failed: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'stationId' ? parseInt(e.target.value) || '' : e.target.value;
    setDeliveryForm({ ...deliveryForm, [e.target.name]: value });
  };

  const getThresholdAlerts = () => {
    return stockData
      .filter(stock => stock.percentage < THRESHOLD_PERCENTAGE)
      .map(stock => `${stock.name} is below ${THRESHOLD_PERCENTAGE}% (${stock.level}/${stock.capacity})`);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">Stock Management</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Stock Levels</h2>
        {stockData.length > 0 ? (
          <BarChart width={600} height={300} data={stockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${value} L`, name]} />
            <Legend />
            <Bar dataKey="level" fill="#3B82F6" name="Current Level" />
            <Bar dataKey="capacity" fill="#D1D5DB" name="Capacity" opacity={0.5} />
          </BarChart>
        ) : (
          <p className="text-center text-gray-500">Loading stock data...</p>
        )}
      </div>

      {getThresholdAlerts().length > 0 && (
        <div className="bg-yellow-100 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Threshold Alerts</h2>
          <ul className="list-disc pl-5 text-yellow-800">
            {getThresholdAlerts().map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Delivery Management</h2>
        <form onSubmit={handleDeliverySubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="item"
              value={deliveryForm.item}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Item</option>
              <option value="Fuel">Fuel</option>
              <option value="Lubricant">Lubricant</option>
            </select>
            <input
              type="number"
              name="amount"
              value={deliveryForm.amount}
              onChange={handleInputChange}
              placeholder="Delivery Amount"
              className="p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
            <input
              type="text"
              name="supplier"
              value={deliveryForm.supplier}
              onChange={handleInputChange}
              placeholder="Supplier Name"
              className="p-2 border rounded"
              required
            />
            <input
              type="date"
              name="scheduledDate"
              value={deliveryForm.scheduledDate}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            />
            <select
              name="stationId"
              value={deliveryForm.stationId}
              onChange={handleInputChange}
              className="p-2 border rounded"
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
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Schedule Delivery
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No deliveries scheduled</td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{delivery.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{delivery.amount.toLocaleString()} L</td>
                    <td className="px-6 py-4 whitespace-nowrap">{delivery.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(delivery.scheduledDate).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
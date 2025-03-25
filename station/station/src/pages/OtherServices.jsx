import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const OtherServices = ({ userRole, userStationId, onLogout }) => {
  const [servicesData, setServicesData] = useState([]);
  const [serviceForm, setServiceForm] = useState({ type: '', revenue: '', date: '', stationId: '' });
  const [serviceRecords, setServiceRecords] = useState([]);
  const [stations, setStations] = useState([]);
  const REVENUE_THRESHOLD = 500;

  useEffect(() => {
    const loadData = async () => {
      await fetchStations();
      await fetchServicesData();
      await fetchServiceRecords();
      if (userRole === 'manager' && userStationId) {
        const managerStation = stations.find(station => station._id === userStationId);
        if (managerStation) {
          setServiceForm(prev => ({ ...prev, stationId: managerStation.IdStation }));
        }
      }
    };
    loadData();
  }, [userRole, userStationId, stations]);

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

  const fetchServicesData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/services/summary', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      const defaultServices = [
        { type: 'Car Wash', revenue: 0 },
        { type: 'Oil Change', revenue: 0 },
        { type: 'Tire Service', revenue: 0 },
        { type: 'Store Sales', revenue: 0 },
      ];
      const formattedData = defaultServices.map(defaultService => {
        const service = data.find(item => item.type === defaultService.type) || defaultService;
        return {
          name: service.type,
          revenue: service.revenue,
        };
      });
      setServicesData(formattedData);
    } catch (error) {
      console.error('Error fetching services data:', error);
      setServicesData([
        { name: 'Car Wash', revenue: 0 },
        { name: 'Oil Change', revenue: 0 },
        { name: 'Tire Service', revenue: 0 },
        { name: 'Store Sales', revenue: 0 },
      ]);
    }
  };

  const fetchServiceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/services', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const text = await response.text();
        if (text.includes('Token is not valid')) onLogout();
        throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
      }
      const data = await response.json();
      setServiceRecords(data);
    } catch (error) {
      console.error('Error fetching service records:', error);
      setServiceRecords([]);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const { type, revenue, date, stationId } = serviceForm;
    const revenueNum = parseFloat(revenue);

    if (!type || isNaN(revenueNum) || revenueNum < 0 || !date || !stationId) {
      alert('Please fill all fields correctly, including selecting a station');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type, revenue: revenueNum, date, stationId: parseInt(stationId) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error(`Failed to add service record! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }

      alert('Service record added successfully!');
      setServiceForm({ type: '', revenue: '', date: '', stationId: userRole === 'manager' ? serviceForm.stationId : '' });
      await Promise.all([fetchServicesData(), fetchServiceRecords()]);
    } catch (error) {
      console.error('Error in service submission:', error);
      alert('Failed: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'stationId' ? parseInt(e.target.value) || '' : e.target.value;
    setServiceForm({ ...serviceForm, [e.target.name]: value });
  };

  const getRevenueAlerts = () => {
    return servicesData
      .filter(service => service.revenue < REVENUE_THRESHOLD)
      .map(service => `${service.name} revenue is below ${REVENUE_THRESHOLD} (${service.revenue})`);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-8">Other Services Management</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Services Revenue Overview</h2>
        {servicesData.length > 0 ? (
          <BarChart width={600} height={300} data={servicesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} DH`, 'Revenue']} />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
          </BarChart>
        ) : (
          <p className="text-center text-gray-500">Loading services data...</p>
        )}
      </div>

      {getRevenueAlerts().length > 0 && (
        <div className="bg-yellow-100 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Revenue Alerts</h2>
          <ul className="list-disc pl-5 text-yellow-800">
            {getRevenueAlerts().map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Service Records</h2>
        <form onSubmit={handleServiceSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              name="type"
              value={serviceForm.type}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Service</option>
              <option value="Car Wash">Car Wash</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Service">Tire Service</option>
              <option value="Store Sales">Store Sales</option>
            </select>
            <input
              type="number"
              name="revenue"
              value={serviceForm.revenue}
              onChange={handleInputChange}
              placeholder="Revenue Amount"
              className="p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
            <input
              type="date"
              name="date"
              value={serviceForm.date}
              onChange={handleInputChange}
              className="p-2 border rounded"
              required
            />
            <select
              name="stationId"
              value={serviceForm.stationId}
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
            Add Service Record
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serviceRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No service records available</td>
                </tr>
              ) : (
                serviceRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{record.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.revenue.toLocaleString()} DH</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stations.find(station => station.IdStation === record.stationId)?.NomStation || 'Unknown'}
                    </td>
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

export default OtherServices;
// src/pages/Managers.jsx
import React, { useState, useEffect } from 'react';

const Managers = ({ userRole, onLogout }) => {
  const [managers, setManagers] = useState([]);
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', stationId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchManagers();
    fetchStations();
  }, []);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://localhost:5000/api/auth/managers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(errorData.message || 'Failed to fetch managers');
      }

      const data = await response.json();
      setManagers(data);
    } catch (err) {
      setError(err.message);
      if (err.message === 'No token found') {
        onLogout();
      }
    }
  };

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://localhost:5000/api/stations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stations');
      }

      const data = await response.json();
      setStations(data);
    } catch (err) {
      setError(err.message);
      if (err.message === 'No token found') {
        onLogout();
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
  
      console.log('Adding manager with data:', formData); 
  
      const response = await fetch('http://localhost:5000/api/auth/manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Server error response:', errorData); 
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(errorData.message || 'Failed to add manager');
      }
  
      await response.json();
      setFormData({ email: '', password: '', stationId: '' });
      fetchManagers();
    } catch (err) {
      setError(err.message);
      if (err.message === 'No token found') {
        onLogout();
      }
    }
  };

  if (userRole !== 'admin') {
    return <div className="p-4">
    <h1 className="text-3xl font-bold mb-8">Add Managers</h1>
    <div className="bg-red-100 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-red-800">Access Denied</h2>
      <p className="text-red-700">Only administrators can access the Managers</p>
    </div>
  </div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Managers</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Manager</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleAddManager} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Station</label>
            <select
              name="stationId"
              value={formData.stationId}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border rounded"
              required
            >
              <option value="">Select a Station</option>
              {stations.map(station => (
                <option key={station._id} value={station._id}>
                  {station.NomStation} (ID: {station.IdStation})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Manager
          </button>
        </form>
      </div>

      {/* Managers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Managers</h2>
          {managers.length === 0 ? (
            <p className="text-gray-500">No managers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {managers.map(manager => (
                    <tr key={manager._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{manager.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager.stationId?.NomStation || 'No Station Assigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Managers;
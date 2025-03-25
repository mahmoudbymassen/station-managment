import React, { useState, useEffect } from 'react';

const Tanks = ({ userRole, userStationId, onLogout }) => {
  const [tanks, setTanks] = useState([]);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [formData, setFormData] = useState({
    Station: userRole === 'manager' ? userStationId : '',
    Capacite: '',
    DateInstallation: '',
    TypeCarburant: '',
    Statut: 'Operational',
    CurrentLevel: ''
  });

  useEffect(() => {
    fetchTanks();
    fetchStations();
  }, []);

  const fetchTanks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/tanks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched tanks:', data);
      setTanks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tanks:', error);
      setTanks([]);
      if (error.message === 'No token found') onLogout();
    }
  };

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/stations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
      if (error.message === 'No token found') onLogout();
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTank = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }

    const requiredFields = ['Station', 'Capacite', 'DateInstallation', 'TypeCarburant', 'Statut'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }

    const submissionData = {
      ...formData,
      Capacite: parseFloat(formData.Capacite),
      CurrentLevel: parseFloat(formData.CurrentLevel) || 0
    };

    try {
      const response = await fetch('http://localhost:5000/api/tanks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }
      await fetchTanks();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error adding tank:', error);
      alert('Failed to add tank: ' + error.message);
    }
  };

  const handleEditTank = (tank) => {
    setEditingTank(tank);
    setFormData({
      Station: tank.Station._id,
      Capacite: tank.Capacite.toString(),
      DateInstallation: tank.DateInstallation.split('T')[0],
      TypeCarburant: tank.TypeCarburant,
      Statut: tank.Statut,
      CurrentLevel: tank.CurrentLevel.toString()
    });
    setShowModal(true);
  };

  const handleUpdateTank = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }

    const requiredFields = ['Station', 'Capacite', 'DateInstallation', 'TypeCarburant', 'Statut'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }

    const submissionData = {
      ...formData,
      Capacite: parseFloat(formData.Capacite),
      CurrentLevel: parseFloat(formData.CurrentLevel) || 0
    };

    try {
      const response = await fetch(`http://localhost:5000/api/tanks/${editingTank.IdCiterne}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }
      await fetchTanks();
      resetForm();
      setShowModal(false);
      setEditingTank(null);
    } catch (error) {
      console.error('Error updating tank:', error);
      alert('Failed to update tank: ' + error.message);
    }
  };

  const handleDeleteTank = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }
  
    if (!id) {
      console.error('Attempted to delete tank with undefined ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this tank?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/tanks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          if (errorData.message === 'Token is not valid') {
            onLogout();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'No additional info'}`);
        }
        await fetchTanks();
      } catch (error) {
        console.error('Error deleting tank:', error);
        alert(`Failed to delete tank: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      Station: userRole === 'manager' ? userStationId : '',
      Capacite: '',
      DateInstallation: '',
      TypeCarburant: '',
      Statut: 'Operational',
      CurrentLevel: ''
    });
  };

  const getProgressWidth = (current, capacity) => {
    return capacity > 0 ? `${(current / capacity) * 100}%` : '0%';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tanks</h1>
        {userRole === 'admin' && ( 
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Tank
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No tanks found</div>
        ) : (
          tanks.map((tank) => (
            <div key={tank.IdCiterne} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Tank {tank.IdCiterne}</h3>
                  <p className="text-gray-600">{tank.TypeCarburant}</p>
                  <p className="text-gray-600">Station: {tank.Station?.NomStation || 'Unknown'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTank(tank)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTank(tank.IdCiterne)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{tank.Capacite} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Level:</span>
                  <span className="font-medium">
                    {tank.CurrentLevel} L ({Math.round((tank.CurrentLevel / tank.Capacite) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: getProgressWidth(tank.CurrentLevel, tank.Capacite) }}
                  ></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      tank.Statut === 'Operational'
                        ? 'text-green-600'
                        : tank.Statut === 'Maintenance'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {tank.Statut}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {editingTank ? 'Edit Tank' : 'Add Tank'}
            </h2>
            <div className="space-y-4">
              <select
                name="Station"
                value={formData.Station}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={userRole === 'manager'} 
              >
                <option value="">Select Station</option>
                {stations.map(station => (
                  <option key={station._id} value={station._id}>
                    {station.NomStation}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="Capacite"
                value={formData.Capacite}
                onChange={handleInputChange}
                placeholder="Capacité (L)"
                className="w-full p-2 border rounded"
                required
                min="0"
              />
              <input
                type="date"
                name="DateInstallation"
                value={formData.DateInstallation}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="TypeCarburant"
                value={formData.TypeCarburant}
                onChange={handleInputChange}
                placeholder="Type de Carburant"
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="Statut"
                value={formData.Statut}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
              <input
                type="number"
                name="CurrentLevel"
                value={formData.CurrentLevel}
                onChange={handleInputChange}
                placeholder="Current Level (L)"
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTank(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingTank ? handleUpdateTank : handleAddTank}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingTank ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tanks;
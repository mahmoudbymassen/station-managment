import React, { useState, useEffect } from 'react';

const Pumps = ({ userRole, userStationId, onLogout }) => {
  const [pumps, setPumps] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPump, setEditingPump] = useState(null);
  const [formData, setFormData] = useState({
    Numero: '',
    Statut: 'Active',
    Debit: '',
    IdCiterne: ''
  });

  useEffect(() => {
    fetchPumps();
    fetchTanks();
  }, []);

  useEffect(() => {
    if (userRole === 'manager' && tanks.length > 0) {
      const managerTanks = tanks.filter(tank => tank.Station === userStationId);
      console.log('Manager tanks:', managerTanks);
      if (managerTanks.length > 0 && !formData.IdCiterne) {
        console.log('Pre-setting IdCiterne to:', managerTanks[0].IdCiterne);
        setFormData(prev => ({
          ...prev,
          IdCiterne: String(managerTanks[0].IdCiterne)
        }));
      } else if (managerTanks.length === 0) {
        console.warn('No tanks available for manager’s station:', userStationId);
      }
    }
  }, [tanks, userRole, userStationId]);

  const fetchPumps = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/pumps', {
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
      console.log('Fetched pumps:', data);
      setPumps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pumps:', error);
      setPumps([]);
      if (error.message === 'No token found') onLogout();
    }
  };

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

  const handleInputChange = (e) => {
    console.log('Input changed:', e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPump = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }

    console.log('Form data before submission:', formData);
    const requiredFields = ['Numero', 'Statut', 'Debit', 'IdCiterne'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }

    const IdCiterneNum = parseInt(formData.IdCiterne, 10);
    if (isNaN(IdCiterneNum) || IdCiterneNum <= 0) {
      console.error('Invalid IdCiterne:', formData.IdCiterne);
      alert('Please select a valid tank');
      return;
    }

    const submissionData = {
      ...formData,
      Debit: parseFloat(formData.Debit),
      IdCiterne: IdCiterneNum
    };

    console.log('Submission data:', submissionData);
    try {
      const response = await fetch('http://localhost:5000/api/pumps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }
      await fetchPumps();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error adding pump:', error);
      alert('Failed to add pump: ' + error.message);
    }
  };

  const handleEditPump = (pump) => {
    setEditingPump(pump);
    setFormData({
      Numero: pump.Numero,
      Statut: pump.Statut,
      Debit: pump.Debit.toString(),
      IdCiterne: String(pump.IdCiterne)
    });
    setShowModal(true);
  };

  const handleUpdatePump = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }

    console.log('Form data before update:', formData);
    const requiredFields = ['Numero', 'Statut', 'Debit', 'IdCiterne'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }

    const IdCiterneNum = parseInt(formData.IdCiterne, 10);
    if (isNaN(IdCiterneNum) || IdCiterneNum <= 0) {
      console.error('Invalid IdCiterne:', formData.IdCiterne);
      alert('Please select a valid tank');
      return;
    }

    const submissionData = {
      ...formData,
      Debit: parseFloat(formData.Debit),
      IdCiterne: IdCiterneNum
    };

    console.log('Submission data:', submissionData);
    try {
      const response = await fetch(`http://localhost:5000/api/pumps/${editingPump.IdPompe}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }
      await fetchPumps();
      resetForm();
      setShowModal(false);
      setEditingPump(null);
    } catch (error) {
      console.error('Error updating pump:', error);
      alert('Failed to update pump: ' + error.message);
    }
  };

  const handleDeletePump = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }
  
    if (!id) {
      console.error('Attempted to delete pump with undefined ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this pump?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/pumps/${id}`, {
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
        await fetchPumps();
      } catch (error) {
        console.error('Error deleting pump:', error);
        alert(`Failed to delete pump: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    const managerTanks = userRole === 'manager' ? tanks.filter(tank => tank.Station === userStationId) : [];
    setFormData({
      Numero: '',
      Statut: 'Active',
      Debit: '',
      IdCiterne: userRole === 'manager' && managerTanks.length > 0 ? String(managerTanks[0].IdCiterne) : ''
    });
  };

  const getTankLabel = (IdCiterne) => {
    const tank = tanks.find(t => t.IdCiterne === IdCiterne);
    return tank ? `Tank ${tank.IdCiterne} (${tank.TypeCarburant})` : 'Unknown Tank';
  };

  const availableTanks = userRole === 'manager' 
    ? tanks.filter(tank => tank.Station === userStationId) 
    : tanks;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pumps</h1>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Pump
          </button>
        )}
      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pumps.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No pumps found</div>
        ) : (
          pumps.map((pump) => (
            <div key={pump.IdPompe} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Pump {pump.Numero}</h3>
                  <p className="text-gray-600">{pump.TypeCarburant || 'N/A'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPump(pump)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePump(pump.IdPompe)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connected Tank:</span>
                  <span className="font-medium">{getTankLabel(pump.IdCiterne)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Flow Rate:</span>
                  <span className="font-medium">{pump.Debit} L/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      pump.Statut === 'Active'
                        ? 'text-green-600'
                        : pump.Statut === 'Inactive'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {pump.Statut}
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
              {editingPump ? 'Edit Pump' : 'Add Pump'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="Numero"
                value={formData.Numero}
                onChange={handleInputChange}
                placeholder="Numéro"
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <input
                type="number"
                name="Debit"
                value={formData.Debit}
                onChange={handleInputChange}
                placeholder="Débit (L/min)"
                className="w-full p-2 border rounded"
                required
                min="0"
              />
              <select
                name="IdCiterne"
                value={formData.IdCiterne}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a Tank</option>
                {availableTanks.map((tank) => (
                  <option key={tank.IdCiterne} value={tank.IdCiterne}>
                    Tank {tank.IdCiterne} ({tank.TypeCarburant})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPump(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingPump ? handleUpdatePump : handleAddPump}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingPump ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pumps;
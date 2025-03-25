import React, { useState, useEffect } from 'react';

const Stations = ({ userRole, userStationId, onLogout }) => {
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    IdStation: '', 
    NomStation: '',
    AdresseStation: '',
    VilleStation: '',
    DateMiseEnService: '',
    Latitude: '',
    Longitude: '',
    Telephone: '',
    Email: '',
    HorairesOuverture: '',
    Statut: 'Active',
  });

  useEffect(() => {
    fetchStations();
  }, []);

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
      console.log('Fetched stations:', data);
      setStations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setStations([]);
      if (error.message === 'No token found') onLogout();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'IdStation' || e.target.name === 'Latitude' || e.target.name === 'Longitude'
      ? e.target.value === '' ? '' : Number(e.target.value)
      : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleAddStation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Validate required fields before sending
      const { IdStation, NomStation } = formData;
      if (!IdStation || !NomStation) {
        throw new Error('Station ID and Name are required');
      }

      const response = await fetch('http://localhost:5000/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }
      await fetchStations();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error adding station:', error);
      alert('Failed to add station: ' + error.message);
    }
  };

  const handleEditStation = (station) => {
    setEditingStation(station);
    setFormData({
      IdStation: station.IdStation,
      NomStation: station.NomStation,
      AdresseStation: station.AdresseStation,
      VilleStation: station.VilleStation,
      DateMiseEnService: station.DateMiseEnService.split('T')[0],
      Latitude: station.Latitude,
      Longitude: station.Longitude,
      Telephone: station.Telephone || '',
      Email: station.Email || '',
      HorairesOuverture: station.HorairesOuverture || '',
      Statut: station.Statut,
    });
    setShowModal(true);
  };

  const handleUpdateStation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://localhost:5000/api/stations/${editingStation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') onLogout();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }
      await fetchStations();
      resetForm();
      setShowModal(false);
      setEditingStation(null);
    } catch (error) {
      console.error('Error updating station:', error);
      alert('Failed to update station: ' + error.message);
    }
  };

  const handleDeleteStation = async (id) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch(`http://localhost:5000/api/stations/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === 'Token is not valid') onLogout();
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
        }
        await fetchStations();
      } catch (error) {
        console.error('Error deleting station:', error);
        alert('Failed to delete station: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      IdStation: '',
      NomStation: '',
      AdresseStation: '',
      VilleStation: '',
      DateMiseEnService: '',
      Latitude: '',
      Longitude: '',
      Telephone: '',
      Email: '',
      HorairesOuverture: '',
      Statut: 'Active',
    });
  };

  const filteredStations = userRole === 'manager'
    ? stations.filter(station => station._id === userStationId)
    : stations;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stations</h1>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Station
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {filteredStations.length === 0 ? (
            <p className="text-center text-gray-500">No stations found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Mise en Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    {userRole === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStations.map((station) => (
                    <tr key={station.IdStation}>
                      <td className="px-6 py-4 whitespace-nowrap">{station.IdStation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.NomStation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.AdresseStation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.VilleStation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(station.DateMiseEnService).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.Latitude}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.Longitude}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.Telephone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.Email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.HorairesOuverture || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            station.Statut === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : station.Statut === 'Inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {station.Statut}
                        </span>
                      </td>
                      {userRole === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEditStation(station)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStation(station._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && userRole === 'admin' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editingStation ? 'Edit Station' : 'Add Station'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="IdStation"
                value={formData.IdStation}
                onChange={handleInputChange}
                placeholder="Station ID"
                className="w-full p-2 border rounded"
                required
                min="1"
                disabled={!!editingStation} 
              />
              <input
                type="text"
                name="NomStation"
                value={formData.NomStation}
                onChange={handleInputChange}
                placeholder="Nom Station"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="AdresseStation"
                value={formData.AdresseStation}
                onChange={handleInputChange}
                placeholder="Adresse"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="VilleStation"
                value={formData.VilleStation}
                onChange={handleInputChange}
                placeholder="Ville"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                name="DateMiseEnService"
                value={formData.DateMiseEnService}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="Latitude"
                value={formData.Latitude}
                onChange={handleInputChange}
                placeholder="Latitude"
                className="w-full p-2 border rounded"
                step="any"
                required
              />
              <input
                type="number"
                name="Longitude"
                value={formData.Longitude}
                onChange={handleInputChange}
                placeholder="Longitude"
                className="w-full p-2 border rounded"
                step="any"
                required
              />
              <input
                type="text"
                name="Telephone"
                value={formData.Telephone}
                onChange={handleInputChange}
                placeholder="Téléphone"
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="HorairesOuverture"
                value={formData.HorairesOuverture}
                onChange={handleInputChange}
                placeholder="Horaires d'ouverture"
                className="w-full p-2 border rounded"
              />
              <select
                name="Statut"
                value={formData.Statut}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingStation(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingStation ? handleUpdateStation : handleAddStation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingStation ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
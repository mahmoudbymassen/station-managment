// src/pages/Employees.jsx
import React, { useState, useEffect } from 'react';

const Employees = ({ userRole, userStationId, onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    CINEmploye: '',
    NomEmploye: '',
    PrenomEmploye: '',
    EmailEmploye: '',
    TeleEmploye: '',
    GenreEmploye: 'M',
    DateNaissanceEmploye: '',
    AdresseEmploye: '',
    NationaliteEmploye: '',
    StatutEmploye: 'Active',
    CNSS: '',
    TypeContrat: '',
    stationId: userRole === 'manager' ? userStationId : ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchStations();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5000/api/employees', {
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
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
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

  const handleAddEmployee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }
  
    const requiredFields = [
      { field: 'CINEmploye', message: 'CIN is required', check: (val) => val && val.trim() },
      { field: 'NomEmploye', message: 'Last Name is required', check: (val) => val && val.trim() },
      { field: 'PrenomEmploye', message: 'First Name is required', check: (val) => val && val.trim() },
      { field: 'EmailEmploye', message: 'Email is required', check: (val) => val && val.trim() },
      { field: 'GenreEmploye', message: 'Gender is required', check: (val) => val && ['M', 'F'].includes(val) },
      { field: 'DateNaissanceEmploye', message: 'Birth Date is required', check: (val) => val },
      { field: 'AdresseEmploye', message: 'Address is required', check: (val) => val && val.trim() },
      { field: 'NationaliteEmploye', message: 'Nationality is required', check: (val) => val && val.trim() },
      { field: 'stationId', message: 'Station is required', check: (val) => val },
      { field: 'TypeContrat', message: 'Contract Type is required', check: (val) => val && val.trim() }
    ];
  
    for (const { field, message, check } of requiredFields) {
      if (!check(formData[field])) {
        alert(message);
        return;
      }
    }
  
    if (!/^\S+@\S+\.\S+$/.test(formData.EmailEmploye)) {
      alert('Please enter a valid email address');
      return;
    }
  
    const correctedFormData = {
      ...formData,
      DateNaissanceEmploye: new Date(formData.DateNaissanceEmploye).toISOString()
    };
  
    console.log('Adding employee with data:', correctedFormData);
  
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(correctedFormData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Server error response:', errorData);
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Error adding employee'}`);
      }
  
      const newEmployee = await response.json();
      setEmployees([...employees, newEmployee]);
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee: ' + error.message);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      CINEmploye: employee.CINEmploye,
      NomEmploye: employee.NomEmploye,
      PrenomEmploye: employee.PrenomEmploye,
      EmailEmploye: employee.EmailEmploye,
      TeleEmploye: employee.TeleEmploye || '',
      GenreEmploye: employee.GenreEmploye,
      DateNaissanceEmploye: employee.DateNaissanceEmploye.split('T')[0],
      AdresseEmploye: employee.AdresseEmploye,
      NationaliteEmploye: employee.NationaliteEmploye,
      StatutEmploye: employee.StatutEmploye,
      CNSS: employee.CNSS || '',
      TypeContrat: employee.TypeContrat,
      stationId: employee.stationId?._id || employee.stationId
    });
    setShowModal(true);
  };

  const handleUpdateEmployee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/employees/${editingEmployee.IdEmploye}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'Token is not valid') {
          onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
      }

      const updatedEmployee = await response.json();
      setEmployees(employees.map(emp => 
        emp.IdEmploye === updatedEmployee.IdEmploye ? updatedEmployee : emp
      ));
      resetForm();
      setShowModal(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee: ' + error.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      onLogout();
      return;
    }
  
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        console.log('Deleting employee with IdEmploye:', id); 
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.log('Server error response:', errorData); 
          if (errorData.message === 'Token is not valid') {
            onLogout();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message}`);
        }
  
        setEmployees(employees.filter(emp => emp.IdEmploye !== id));
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      CINEmploye: '',
      NomEmploye: '',
      PrenomEmploye: '',
      EmailEmploye: '',
      TeleEmploye: '',
      GenreEmploye: 'M',
      DateNaissanceEmploye: '',
      AdresseEmploye: '',
      NationaliteEmploye: '',
      StatutEmploye: 'Active',
      CNSS: '',
      TypeContrat: '',
      stationId: userRole === 'manager' ? userStationId : ''
    });
    setEditingEmployee(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Naissance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationalité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNSS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Contrat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="px-6 py-4 text-center">No employees found</td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.IdEmploye}>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.IdEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.CINEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.NomEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.PrenomEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.EmailEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.TeleEmploye || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.GenreEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(employee.DateNaissanceEmploye).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.AdresseEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.NationaliteEmploye}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.StatutEmploye === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : employee.StatutEmploye === 'Inactive'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {employee.StatutEmploye}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.CNSS || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.TypeContrat}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.stationId?.NomStation || 'Unknown '}

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.IdEmploye)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              editingEmployee ? handleUpdateEmployee() : handleAddEmployee();
            }}>
              
              <div className="mb-4">
                <input
                  type="text"
                  name="CINEmploye"
                  value={formData.CINEmploye}
                  onChange={handleInputChange}
                  placeholder="CIN"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="NomEmploye"
                  value={formData.NomEmploye}
                  onChange={handleInputChange}
                  placeholder="Nom"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="PrenomEmploye"
                  value={formData.PrenomEmploye}
                  onChange={handleInputChange}
                  placeholder="Prénom"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="EmailEmploye"
                  value={formData.EmailEmploye}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="tel"
                  name="TeleEmploye"
                  value={formData.TeleEmploye}
                  onChange={handleInputChange}
                  placeholder="Téléphone"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <select
                  name="GenreEmploye"
                  value={formData.GenreEmploye}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div className="mb-4">
                <input
                  type="date"
                  name="DateNaissanceEmploye"
                  value={formData.DateNaissanceEmploye}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="AdresseEmploye"
                  value={formData.AdresseEmploye}
                  onChange={handleInputChange}
                  placeholder="Adresse"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="NationaliteEmploye"
                  value={formData.NationaliteEmploye}
                  onChange={handleInputChange}
                  placeholder="Nationalité"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <select
                  name="StatutEmploye"
                  value={formData.StatutEmploye}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="CNSS"
                  value={formData.CNSS}
                  onChange={handleInputChange}
                  placeholder="CNSS"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  name="TypeContrat"
                  value={formData.TypeContrat}
                  onChange={handleInputChange}
                  placeholder="Type de contrat"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <select
                  name="stationId"
                  value={formData.stationId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={userRole === 'manager'} 
                >
                  <option value="">Select a Station</option>
                  {stations.map(station => (
                    <option key={station._id} value={station._id}>
                      {station.NomStation} (ID: {station.IdStation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {editingEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
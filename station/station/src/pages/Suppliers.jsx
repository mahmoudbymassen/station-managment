import React, { useState, useEffect } from 'react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    NomFournisseur: '',
    AdresseFournisseur: '',
    TelephoneFournisseur: '',
    EmailFournisseur: '',
    VilleFournisseur: '',
    ContactFournisseur: '',
    Statut: 'Active'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/suppliers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched suppliers:', data);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSupplier = async () => {
    const requiredFields = [
      'NomFournisseur',
      'AdresseFournisseur',
      'TelephoneFournisseur',
      'EmailFournisseur',
      'VilleFournisseur',
      'ContactFournisseur',
      'Statut'
    ];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }

    console.log('Form data being sent:', formData);
    try {
      const response = await fetch('http://localhost:5000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        await fetchSuppliers();
        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert('Failed to add supplier: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('An error occurred while adding the supplier: ' + error.message);
    }
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      NomFournisseur: supplier.NomFournisseur,
      AdresseFournisseur: supplier.AdresseFournisseur,
      TelephoneFournisseur: supplier.TelephoneFournisseur,
      EmailFournisseur: supplier.EmailFournisseur,
      VilleFournisseur: supplier.VilleFournisseur,
      ContactFournisseur: supplier.ContactFournisseur,
      Statut: supplier.Statut
    });
    setShowModal(true);
  };

  const handleUpdateSupplier = async () => {
    const requiredFields = [
      'NomFournisseur',
      'AdresseFournisseur',
      'TelephoneFournisseur',
      'EmailFournisseur',
      'VilleFournisseur',
      'ContactFournisseur',
      'Statut'
    ];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/suppliers/${editingSupplier.IdFournisseur}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        await fetchSuppliers();
        resetForm();
        setShowModal(false);
        setEditingSupplier(null);
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert('Failed to update supplier: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('An error occurred while updating the supplier: ' + error.message);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!id) {
      console.error('Attempted to delete supplier with undefined ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchSuppliers();
        } else {
          console.error('Delete failed with status:', response.status);
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      NomFournisseur: '',
      AdresseFournisseur: '',
      TelephoneFournisseur: '',
      EmailFournisseur: '',
      VilleFournisseur: '',
      ContactFournisseur: '',
      Statut: 'Active'
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">No suppliers found</td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.IdFournisseur}>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.IdFournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.NomFournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.ContactFournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.EmailFournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.TelephoneFournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.VilleFournisseur}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            supplier.Statut === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {supplier.Statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditSupplier(supplier)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.IdFournisseur)}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="NomFournisseur"
                value={formData.NomFournisseur}
                onChange={handleInputChange}
                placeholder="Nom Fournisseur"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="AdresseFournisseur"
                value={formData.AdresseFournisseur}
                onChange={handleInputChange}
                placeholder="Adresse"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="TelephoneFournisseur"
                value={formData.TelephoneFournisseur}
                onChange={handleInputChange}
                placeholder="Téléphone"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="EmailFournisseur"
                value={formData.EmailFournisseur}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="VilleFournisseur"
                value={formData.VilleFournisseur}
                onChange={handleInputChange}
                placeholder="Ville"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="ContactFournisseur"
                value={formData.ContactFournisseur}
                onChange={handleInputChange}
                placeholder="Contact"
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="Statut"
                value={formData.Statut}
                onChange={handleInputChange}
                className="w-full p-2 border rounded col-span-2"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingSupplier ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
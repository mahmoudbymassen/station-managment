import React, { useState, useEffect } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    IdProduit: '',
    NomProduit: '',
    Type: '',
    Date_ajout: '',
    Unite: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched products:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    const requiredFields = [
      { field: 'IdProduit', message: 'Product ID is required and must be a number', check: (val) => val && !isNaN(val) },
      { field: 'NomProduit', message: 'Product Name is required', check: (val) => val && val.trim() },
      { field: 'Type', message: 'Type is required', check: (val) => val && val.trim() },
      { field: 'Date_ajout', message: 'Date Added is required', check: (val) => val },
      { field: 'Unite', message: 'Unit is required', check: (val) => val && val.trim() }
    ];

    for (const { field, message, check } of requiredFields) {
      if (!check(formData[field])) {
        console.error('Validation failed:', message);
        alert(message);
        return;
      }
    }

    console.log('Form data being sent:', formData);
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        await fetchProducts();
        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert('Failed to add product: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('An error occurred while adding the product: ' + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      IdProduit: product.IdProduit,
      NomProduit: product.NomProduit,
      Type: product.Type,
      Date_ajout: product.Date_ajout.split('T')[0],
      Unite: product.Unite
    });
    setShowModal(true);
  };

  const handleUpdateProduct = async () => {
    const requiredFields = [
      { field: 'NomProduit', message: 'Product Name is required', check: (val) => val && val.trim() },
      { field: 'Type', message: 'Type is required', check: (val) => val && val.trim() },
      { field: 'Date_ajout', message: 'Date Added is required', check: (val) => val },
      { field: 'Unite', message: 'Unit is required', check: (val) => val && val.trim() }
    ];

    for (const { field, message, check } of requiredFields) {
      if (!check(formData[field])) {
        console.error('Validation failed:', message);
        alert(message);
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${editingProduct.IdProduit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        await fetchProducts();
        resetForm();
        setShowModal(false);
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        alert('Failed to update product: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred while updating the product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!id) {
      console.error('Attempted to delete product with undefined ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await fetchProducts();
        } else {
          const errorData = await response.json();
          console.error('Delete failed with status:', response.status, errorData);
          alert('Failed to delete product: ' + (errorData.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while deleting the product: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      IdProduit: '',
      NomProduit: '',
      Type: '',
      Date_ajout: '',
      Unite: ''
    });
  };

  console.log('Rendering Products component with products:', products);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Product
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Ajout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">No products found</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.IdProduit}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.IdProduit}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.NomProduit}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.Type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(product.Date_ajout).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.Unite}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.IdProduit)}
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
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <div className="space-y-4">
              <input
                type="number"
                name="IdProduit"
                value={formData.IdProduit}
                onChange={handleInputChange}
                placeholder="Product ID"
                className="w-full p-2 border rounded"
                required
                disabled={editingProduct} 
              />
              <input
                type="text"
                name="NomProduit"
                value={formData.NomProduit}
                onChange={handleInputChange}
                placeholder="Nom Produit"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="Type"
                value={formData.Type}
                onChange={handleInputChange}
                placeholder="Type"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                name="Date_ajout"
                value={formData.Date_ajout}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="Unite"
                value={formData.Unite}
                onChange={handleInputChange}
                placeholder="Unité"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editingProduct ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
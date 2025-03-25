import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import Employees from './pages/Employees';
import Products from './pages/Products';
import Tanks from './pages/Tanks';
import Pumps from './pages/Pumps';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Attendance from './pages/Attendance';
import StockManagement from './pages/StockManagement';
import OtherServices from './pages/OtherServices';
import Managers from './pages/Managers';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userStationId, setUserStationId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        
        const decoded = JSON.parse(jsonPayload);
        setIsAuthenticated(true);
        setUserRole(decoded.role);
        setUserStationId(decoded.stationId);
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserStationId(null);
      }
    }
  }, []);

  const PrivateRoute = ({ element, ...rest }) => {
    return isAuthenticated ? (
      React.cloneElement(element, { userRole, userStationId, onLogout: handleLogout, ...rest })
    ) : (
      <Navigate to="/login" />
    );
  };

  const handleLogin = (role, stationId) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserStationId(stationId);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
    setIsAuthenticated(false);
    setUserRole(null);
    setUserStationId(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-100">
                <Sidebar onLogout={handleLogout} />
                <main className="flex-1 overflow-y-auto p-8">
                  <Routes>
                    <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
                    <Route path="/stations" element={<PrivateRoute element={<Stations />} />} />
                    <Route path="/employees" element={<PrivateRoute element={<Employees />} />} />
                    <Route path="/products" element={<PrivateRoute element={<Products />} />} />
                    <Route path="/tanks" element={<PrivateRoute element={<Tanks />} />} />
                    <Route path="/pumps" element={<PrivateRoute element={<Pumps />} />} />
                    <Route path="/suppliers" element={<PrivateRoute element={<Suppliers />} />} />
                    <Route path="/sales" element={<PrivateRoute element={<Sales />} />} />
                    <Route path="/attendance" element={<PrivateRoute element={<Attendance />} />} />
                    <Route path="/stock" element={<PrivateRoute element={<StockManagement />} />} />
                    <Route path="/other-services" element={<PrivateRoute element={<OtherServices />} />} />
                    <Route path="/managers" element={<PrivateRoute element={<Managers />} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
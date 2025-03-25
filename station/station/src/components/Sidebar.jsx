import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  Cylinder,
  Fuel,
  Truck,
  Receipt,
  ClipboardCheck,
  Warehouse,
  Wrench,
  LogOut,
  UserPlus,
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/stations', icon: Building2, label: 'Stations' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/tanks', icon: Cylinder, label: 'Tanks' },
    { path: '/pumps', icon: Fuel, label: 'Pumps' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers' },
    { path: '/sales', icon: Receipt, label: 'Sales' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
    { path: '/stock', icon: Warehouse, label: 'Stock Management' },
    { path: '/other-services', icon: Wrench, label: 'Services' },
    { path: '/managers', icon: UserPlus, label: 'Managers' }, 
    { path: '#', icon: LogOut, label: 'Logout', onClick: onLogout },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">GasStation</h1>
      </div>
      <nav className="mt-6 max-h-[calc(100vh-96px)] overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={item.onClick}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                isActive && !item.onClick ? 'bg-gray-100 border-r-4 border-blue-500' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Users, 
  Eye, 
  BarChart3, 
  MapPin, 
  TrendingUp, 
  Download, 
  Clock,
  LogOut,
  Plus,
  Shield
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { id: 'compliance', label: 'Compliance Master', icon: Shield, path: '/compliance' },
    { id: 'manage-users', label: 'Manage Users', icon: Users, path: '/manage-users' },
    { id: 'show-users', label: 'Show All Users', icon: Eye, path: '/show-users' },
    { id: 'progress', label: 'Progress Overview', icon: TrendingUp, path: '/progress' },
    { id: 'locations', label: 'Add Work Location', icon: MapPin, path: '/locations' },
    { id: 'graph', label: 'Graph', icon: BarChart3, path: '/graph' },
    { id: 'download', label: 'Download Details', icon: Download, path: '/download' },
    { id: 'future', label: 'Future Feature', icon: Clock, path: '/future' },
  ];

  const userMenuItems = [
    { id: 'initiatives', label: 'My Initiatives', icon: Shield, path: '/initiatives' },
    { id: 'progress', label: 'Progress Overview', icon: TrendingUp, path: '/progress' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
      <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {/* <Plus className="h-4 w-4" /> */}
            <span>Dashboard</span>
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
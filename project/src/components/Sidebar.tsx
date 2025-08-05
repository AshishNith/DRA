import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { doSignOut } from '../auth/auth';
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
  Menu,
  X,
  Shield
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenuItems = [
    { id: 'compliance', label: 'Compliance Master', icon: Shield, path: '/compliance' },
    { id: 'manage-users', label: 'Manage Users', icon: Users, path: '/manage-users' },
    // { id: 'show-users', label: 'Show All Users', icon: Eye, path: '/show-users' },
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

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate('/login');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-teal-500 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 z-40
        w-64 bg-white shadow-lg h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* User Profile Section */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm lg:text-base truncate">{user?.email?.split('@')[0] || 'User'}</h3>
              <p className="text-xs lg:text-sm text-gray-500 truncate">{isAdmin ? 'Admin' : 'User'}</p>
            </div>
          </div>
        
          {isAdmin && (
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 lg:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm lg:text-base"
            >
              <span>Dashboard</span>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          <ul className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors duration-200 text-sm lg:text-base ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-3 lg:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm lg:text-base"
          >
            <LogOut className="h-4 w-4 lg:h-4 lg:w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
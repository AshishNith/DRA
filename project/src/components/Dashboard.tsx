import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Shield, Building2, TrendingUp, Calendar, Bell, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Layout from './Layout';
import DashboardOverview from './DashboardOverview';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleSectionChange = (section: string) => {
    navigate(`/${section}`);
  };

  const quickStats = [
    {
      title: "Total Projects",
      value: "24",
      change: "+12%",
      icon: Building2,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Users",
      value: "156",
      change: "+8%",
      icon: Users,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Compliance Score",
      value: "94%",
      change: "+2%",
      icon: Shield,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Monthly Growth",
      value: "18.2%",
      change: "+5%",
      icon: TrendingUp,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Layout title="Dashboard Overview">
        <div className="space-y-4 lg:space-y-6">
          {/* Welcome Header */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-12 lg:-translate-y-16 translate-x-12 lg:translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-tr from-green-100 to-teal-100 rounded-full -translate-x-8 lg:-translate-x-12 translate-y-8 lg:translate-y-12 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
                </h1>
                <p className="text-gray-600 text-base lg:text-lg">
                  Here's what's happening with your projects today.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span className="sm:hidden">{currentTime.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 lg:space-x-4">
                <button className="relative p-2 lg:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg lg:rounded-xl transition-colors duration-200">
                  <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm lg:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${stat.lightColor} group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className={`w-4 h-4 lg:w-6 lg:h-6 ${stat.textColor}`} />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {[
                { 
                  title: "Manage Users", 
                  description: "Add, edit, or remove user accounts",
                  action: () => handleSectionChange('manage-users'),
                  icon: Users,
                  color: "bg-blue-500",
                  lightColor: "bg-blue-50",
                  adminOnly: true
                },
                { 
                  title: "Compliance Master", 
                  description: "View and update compliance settings",
                  action: () => handleSectionChange('compliance'),
                  icon: Shield,
                  color: "bg-green-500",
                  lightColor: "bg-green-50",
                  adminOnly: true
                },
                { 
                  title: "Work Locations", 
                  description: "Manage project locations and sites",
                  action: () => handleSectionChange('locations'),
                  icon: Building2,
                  color: "bg-purple-500",
                  lightColor: "bg-purple-50",
                  adminOnly: true
                },
                { 
                  title: "Progress Overview", 
                  description: "Monitor progress across all locations",
                  action: () => handleSectionChange('progress'),
                  icon: TrendingUp,
                  color: "bg-orange-500",
                  lightColor: "bg-orange-50",
                  adminOnly: false
                }
              ].filter(action => !action.adminOnly || isAdmin).map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-4 lg:p-6 ${action.lightColor} rounded-lg lg:rounded-xl border-2 border-transparent hover:border-gray-200 transition-all duration-200 text-left group hover:shadow-md transform hover:-translate-y-1`}
                >
                  <div className="flex items-center mb-2 lg:mb-3">
                    <div className={`p-1.5 lg:p-2 ${action.color} rounded-md lg:rounded-lg mr-2 lg:mr-3 group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{action.title}</h3>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-100">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-600" />
                Dashboard Overview
              </h2>
            </div>
            <div className="p-4 lg:p-6">
              <DashboardOverview onSectionChange={handleSectionChange} />
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Dashboard;
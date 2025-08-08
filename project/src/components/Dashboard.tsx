import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Shield, Building2, TrendingUp, Calendar, Bell, Search, RefreshCw, Loader, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiService } from '../services/api';
import Layout from './Layout';
import DashboardOverview from './DashboardOverview';
import Notification from './Notification';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalInitiatives: number;
    totalLocations: number;
    totalCompliance: number;
    activeInitiatives: number;
    completedInitiatives: number;
    planningInitiatives: number;
    pendingCompliance: number;
    overdueCompliance: number;
    totalBudget: number;
    monthlyGrowth: number;
  };
  completionRates: {
    initiatives: number;
    compliance: number;
  };
  recentActivities: any[];
  locationStats: any[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDashboardStats();
      
      if (response.success && response.data) {
        setDashboardStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: string) => {
    navigate(`/${section}`);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const getQuickStats = () => {
    if (!dashboardStats) {
      return [
        { title: "Total Projects", value: "0", change: "0%", icon: Building2, color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600" },
        { title: "Active Users", value: "0", change: "0%", icon: Users, color: "bg-green-500", lightColor: "bg-green-50", textColor: "text-green-600" },
        { title: "Compliance Score", value: "0%", change: "0%", icon: Shield, color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600" },
        { title: "Monthly Growth", value: "0%", change: "0%", icon: TrendingUp, color: "bg-orange-500", lightColor: "bg-orange-50", textColor: "text-orange-600" }
      ];
    }

    const { overview, completionRates } = dashboardStats;
    
    return [
      {
        title: "Total Projects",
        value: overview.totalInitiatives.toString(),
        change: `+${Math.round(((overview.activeInitiatives / overview.totalInitiatives) * 100) || 0)}%`,
        icon: Building2,
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        textColor: "text-blue-600"
      },
      {
        title: "Active Users",
        value: overview.totalUsers.toString(),
        change: "+8%", // This would be calculated if we had historical data
        icon: Users,
        color: "bg-green-500",
        lightColor: "bg-green-50",
        textColor: "text-green-600"
      },
      {
        title: "Compliance Score",
        value: `${completionRates.compliance}%`,
        change: `+${completionRates.initiatives - completionRates.compliance}%`,
        icon: Shield,
        color: "bg-purple-500",
        lightColor: "bg-purple-50",
        textColor: "text-purple-600"
      },
      {
        title: "Monthly Growth",
        value: `${overview.monthlyGrowth}%`,
        change: "+5%", // This would be calculated from historical data
        icon: TrendingUp,
        color: "bg-orange-500",
        lightColor: "bg-orange-50",
        textColor: "text-orange-600"
      }
    ];
  };

  const NotificationPopup: React.FC = () => (
    showNotificationPopup ? (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotificationPopup(false)}
        />
        
        {/* Popup */}
        <div className="absolute top-full right-0 mt-2 z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{notificationCount} active</span>
                <button
                  onClick={() => setShowNotificationPopup(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Close notifications"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <Notification 
              className="" 
              onNotificationCountChange={(count) => {
                console.log('Notification count changed:', count);
                setNotificationCount(count);
              }}
              isPopupMode={true}
            />
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={() => setShowNotificationPopup(false)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      </>
    ) : null
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Layout title="Dashboard Overview">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Layout title="Dashboard Overview">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        </Layout>
      </div>
    );
  }

  const quickStats = getQuickStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Layout title="Dashboard Overview">
        <div className="space-y-4 lg:space-y-6">
          {/* Notification Component at the top */}
          <Notification className="mb-6" />
          
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
                  {dashboardStats && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <span>Total Budget: {formatCurrency(dashboardStats.overview.totalBudget)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 lg:space-x-4">
                <button 
                  onClick={fetchDashboardData}
                  className="relative p-2 lg:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg lg:rounded-xl transition-colors duration-200"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                </button>
                
                {/* Notification Icon with Popup */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Notification button clicked, current state:', showNotificationPopup);
                      setShowNotificationPopup(!showNotificationPopup);
                    }}
                    className="relative p-2 lg:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg lg:rounded-xl transition-colors duration-200"
                    title="View notifications"
                  >
                    <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  
                  <NotificationPopup />
                </div>
                
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
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Summary Cards */}
          {dashboardStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Initiative Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active</span>
                    <span className="font-semibold text-green-600">{dashboardStats.overview.activeInitiatives}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-blue-600">{dashboardStats.overview.completedInitiatives}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Planning</span>
                    <span className="font-semibold text-yellow-600">{dashboardStats.overview.planningInitiatives}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold">{dashboardStats.overview.totalCompliance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{dashboardStats.overview.pendingCompliance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overdue</span>
                    <span className="font-semibold text-red-600">{dashboardStats.overview.overdueCompliance}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Locations Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Locations</span>
                    <span className="font-semibold">{dashboardStats.overview.totalLocations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">With Initiatives</span>
                    <span className="font-semibold text-green-600">
                      {dashboardStats.locationStats.filter(l => l.initiativeCount > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Budget</span>
                    <span className="font-semibold text-purple-600">{formatCurrency(dashboardStats.overview.totalBudget)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MapPin, Building2, Activity, PieChart, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { User, Location, Initiative } from '../services/api';

const GraphView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, locationsData, initiativesData] = await Promise.all([
        apiService.getUsers({ limit: 1000 }),
        apiService.getLocations({ limit: 1000 }),
        apiService.getInitiatives({ limit: 1000 })
      ]);
      
      setUsers(usersData);
      setLocations(locationsData);
      setInitiatives(initiativesData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const totalLocations = locations.length;
  const activeLocations = locations.filter(location => location.isActive).length;
  const totalInitiatives = initiatives.length;
  const activeInitiatives = initiatives.filter(initiative => initiative.status === 'Active').length;
  const completedInitiatives = initiatives.filter(initiative => initiative.status === 'Completed').length;
  // const planningInitiatives = initiatives.filter(initiative => initiative.status === 'Planning').length;

  // User role distribution
  const userRoleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Initiative status distribution
  const initiativeStatusStats = initiatives.reduce((acc, initiative) => {
    acc[initiative.status] = (acc[initiative.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Initiative category distribution
  const initiativeCategoryStats = initiatives.reduce((acc, initiative) => {
    acc[initiative.category] = (acc[initiative.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Budget analysis
  const totalBudget = initiatives.reduce((sum, initiative) => sum + (initiative.budget || 0), 0);
  const avgBudget = totalInitiatives > 0 ? totalBudget / totalInitiatives : 0;

  // Location-wise initiative distribution
  const locationInitiativeStats = locations.map(location => {
    const locationInitiatives = initiatives.filter(initiative => {
      if (typeof initiative.location === 'string') {
        return initiative.location === location._id;
      }
      return (initiative.location as any)?._id === location._id;
    });
    
    return {
      name: location.name,
      initiatives: locationInitiatives.length,
      budget: locationInitiatives.reduce((sum, init) => sum + (init.budget || 0), 0),
      percentage: totalInitiatives > 0 ? (locationInitiatives.length / totalInitiatives) * 100 : 0,
      completed: locationInitiatives.filter(i => i.status === 'Completed').length,
      active: locationInitiatives.filter(i => i.status === 'Active').length
    };
  }).sort((a, b) => b.initiatives - a.initiatives);

  // Create pie chart data for user roles
  const userRolePieData = Object.entries(userRoleStats).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count,
    percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0
  }));

  // Create pie chart data for initiative status
  const initiativeStatusPieData = Object.entries(initiativeStatusStats).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: totalInitiatives > 0 ? (count / totalInitiatives) * 100 : 0
  }));

  // Registration analysis for new charts
  const applicableInitiatives = initiatives.filter(initiative => initiative.applicable === 'Yes');
  const registeredInitiatives = initiatives.filter(initiative => 
    initiative.applicable === 'Yes' && initiative.registrationInfo?.registered === 'Yes'
  );
  const notRegisteredInitiatives = initiatives.filter(initiative => 
    initiative.applicable === 'Yes' && initiative.registrationInfo?.registered === 'No'
  );

  // Registration percentage pie chart data
  const registrationPieData = [
    {
      name: 'Registered',
      value: registeredInitiatives.length,
      percentage: applicableInitiatives.length > 0 ? (registeredInitiatives.length / applicableInitiatives.length) * 100 : 0
    },
    {
      name: 'Not Registered',
      value: notRegisteredInitiatives.length,
      percentage: applicableInitiatives.length > 0 ? (notRegisteredInitiatives.length / applicableInitiatives.length) * 100 : 0
    }
  ];

  // Applicable vs Registered bar chart data
  const applicableVsRegisteredData = [
    {
      name: 'Applicable - Yes',
      value: initiatives.filter(i => i.applicable === 'Yes').length,
      color: '#10B981'
    },
    {
      name: 'Applicable - No',
      value: initiatives.filter(i => i.applicable === 'No').length,
      color: '#EF4444'
    },
    {
      name: 'Registered - Yes',
      value: initiatives.filter(i => i.registrationInfo?.registered === 'Yes').length,
      color: '#3B82F6'
    },
    {
      name: 'Registered - No',
      value: initiatives.filter(i => i.registrationInfo?.registered === 'No').length,
      color: '#F59E0B'
    }
  ];

  const maxBarValue = Math.max(...applicableVsRegisteredData.map(item => item.value));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Get detailed location data for selected location
  const getSelectedLocationData = (locationId: string) => {
    const location = locations.find(l => l._id === locationId);
    if (!location) return null;

    const locationInitiatives = initiatives.filter(initiative => {
      if (typeof initiative.location === 'string') {
        return initiative.location === locationId;
      }
      return (initiative.location as any)?._id === locationId;
    });

    // Status distribution for this location
    const statusStats = locationInitiatives.reduce((acc, initiative) => {
      acc[initiative.status] = (acc[initiative.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Category distribution for this location
    const categoryStats = locationInitiatives.reduce((acc, initiative) => {
      acc[initiative.category] = (acc[initiative.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly progress data (mock data for demonstration)
    const monthlyData = [
      { month: 'Jan', completed: Math.floor(Math.random() * 5), active: Math.floor(Math.random() * 3) },
      { month: 'Feb', completed: Math.floor(Math.random() * 5), active: Math.floor(Math.random() * 3) },
      { month: 'Mar', completed: Math.floor(Math.random() * 5), active: Math.floor(Math.random() * 3) },
      { month: 'Apr', completed: Math.floor(Math.random() * 5), active: Math.floor(Math.random() * 3) },
      { month: 'May', completed: Math.floor(Math.random() * 5), active: Math.floor(Math.random() * 3) },
      { month: 'Jun', completed: Math.floor(Math.random() * 5), active: Math.floor(Math.random() * 3) },
    ];

    // Calculate Applicable vs Registered data for this location
    const locationApplicableVsRegisteredData = [
      {
        name: 'Applicable - Yes',
        value: locationInitiatives.filter(i => i.applicable === 'Yes').length,
        color: '#10B981'
      },
      {
        name: 'Applicable - No',
        value: locationInitiatives.filter(i => i.applicable === 'No').length,
        color: '#EF4444'
      },
      {
        name: 'Registered - Yes',
        value: locationInitiatives.filter(i => i.registrationInfo?.registered === 'Yes').length,
        color: '#3B82F6'
      },
      {
        name: 'Registered - No',
        value: locationInitiatives.filter(i => i.registrationInfo?.registered === 'No').length,
        color: '#F59E0B'
      }
    ];

    const locationMaxBarValue = Math.max(...locationApplicableVsRegisteredData.map(item => item.value));

    return {
      location,
      initiatives: locationInitiatives,
      statusStats,
      categoryStats,
      monthlyData,
      totalBudget: locationInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0),
      avgBudget: locationInitiatives.length > 0 ? locationInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0) / locationInitiatives.length : 0,
      applicableVsRegisteredData: locationApplicableVsRegisteredData,
      maxBarValue: locationMaxBarValue
    };
  };

  // If a location is selected, show detailed view
  if (selectedLocationId) {
    const locationData = getSelectedLocationData(selectedLocationId);
    
    if (!locationData) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Location not found</div>
          <button onClick={() => setSelectedLocationId(null)} className="btn-primary">
            Back to Overview
          </button>
        </div>
      );
    }

    const statusPieData = Object.entries(locationData.statusStats).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: locationData.initiatives.length > 0 ? (count / locationData.initiatives.length) * 100 : 0
    }));

    const categoryPieData = Object.entries(locationData.categoryStats).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: locationData.initiatives.length > 0 ? (count / locationData.initiatives.length) * 100 : 0
    }));

    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedLocationId(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">{locationData.location.name} Analytics</h1>
                <p className="text-teal-100 mt-1">Detailed performance metrics and insights</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{locationData.initiatives.length}</div>
              <div className="text-teal-100">Total Initiatives</div>
            </div>
          </div>
        </div>

        {/* Summary Cards for Selected Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Initiatives</p>
                <p className="text-2xl font-bold text-gray-900">{locationData.initiatives.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {locationData.initiatives.filter(i => i.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-orange-600">
                  {locationData.initiatives.filter(i => i.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-purple-600">₹{(locationData.totalBudget / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts for Selected Location */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Initiative Status Distribution</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {statusPieData.map((item, index) => {
                    const offset = statusPieData.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
                    const circumference = 2 * Math.PI * 45;
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((offset / 100) * circumference);
                    
                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke={colors[index % colors.length]}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{locationData.initiatives.length}</div>
                    <div className="text-sm text-gray-600">Initiatives</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {statusPieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value} ({item.percentage.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Initiative Categories</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {categoryPieData.map((item, index) => {
                    const offset = categoryPieData.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
                    const circumference = 2 * Math.PI * 45;
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((offset / 100) * circumference);
                    
                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke={colors[index % colors.length]}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{Object.keys(locationData.categoryStats).length}</div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {categoryPieData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value} ({item.percentage.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applicable vs Registered Bar Chart for Location */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Applicable vs Registered (Yes/No) - {locationData.location.name}
          </h3>
          <div className="space-y-4">
            {locationData.applicableVsRegisteredData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${locationData.maxBarValue > 0 ? (item.value / locationData.maxBarValue) * 100 : 0}%`,
                      backgroundColor: item.color,
                      minWidth: item.value > 0 ? '20px' : '0px'
                    }}
                  >
                    {item.value > 0 && (
                      <span className="text-xs font-medium text-white">{item.value}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {locationData.applicableVsRegisteredData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-medium text-green-700">Applicable Rate</div>
                <div className="text-lg font-bold text-green-600">
                  {locationData.initiatives.length > 0 
                    ? Math.round((locationData.applicableVsRegisteredData[0].value / locationData.initiatives.length) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-green-600">
                  {locationData.applicableVsRegisteredData[0].value} out of {locationData.initiatives.length} initiatives
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-blue-700">Registration Rate</div>
                <div className="text-lg font-bold text-blue-600">
                  {locationData.applicableVsRegisteredData[0].value > 0 
                    ? Math.round((locationData.applicableVsRegisteredData[2].value / locationData.applicableVsRegisteredData[0].value) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-blue-600">
                  {locationData.applicableVsRegisteredData[2].value} out of {locationData.applicableVsRegisteredData[0].value} applicable
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-xs text-green-600">{activeUsers} active</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900">{totalLocations}</p>
              <p className="text-xs text-green-600">{activeLocations} active</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Initiatives</p>
              <p className="text-2xl font-bold text-gray-900">{totalInitiatives}</p>
              <p className="text-xs text-blue-600">{activeInitiatives} active</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{(totalBudget / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-600">Avg: ₹{(avgBudget / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Roles Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            User Distribution by Role
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {userRolePieData.map((item, index) => {
                  const offset = userRolePieData.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
                  const circumference = 2 * Math.PI * 45;
                  const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);
                  
                  return (
                    <circle
                      key={item.name}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={colors[index % colors.length]}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {userRolePieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">{item.value} ({item.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Initiative Status Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Initiative Status Distribution
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {initiativeStatusPieData.map((item, index) => {
                  const offset = initiativeStatusPieData.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
                  const circumference = 2 * Math.PI * 45;
                  const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);
                  
                  return (
                    <circle
                      key={item.name}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={colors[index % colors.length]}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{totalInitiatives}</div>
                  <div className="text-sm text-gray-600">Total Initiatives</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {initiativeStatusPieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">{item.value} ({item.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Registration Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Registration % out of Applicable Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Registration % out of Applicable
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {registrationPieData.map((item, index) => {
                  const offset = registrationPieData.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0);
                  const circumference = 2 * Math.PI * 45;
                  const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);
                  
                  return (
                    <circle
                      key={item.name}
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={item.name === 'Registered' ? '#3B82F6' : '#EF4444'}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{applicableInitiatives.length}</div>
                  <div className="text-sm text-gray-600">Applicable</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {registrationPieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.name === 'Registered' ? '#3B82F6' : '#EF4444' }}
                  ></div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-600">{item.value} ({item.percentage.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applicable vs Registered Bar Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Applicable vs Registered (Yes/No)
          </h3>
          <div className="space-y-4">
            {applicableVsRegisteredData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${maxBarValue > 0 ? (item.value / maxBarValue) * 100 : 0}%`,
                      backgroundColor: item.color,
                      minWidth: item.value > 0 ? '20px' : '0px'
                    }}
                  >
                    {item.value > 0 && (
                      <span className="text-xs font-medium text-white">{item.value}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {applicableVsRegisteredData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Location-wise Initiative Distribution Bar Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Initiative Distribution by Location</h3>
        <div className="space-y-4">
          {locationInitiativeStats.slice(0, 10).map((location, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{location.name}</span>
                <div className="text-right">
                  <span className="text-sm text-gray-900 font-medium">{location.initiatives} initiatives</span>
                  <div className="text-xs text-gray-500">₹{(location.budget / 100000).toFixed(1)}L budget</div>
                </div>
              </div>
              <div 
                className="w-full bg-gray-200 rounded-full h-3 cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => {
                  const locationObj = locations.find(l => l.name === location.name);
                  if (locationObj) setSelectedLocationId(locationObj._id!);
                }}
                title={`Click to view detailed analytics for ${location.name}`}
              >
                <div
                  className="bg-gradient-to-r from-teal-500 to-blue-600 h-3 rounded-full transition-all duration-500 hover:from-teal-600 hover:to-blue-700"
                  style={{ width: `${Math.max(location.percentage, 2)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{location.percentage.toFixed(1)}% of total initiatives</span>
                <span>Completed: {location.completed} | Active: {location.active}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Locations</h3>
          <div className="space-y-3">
            {locationInitiativeStats
              .filter(location => location.initiatives > 0)
              .slice(0, 5)
              .map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-teal-600">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{location.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{location.initiatives} initiatives</div>
                    <div className="text-xs text-gray-500">₹{(location.budget / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Overall Completion Rate</span>
              <span className="font-semibold text-green-600">
                {totalInitiatives > 0 ? Math.round((completedInitiatives / totalInitiatives) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Initiatives Rate</span>
              <span className="font-semibold text-blue-600">
                {totalInitiatives > 0 ? Math.round((activeInitiatives / totalInitiatives) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg Initiatives per Location</span>
              <span className="font-semibold text-purple-600">
                {totalLocations > 0 ? Math.round(totalInitiatives / totalLocations) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Budget Allocation</span>
              <span className="font-semibold text-orange-600">
                ₹{(totalBudget / 10000000).toFixed(1)}Cr
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Locations Rate</span>
              <span className="font-semibold text-teal-600">
                {totalLocations > 0 ? Math.round((activeLocations / totalLocations) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Initiative Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(initiativeCategoryStats).map(([category, count]) => (
            <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{category}</div>
              <div className="text-xs text-gray-500 mt-1">
                {totalInitiatives > 0 ? Math.round((count / totalInitiatives) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphView;
import React from 'react';
import { BarChart3, TrendingUp, Users, MapPin } from 'lucide-react';
import { mockWorkLocations, mockUsers } from '../data/mockData';

const GraphView: React.FC = () => {
  const totalEmployees = mockWorkLocations.reduce((sum, location) => sum + location.employeeCount, 0);
  const totalLocations = mockWorkLocations.length;
  const totalUsers = mockUsers.length;

  const locationData = mockWorkLocations.map(location => ({
    name: location.name,
    employees: location.employeeCount,
    percentage: (location.employeeCount / totalEmployees) * 100,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Work Locations</p>
              <p className="text-2xl font-bold text-gray-900">{totalLocations}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">System Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Distribution Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Employee Distribution by Location</h3>
        <div className="space-y-4">
          {locationData.map((location, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{location.name}</span>
                <span className="text-sm text-gray-500">{location.employees} employees</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${location.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">{location.percentage.toFixed(1)}% of total workforce</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations by Size</h3>
          <div className="space-y-3">
            {locationData
              .sort((a, b) => b.employees - a.employees)
              .slice(0, 5)
              .map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{location.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{location.employees} employees</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">Average employees per location</span>
              <span className="font-semibold text-green-600">
                {Math.round(totalEmployees / totalLocations)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">Largest location</span>
              <span className="font-semibold text-blue-600">
                {Math.max(...locationData.map(l => l.employees))} employees
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">Smallest location</span>
              <span className="font-semibold text-purple-600">
                {Math.min(...locationData.map(l => l.employees))} employees
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphView;
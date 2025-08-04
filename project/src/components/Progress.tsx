import React, { useState } from 'react';
import { ArrowLeft, Search, MapPin, CheckCircle, XCircle, Clock, Calendar, User, Eye, Filter } from 'lucide-react';

interface Initiative {
  id: number;
  title: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  agency: string;
  dueDate: string;
  assignedTo: string;
  typeOfPermission: string;
  licenseNumber: string;
  validity: string;
  quantity: string;
  remarks: string;
}

interface LocationInfo {
  applicable: number;
  registered: number;
  initiatives: Initiative[];
}

interface LocationData {
  [key: string]: LocationInfo;
}

const Progress: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for locations and their initiatives
  const locationData: LocationData = {
    'LEH-Airport': {
      applicable: 8,
      registered: 6,
      initiatives: [
        {
          id: 1,
          title: 'Environmental Clearance',
          description: 'Obtaining environmental clearance for airport construction',
          status: 'approved',
          agency: 'Ministry of Environment',
          dueDate: '2024-03-15',
          assignedTo: 'John Doe',
          typeOfPermission: 'Environmental Permit',
          licenseNumber: 'ENV/2024/001',
          validity: '2025-03-15',
          quantity: '1',
          remarks: 'Approved with conditions'
        },
        {
          id: 2,
          title: 'Construction License',
          description: 'License for airport infrastructure construction',
          status: 'pending',
          agency: 'State Government',
          dueDate: '2024-04-01',
          assignedTo: 'Jane Smith',
          typeOfPermission: 'Construction License',
          licenseNumber: 'CONST/2024/002',
          validity: '2026-04-01',
          quantity: '1',
          remarks: 'Under review'
        }
      ]
    },
    'DND - PKG 1': {
      applicable: 12,
      registered: 10,
      initiatives: [
        {
          id: 3,
          title: 'Land Acquisition',
          description: 'Acquiring land for DND package 1 development',
          status: 'approved',
          agency: 'Land Revenue Department',
          dueDate: '2024-02-28',
          assignedTo: 'Mike Johnson',
          typeOfPermission: 'Land Permit',
          licenseNumber: 'LAND/2024/003',
          validity: '2030-02-28',
          quantity: '50 acres',
          remarks: 'All documents verified'
        }
      ]
    },
    'GUJARAT BULLET TRAIN': {
      applicable: 30,
      registered: 28,
      initiatives: [
        {
          id: 4,
          title: 'Railway Safety Clearance',
          description: 'Safety clearance for bullet train operations',
          status: 'approved',
          agency: 'Railway Safety Commissioner',
          dueDate: '2024-05-01',
          assignedTo: 'Raj Patel',
          typeOfPermission: 'Safety Permit',
          licenseNumber: 'RAIL/2024/004',
          validity: '2029-05-01',
          quantity: '1',
          remarks: 'Comprehensive safety audit completed'
        },
        {
          id: 5,
          title: 'Environmental Impact Assessment',
          description: 'EIA for bullet train corridor',
          status: 'pending',
          agency: 'Ministry of Environment',
          dueDate: '2024-06-15',
          assignedTo: 'Priya Sharma',
          typeOfPermission: 'Environmental Permit',
          licenseNumber: 'EIA/2024/005',
          validity: '2025-06-15',
          quantity: '1',
          remarks: 'Public hearing scheduled'
        }
      ]
    }
  };

  const allLocations = Object.keys(locationData);
  const filteredLocations = allLocations.filter(location =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressPercentage = (location: string): number => {
    const data = locationData[location];
    if (!data || data.applicable === 0) return 0;
    return Math.round((data.registered / data.applicable) * 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: Initiative['status']): JSX.Element => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Initiative['status']): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredInitiatives = selectedLocation ? 
    (locationData[selectedLocation]?.initiatives || []).filter(initiative => {
      const matchesSearch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           initiative.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || initiative.status === filterStatus;
      return matchesSearch && matchesFilter;
    }) : [];

  if (selectedLocation) {
    const locationInfo = locationData[selectedLocation];
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedLocation('')}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">{selectedLocation}</h1>
                <p className="text-blue-100 mt-1">Initiative Details & Progress</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{getProgressPercentage(selectedLocation)}%</div>
              <div className="text-blue-100">Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applicable</p>
                <p className="text-3xl font-bold text-gray-900">{locationInfo.applicable}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Registered</p>
                <p className="text-3xl font-bold text-green-600">{locationInfo.registered}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{locationInfo.applicable - locationInfo.registered}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search initiatives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredInitiatives.length} of {locationInfo.initiatives.length} initiatives
              </div>
            </div>
          </div>
        </div>

        {/* ...existing initiatives list code... */}
        <div className="space-y-4">
          {filteredInitiatives.map((initiative) => (
            <div key={initiative.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* ...existing initiative card code... */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(initiative.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{initiative.title}</h3>
                      <p className="text-gray-600 mt-1">{initiative.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(initiative.status)}`}>
                    {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Agency</p>
                    <p className="text-sm font-medium text-gray-900">{initiative.agency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Permission Type</p>
                    <p className="text-sm font-medium text-gray-900">{initiative.typeOfPermission}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Number</p>
                    <p className="text-sm font-medium text-gray-900">{initiative.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Validity</p>
                    <p className="text-sm font-medium text-gray-900">{initiative.validity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {initiative.dueDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Assigned: {initiative.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Quantity: {initiative.quantity}</span>
                  </div>
                </div>

                {initiative.remarks && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Remarks</p>
                    <p className="text-sm text-gray-700">{initiative.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredInitiatives.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No initiatives found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    );
  }

  // Progress Overview (Location Grid)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">Progress Overview</h1>
        <p className="text-teal-100">Monitor progress across all work locations</p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredLocations.map((location, index) => {
          const locationInfo = locationData[location];
          if (!locationInfo) return null;
          
          const percentage = getProgressPercentage(location);
          
          return (
            <div
              key={index}
              onClick={() => setSelectedLocation(location)}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group"
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-teal-600 group-hover:scale-110 transition-transform duration-200" />
                </div>
                
                <h3 className="font-semibold text-gray-900 text-sm mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {location}
                </h3>
                
                {/* Progress Circle */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${percentage * 2.2} 220`}
                      className={getProgressColor(percentage).replace('bg-', 'text-')}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">{percentage}%</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Applicable:</span>
                    <span className="font-semibold text-gray-900">{locationInfo.applicable}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Registered:</span>
                    <span className="font-semibold text-green-600">{locationInfo.registered}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pending:</span>
                    <span className="font-semibold text-orange-600">{locationInfo.applicable - locationInfo.registered}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};

export default Progress;

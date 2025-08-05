import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, CheckCircle, XCircle, Clock, Eye, RefreshCw, Shield } from 'lucide-react';
import { apiService, Initiative, Location } from '../services/api';

// Remove the old interface imports and define local interfaces
interface Compliance {
  _id?: string;
  title: string;
  description: string;
  location: string | Location;
  category: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Inactive';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  effectiveDate: string;
  expiryDate?: string;
  documentNumber?: string;
  regulatoryBody?: string;
  requirements: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

interface LocationProgress {
  location: Location;
  initiatives: Initiative[];
  compliance: Compliance[];
  applicable: number;
  registered: number;
  percentage: number;
  complianceActive: number;
  complianceExpiring: number;
}

const Progress: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'initiatives' | 'compliance'>('initiatives');
  const [locations, setLocations] = useState<Location[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [compliance, setCompliance] = useState<Compliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch locations and initiatives from the actual API
      const [locationsData, initiativesData] = await Promise.all([
        apiService.getLocations({ limit: 1000 }),
        apiService.getInitiatives({ limit: 10000 })
      ]);

      // Handle the response format properly
      const locations = Array.isArray(locationsData) ? locationsData : [];
      const initiatives = Array.isArray(initiativesData) ? initiativesData : [];

      setLocations(locations);
      setInitiatives(initiatives);
      
      // For now, set empty compliance array since we don't have compliance API yet
      setCompliance([]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getLocationProgress = (locationId: string): LocationProgress => {
    const location = locations.find(l => l._id === locationId);
    
    // Filter initiatives for this location
    const locationInitiatives = initiatives.filter(i => {
      if (typeof i.location === 'string') {
        return i.location === locationId;
      }
      return (i.location as any)?._id === locationId;
    });
    
    // Filter compliance for this location (empty for now)
    const locationCompliance: Compliance[] = [];
    
    const applicable = locationInitiatives.length;
    const registered = locationInitiatives.filter(i => 
      i.status === 'Completed' || i.status === 'Active'
    ).length;
    
    const percentage = applicable > 0 ? Math.round((registered / applicable) * 100) : 0;

    // Compliance metrics (mock data for now)
    const complianceActive = 0;
    const complianceExpiring = 0;

    return {
      location: location!,
      initiatives: locationInitiatives,
      compliance: locationCompliance,
      applicable,
      registered,
      percentage,
      complianceActive,
      complianceExpiring
    };
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status: Initiative['status']): JSX.Element => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Active': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Planning': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Initiative['status']): string => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusIcon = (status: Compliance['status']): JSX.Element => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Expired': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getComplianceStatusColor = (status: Compliance['status']): string => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Compliance['priority']): string => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getExpiryWarning = (item: Compliance) => {
    if (!item.expiryDate) return null;
    
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { color: 'text-red-600', text: `Expired ${Math.abs(daysUntilExpiry)} days ago` };
    } else if (daysUntilExpiry <= 7) {
      return { color: 'text-red-600', text: `Expires in ${daysUntilExpiry} days` };
    } else if (daysUntilExpiry <= 30) {
      return { color: 'text-orange-600', text: `Expires in ${daysUntilExpiry} days` };
    }
    return null;
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.city && location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={fetchData} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (selectedLocation) {
    const locationProgress = getLocationProgress(selectedLocation);
    
    if (!locationProgress.location) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Location not found</div>
          <button onClick={() => setSelectedLocation('')} className="btn-primary">
            Back to Overview
          </button>
        </div>
      );
    }

    const filteredInitiatives = locationProgress.initiatives.filter(initiative => {
      const matchesSearch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           initiative.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || initiative.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const filteredCompliance = locationProgress.compliance.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.regulatoryBody && item.regulatoryBody.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

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
                <h1 className="text-3xl font-bold">{locationProgress.location.name}</h1>
                <p className="text-blue-100 mt-1">
                  {locationProgress.location.city && locationProgress.location.state && 
                    `${locationProgress.location.city}, ${locationProgress.location.state}`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{locationProgress.percentage}%</div>
              <div className="text-blue-100">Initiative Progress</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Initiatives</p>
                <p className="text-3xl font-bold text-gray-900">{locationProgress.applicable}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed/Active</p>
                <p className="text-3xl font-bold text-green-600">{locationProgress.registered}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Planning/On Hold</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {locationProgress.initiatives.filter(i => i.status === 'Planning' || i.status === 'On Hold').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Budget</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{locationProgress.initiatives.reduce((sum, i) => sum + i.budget, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Initiative Details */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Initiatives ({locationProgress.initiatives.length})
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search initiatives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredInitiatives.length > 0 ? (
              <div className="space-y-4">
                {filteredInitiatives.map((initiative) => (
                  <div key={initiative._id} className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                          {initiative.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Category</p>
                          <p className="text-sm font-medium text-gray-900">{initiative.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Budget</p>
                          <p className="text-sm font-medium text-gray-900">₹{initiative.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Participants</p>
                          <p className="text-sm font-medium text-gray-900">{initiative.participants}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Start Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(initiative.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {initiative.endDate && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">End Date: {new Date(initiative.endDate).toLocaleDateString()}</p>
                        </div>
                      )}

                      {initiative.contactPerson && initiative.contactPerson.name && (
                        <div className="mt-4 p-3 bg-white rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                          <p className="text-sm font-medium text-gray-900">{initiative.contactPerson.name}</p>
                          {initiative.contactPerson.email && (
                            <p className="text-sm text-gray-600">{initiative.contactPerson.email}</p>
                          )}
                          {initiative.contactPerson.phone && (
                            <p className="text-sm text-gray-600">{initiative.contactPerson.phone}</p>
                          )}
                        </div>
                      )}

                      {/* Registration Info */}
                      {initiative.registrationInfo && initiative.registrationInfo.registered === 'Yes' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-600 mb-2 font-medium">Registration Information</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {initiative.registrationInfo.licenseNumber && (
                              <div>
                                <span className="text-gray-600">License: </span>
                                <span className="font-medium">{initiative.registrationInfo.licenseNumber}</span>
                              </div>
                            )}
                            {initiative.registrationInfo.validity && (
                              <div>
                                <span className="text-gray-600">Valid Until: </span>
                                <span className="font-medium">{new Date(initiative.registrationInfo.validity).toLocaleDateString()}</span>
                              </div>
                            )}
                            {initiative.registrationInfo.quantity && (
                              <div>
                                <span className="text-gray-600">Quantity: </span>
                                <span className="font-medium">{initiative.registrationInfo.quantity}</span>
                              </div>
                            )}
                          </div>
                          {initiative.registrationInfo.remarks && (
                            <p className="text-sm text-gray-600 mt-2">{initiative.registrationInfo.remarks}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No initiatives found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search terms or filters' 
                    : 'No initiatives have been added to this location yet'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Progress Overview (Location Grid)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Progress Overview</h1>
            <p className="text-teal-100">Monitor progress across all work locations</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{locations.length}</div>
            <div className="text-sm text-teal-100">Total Locations</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{initiatives.length}</div>
            <div className="text-sm text-teal-100">Total Initiatives</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {initiatives.filter(i => i.status === 'Active').length}
            </div>
            <div className="text-sm text-teal-100">Active Initiatives</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {initiatives.filter(i => i.status === 'Completed').length}
            </div>
            <div className="text-sm text-teal-100">Completed</div>
          </div>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => {
          const progress = getLocationProgress(location._id!);
          
          return (
            <div
              key={location._id}
              onClick={() => setSelectedLocation(location._id!)}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group"
            >
              <div className="space-y-4">
                {/* Location Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                      <MapPin className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {location.city && location.state ? `${location.city}, ${location.state}` : 'Location'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Badge */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    progress.percentage >= 80 ? 'bg-green-100 text-green-800' :
                    progress.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {progress.percentage}%
                  </div>
                </div>

                {/* Location Details */}
                {location.address && (
                  <div className="text-sm text-gray-600">
                    <p className="truncate">{location.address}</p>
                    {location.zipCode && (
                      <p className="text-xs text-gray-500 mt-1">ZIP: {location.zipCode}</p>
                    )}
                  </div>
                )}

                {/* Work Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Initiatives Overview</span>
                    <span className="text-xs text-gray-500">Click to view details</span>
                  </div>
                  
                  {progress.applicable > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total: {progress.applicable}</span>
                        <span className="text-sm font-medium text-gray-900">
                          Active/Completed: {progress.registered}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Completed: {progress.initiatives.filter(i => i.status === 'Completed').length}</span>
                          <span className="text-blue-600">Active: {progress.initiatives.filter(i => i.status === 'Active').length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.percentage)}`}
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No initiatives assigned yet</div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-600">{progress.applicable}</div>
                    <div className="text-xs text-blue-600">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-600">{progress.registered}</div>
                    <div className="text-xs text-green-600">Active/Done</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-purple-600">
                      ₹{Math.round(progress.initiatives.reduce((sum, i) => sum + i.budget, 0) / 100000)}L
                    </div>
                    <div className="text-xs text-purple-600">Budget</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'No locations available yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Progress;

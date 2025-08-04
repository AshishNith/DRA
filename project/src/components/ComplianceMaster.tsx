import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, User, CheckCircle, XCircle, Clock, Search, MapPin, ArrowLeft, Save, X, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import { apiService, Initiative, Location } from '../services/api';

const ComplianceMaster: React.FC = () => {
  // State management
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Initiative | null>(null);
  const [showWorkLocations, setShowWorkLocations] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [showLocationDataForm, setShowLocationDataForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Add missing formData state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    dueDate: '',
    assignedTo: ''
  });

  // Location data form state
  const [locationFormData, setLocationFormData] = useState({
    title: '',
    description: '',
    category: 'Environmental',
    status: 'Planning',
    startDate: '',
    endDate: '',
    budget: 0,
    participants: 0,
    typeOfPermission: '',
    agency: '',
    applicable: 'No',
    registrationInfo: {
      registered: 'No',
      licenseNumber: '',
      validity: '',
      quantity: '',
      remarks: ''
    },
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    }
  });

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [initiativesData, locationsData] = await Promise.all([
        apiService.getInitiatives(),
        apiService.getLocations()
      ]);
      
      setInitiatives(Array.isArray(initiativesData) ? initiativesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchLocation.toLowerCase()) && location.isActive
  );

  const handleAddLocation = async () => {
    if (newLocationName.trim() && !locations.some(loc => loc.name === newLocationName.trim())) {
      try {
        setSubmitting(true);
        const newLocation = await apiService.createLocation({
          name: newLocationName.trim(),
          isActive: true
        });
        setLocations([...locations, newLocation]);
        setNewLocationName('');
        setShowAddLocationForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add location');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteLocation = async (locationToDelete: Location) => {
    if (window.confirm(`Are you sure you want to delete "${locationToDelete.name}" location?`)) {
      try {
        setSubmitting(true);
        await apiService.deleteLocation(locationToDelete._id!);
        setLocations(locations.filter(location => location._id !== locationToDelete._id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete location');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationDataForm(true);
    setCurrentStep(1);
    setLocationFormData({
      title: '',
      description: '',
      category: 'Environmental',
      status: 'Planning',
      startDate: '',
      endDate: '',
      budget: 0,
      participants: 0,
      typeOfPermission: '',
      agency: '',
      applicable: 'No',
      registrationInfo: {
        registered: 'No',
        licenseNumber: '',
        validity: '',
        quantity: '',
        remarks: ''
      },
      contactPerson: {
        name: '',
        email: '',
        phone: ''
      }
    });
  };

  const handleLocationFormSubmit = async () => {
    if (!selectedLocation) return;

    try {
      setSubmitting(true);
      
      // Ensure all required fields are properly formatted
      const initiativeData: Omit<Initiative, '_id'> = {
        title: locationFormData.title.trim(),
        description: locationFormData.description,
        location: selectedLocation._id!,
        category: locationFormData.category || 'Environmental',
        status: locationFormData.status || 'Planning',
        startDate: locationFormData.startDate || new Date().toISOString().split('T')[0],
        endDate: locationFormData.endDate || '',
        budget: Number(locationFormData.budget) || 0,
        participants: Number(locationFormData.participants) || 0,
        typeOfPermission: locationFormData.typeOfPermission || 'Not Applicable',
        agency: locationFormData.agency || 'Not Applicable',
        applicable: locationFormData.applicable || 'No',
        registrationInfo: {
          registered: locationFormData.registrationInfo.registered || 'No',
          licenseNumber: locationFormData.registrationInfo.licenseNumber || '',
          validity: locationFormData.registrationInfo.validity || '',
          quantity: locationFormData.registrationInfo.quantity || '',
          remarks: locationFormData.registrationInfo.remarks || ''
        },
        contactPerson: {
          name: locationFormData.contactPerson.name || '',
          email: locationFormData.contactPerson.email || '',
          phone: locationFormData.contactPerson.phone || ''
        },
        isActive: true
      };

      console.log('Sending initiative data:', initiativeData);

      const newInitiative = await apiService.createInitiative(initiativeData);
      
      // Create a new initiative object with populated location data
      const initiativeWithLocation = {
        ...newInitiative,
        location: selectedLocation // Set the full location object instead of just ID
      };
      
      setInitiatives([...initiatives, initiativeWithLocation]);
      setShowLocationDataForm(false);
      setCurrentStep(1);
      setSelectedLocation(null);
    } catch (err) {
      console.error('Error creating initiative:', err);
      setError(err instanceof Error ? err.message : 'Failed to save initiative data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Initiative) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status as any,
      dueDate: item.endDate || '',
      assignedTo: item.location,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this initiative?')) {
      try {
        setSubmitting(true);
        await apiService.deleteInitiative(id);
        setInitiatives(initiatives.filter(item => item._id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete initiative');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'pending', dueDate: '', assignedTo: '' });
    setEditingItem(null);
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'inactive';
  };

  // Location Data Form Component
  const LocationDataForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowLocationDataForm(false)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Work Locations</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Add {selectedLocation?.name} Data</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          {/* Progress Sidebar */}
          <div className="w-80 bg-gray-50 p-6 border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: "Initiative Details", description: "Basic information and permissions" },
                { step: 2, title: "Registration Info", description: "License and registration details" },
                { step: 3, title: "Review", description: "Review and submit data" }
              ].map((item) => {
                const status = getStepStatus(item.step);
                return (
                  <div
                    key={item.step}
                    className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                      status === 'active' 
                        ? 'bg-blue-50 border-blue-500' 
                        : status === 'completed'
                        ? 'bg-green-50 border-green-500'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        status === 'active'
                          ? 'bg-blue-500 text-white'
                          : status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : item.step}
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          status === 'active' ? 'text-blue-900' : status === 'completed' ? 'text-green-900' : 'text-gray-600'
                        }`}>
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-8">
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="text-lg font-semibold text-gray-900">{selectedLocation?.name}</div>
              </div>
            </div>

            {/* Step 1: Initiative Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Initiative Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={locationFormData.title}
                        onChange={(e) => setLocationFormData({...locationFormData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter initiative title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <select
                        value={locationFormData.description}
                        onChange={(e) => setLocationFormData({...locationFormData, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Description</option>
                        <option value="Environmental Clearance">Environmental Clearance</option>
                        <option value="Forest Clearance">Forest Clearance</option>
                        <option value="Land Acquisition">Land Acquisition</option>
                        <option value="Safety Permits">Safety Permits</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Environment">Environment</option>
                        <option value="Technology">Technology</option>
                        <option value="Community">Community</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type of Permission</label>
                      <select
                        value={locationFormData.typeOfPermission}
                        onChange={(e) => setLocationFormData({...locationFormData, typeOfPermission: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Type</option>
                        <option value="Government Approval">Government Approval</option>
                        <option value="Environmental Permit">Environmental Permit</option>
                        <option value="Construction License">Construction License</option>
                        <option value="Operational Permit">Operational Permit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Agency</label>
                      <select
                        value={locationFormData.agency}
                        onChange={(e) => setLocationFormData({...locationFormData, agency: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Agency</option>
                        <option value="Ministry of Environment">Ministry of Environment</option>
                        <option value="Forest Department">Forest Department</option>
                        <option value="Municipal Corporation">Municipal Corporation</option>
                        <option value="State Government">State Government</option>
                        <option value="Central Government">Central Government</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Applicable (Yes/No)</label>
                      <select
                        value={locationFormData.applicable}
                        onChange={(e) => setLocationFormData({...locationFormData, applicable: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!locationFormData.title || !locationFormData.description}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Registration Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Registration Info</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registered (Yes/No)</label>
                      <select
                        value={locationFormData.registrationInfo.registered}
                        onChange={(e) => setLocationFormData({
                          ...locationFormData,
                          registrationInfo: {
                            ...locationFormData.registrationInfo,
                            registered: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        type="text"
                        value={locationFormData.registrationInfo.licenseNumber}
                        onChange={(e) => setLocationFormData({
                          ...locationFormData,
                          registrationInfo: {
                            ...locationFormData.registrationInfo,
                            licenseNumber: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter license number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Validity</label>
                      <input
                        type="date"
                        value={locationFormData.registrationInfo.validity}
                        onChange={(e) => setLocationFormData({
                          ...locationFormData,
                          registrationInfo: {
                            ...locationFormData.registrationInfo,
                            validity: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity / Manpower Nos</label>
                      <input
                        type="text"
                        value={locationFormData.registrationInfo.quantity}
                        onChange={(e) => setLocationFormData({
                          ...locationFormData,
                          registrationInfo: {
                            ...locationFormData.registrationInfo,
                            quantity: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity or manpower numbers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                      <textarea
                        value={locationFormData.registrationInfo.remarks}
                        onChange={(e) => setLocationFormData({
                          ...locationFormData,
                          registrationInfo: {
                            ...locationFormData.registrationInfo,
                            remarks: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                        placeholder="Enter any additional remarks"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Review & Submit</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location:</label>
                        <p className="text-gray-900">{selectedLocation?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description:</label>
                        <p className="text-gray-900">{locationFormData.description || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Type of Permission:</label>
                        <p className="text-gray-900">{locationFormData.typeOfPermission || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Agency:</label>
                        <p className="text-gray-900">{locationFormData.agency || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Registered:</label>
                        <p className="text-gray-900">{locationFormData.registrationInfo.registered || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">License Number:</label>
                        <p className="text-gray-900">{locationFormData.registrationInfo.licenseNumber || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Validity:</label>
                        <p className="text-gray-900">{locationFormData.registrationInfo.validity || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Quantity:</label>
                        <p className="text-gray-900">{locationFormData.registrationInfo.quantity || 'Not specified'}</p>
                      </div>
                    </div>
                    {locationFormData.registrationInfo.remarks && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Remarks:</label>
                        <p className="text-gray-900">{locationFormData.registrationInfo.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleLocationFormSubmit}
                    disabled={submitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{submitting ? 'Saving...' : 'Submit Data'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (showLocationDataForm) {
    return <LocationDataForm />;
  }

  if (showWorkLocations) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWorkLocations(false)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Compliance</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Work Locations</h2>
          </div>
          <button
            onClick={() => setShowAddLocationForm(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Location</span>
          </button>
        </div>

        {/* Add Location Form */}
        {showAddLocationForm && (
          <div className="bg-white border-2 border-green-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-700">Add New Location</h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Enter location name..."
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
              />
              <button
                onClick={handleAddLocation}
                disabled={!newLocationName.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setShowAddLocationForm(false);
                  setNewLocationName('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredLocations.map((location) => (
            <div
              key={location._id}
              onClick={() => handleLocationClick(location)}
              className="bg-white border-2 border-teal-300 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-teal-400 group relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLocation(location);
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                disabled={submitting}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-teal-600 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 text-sm leading-tight pr-6">
                {location.name}
              </h3>
            </div>
          ))}
        </div>

        {filteredLocations.length === 0 && searchLocation && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
            <button
              onClick={() => {
                setNewLocationName(searchLocation);
                setShowAddLocationForm(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add "{searchLocation}" as new location
            </button>
          </div>
        )}

        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations available</h3>
            <p className="text-gray-500 mb-4">Start by adding your first work location</p>
            <button
              onClick={() => setShowAddLocationForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add First Location
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (editingItem) {
        const updateData = {
          title: formData.title,
          description: formData.description,
          status: formData.status === 'pending' ? 'Planning' : 
                  formData.status === 'approved' ? 'Active' : 'On Hold',
          endDate: formData.dueDate || '',
          location: formData.assignedTo
        };
        
        const updatedInitiative = await apiService.updateInitiative(editingItem._id!, updateData);
        
        // Find the location object for the updated initiative
        const locationObj = locations.find(loc => loc._id === formData.assignedTo);
        const initiativeWithLocation = {
          ...updatedInitiative,
          location: locationObj || formData.assignedTo // Use location object if found
        };
        
        setInitiatives(initiatives.map(item => 
          item._id === editingItem._id ? initiativeWithLocation : item
        ));
      } else {
        const newInitiativeData: Omit<Initiative, '_id'> = {
          title: formData.title,
          description: formData.description,
          location: formData.assignedTo,
          category: 'Other',
          status: formData.status === 'pending' ? 'Planning' : 
                  formData.status === 'approved' ? 'Active' : 'On Hold',
          startDate: new Date().toISOString().split('T')[0],
          endDate: formData.dueDate || '',
          budget: 0,
          participants: 0,
          contactPerson: { name: '', email: '', phone: '' },
          registrationInfo: {
            registered: 'No',
            licenseNumber: '',
            validity: '',
            quantity: '',
            remarks: ''
          },
          isActive: true
        };
        
        const newInitiative = await apiService.createInitiative(newInitiativeData);
        
        // Find the location object for the new initiative
        const locationObj = locations.find(loc => loc._id === formData.assignedTo);
        const initiativeWithLocation = {
          ...newInitiative,
          location: locationObj || formData.assignedTo // Use location object if found
        };
        
        setInitiatives([...initiatives, initiativeWithLocation]);
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving initiative:', err);
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
        <button
          onClick={loadInitialData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Compliance Master</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowWorkLocations(true)}
            className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>Work Locations</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Compliance Item</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit Compliance Item' : 'Add New Compliance Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <select
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Description</option>
                <option value="Environmental Clearance">Environmental Clearance</option>
                <option value="Forest Clearance">Forest Clearance</option>
                <option value="Land Acquisition">Land Acquisition</option>
                <option value="Safety Permits">Safety Permits</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Environment">Environment</option>
                <option value="Technology">Technology</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Location
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initiatives.map((item) => {
          // Handle both string and object location references
          const locationName = typeof item.location === 'string' 
            ? locations.find(loc => loc._id === item.location)?.name || 'Unknown'
            : item.location?.name || 'Unknown';
            
          return (
            <div key={item._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status)}
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    disabled={submitting}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id!)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  {item.endDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(item.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Location: {locationName}</span>
                </div>
                
                {/* Show additional details for initiatives with registration info */}
                {item.typeOfPermission && item.typeOfPermission !== 'Not Applicable' && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Permission Details</div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">Type: </span>
                        <span className="font-medium">{item.typeOfPermission}</span>
                      </div>
                      {item.agency && item.agency !== 'Not Applicable' && (
                        <div>
                          <span className="text-gray-600">Agency: </span>
                          <span className="font-medium">{item.agency}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Applicable: </span>
                        <span className={`font-medium ${item.applicable === 'Yes' ? 'text-green-600' : 'text-gray-600'}`}>
                          {item.applicable}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show registration info if registered */}
                {item.registrationInfo?.registered === 'Yes' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 mb-1 font-medium">Registration Status</div>
                    <div className="space-y-1 text-sm">
                      {item.registrationInfo.licenseNumber && (
                        <div>
                          <span className="text-gray-600">License: </span>
                          <span className="font-medium">{item.registrationInfo.licenseNumber}</span>
                        </div>
                      )}
                      {item.registrationInfo.validity && (
                        <div>
                          <span className="text-gray-600">Valid Until: </span>
                          <span className="font-medium">{new Date(item.registrationInfo.validity).toLocaleDateString()}</span>
                        </div>
                      )}
                      {item.registrationInfo.quantity && (
                        <div>
                          <span className="text-gray-600">Quantity: </span>
                          <span className="font-medium">{item.registrationInfo.quantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {initiatives.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance items</h3>
          <p className="text-gray-500 mb-4">Start by adding your first compliance item</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add First Item
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplianceMaster;
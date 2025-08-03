import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, User, CheckCircle, XCircle, Clock, Search, MapPin, ArrowLeft, Save, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { mockComplianceItems } from '../data/mockData';
import { ComplianceItem } from '../types';

const ComplianceMaster: React.FC = () => {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);
  const [showWorkLocations, setShowWorkLocations] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [showLocationDataForm, setShowLocationDataForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    dueDate: '',
    assignedTo: '',
  });

  // Location data form state
  const [locationFormData, setLocationFormData] = useState({
    // Step 1: Initiative Details
    description: '',
    typeOfPermission: '',
    agency: '',
    applicable: '',
    
    // Step 2: Registration Info
    registered: '',
    licenseNumber: '',
    validity: '',
    quantity: '',
    remarks: ''
  });

  // Work locations data - now as state so we can add to it
  const [workLocations, setWorkLocations] = useState([
    'LEH-Airport', 'DND - PKG 1', 'DND - PKG 2', 'BMC', 'ASSAM ROAD PROJECT',
    'AGARTALA ROAD PROJECT', 'GUJARAT BULLET TRAIN', 'RLDA-AHMD', 'GLOBAL CITY', 'CMRL-CHENNAI',
    'KHAMMAM ROAD PROJECT', 'MP JAL NIGAM', 'THANE DEPOT MUMBAI', 'PRAYAGRAJ RLY STN', 'PANIPAT TOLL PROJECT-HR',
    'PATHANGI TOLL PROJECT-TG', 'NATHAVASLA TOLL PROJECT-AP', 'NTPC PROJECT', 'NHPC PROJECT', 'OFC-H PROJECT'
  ]);

  const filteredLocations = workLocations.filter(location =>
    location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const handleAddLocation = () => {
    if (newLocationName.trim() && !workLocations.includes(newLocationName.trim())) {
      setWorkLocations([...workLocations, newLocationName.trim()]);
      setNewLocationName('');
      setShowAddLocationForm(false);
    }
  };

  const handleDeleteLocation = (locationToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete "${locationToDelete}" location?`)) {
      setWorkLocations(workLocations.filter(location => location !== locationToDelete));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setComplianceItems(items =>
        items.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      const newItem: ComplianceItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setComplianceItems([...complianceItems, newItem]);
    }
    resetForm();
  };

  const handleEdit = (item: ComplianceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status,
      dueDate: item.dueDate,
      assignedTo: item.assignedTo,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this compliance item?')) {
      setComplianceItems(items => items.filter(item => item.id !== id));
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

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location);
    setShowLocationDataForm(true);
    setCurrentStep(1);
    setLocationFormData({
      description: '',
      typeOfPermission: '',
      agency: '',
      applicable: '',
      registered: '',
      licenseNumber: '',
      validity: '',
      quantity: '',
      remarks: ''
    });
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

  const handleLocationFormSubmit = () => {
    // Handle form submission here
    console.log('Location Data:', locationFormData);
    setShowLocationDataForm(false);
    setCurrentStep(1);
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
          <h2 className="text-2xl font-bold text-gray-900">Add {selectedLocation} Data</h2>
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
                <div className="text-lg font-semibold text-gray-900">{selectedLocation}</div>
              </div>
            </div>

            {/* Step 1: Initiative Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Initiative Title & Description</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <select
                        value={locationFormData.description}
                        onChange={(e) => setLocationFormData({...locationFormData, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Description</option>
                        <option value="Environmental Clearance">Environmental Clearance</option>
                        <option value="Forest Clearance">Forest Clearance</option>
                        <option value="Land Acquisition">Land Acquisition</option>
                        <option value="Safety Permits">Safety Permits</option>
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
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-semibold"
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
                        value={locationFormData.registered}
                        onChange={(e) => setLocationFormData({...locationFormData, registered: e.target.value})}
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
                        value={locationFormData.licenseNumber}
                        onChange={(e) => setLocationFormData({...locationFormData, licenseNumber: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter license number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Validity</label>
                      <input
                        type="date"
                        value={locationFormData.validity}
                        onChange={(e) => setLocationFormData({...locationFormData, validity: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity / Manpower Nos</label>
                      <input
                        type="text"
                        value={locationFormData.quantity}
                        onChange={(e) => setLocationFormData({...locationFormData, quantity: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity or manpower numbers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                      <textarea
                        value={locationFormData.remarks}
                        onChange={(e) => setLocationFormData({...locationFormData, remarks: e.target.value})}
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
                        <p className="text-gray-900">{selectedLocation}</p>
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
                        <p className="text-gray-900">{locationFormData.registered || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">License Number:</label>
                        <p className="text-gray-900">{locationFormData.licenseNumber || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Validity:</label>
                        <p className="text-gray-900">{locationFormData.validity || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Quantity:</label>
                        <p className="text-gray-900">{locationFormData.quantity || 'Not specified'}</p>
                      </div>
                    </div>
                    {locationFormData.remarks && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Remarks:</label>
                        <p className="text-gray-900">{locationFormData.remarks}</p>
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
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    <span>Submit Data</span>
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
          {filteredLocations.map((location, index) => (
            <div
              key={index}
              onClick={() => handleLocationClick(location)}
              className="bg-white border-2 border-teal-300 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-teal-400 group relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLocation(location);
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-teal-600 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 text-sm leading-tight pr-6">
                {location}
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

        {workLocations.length === 0 && (
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
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-24 resize-none"
                required
              />
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
                  {workLocations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
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
        {complianceItems.map((item) => (
          <div key={item.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(item.status)}
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{item.dueDate}</span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Location: {item.assignedTo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {complianceItems.length === 0 && (
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
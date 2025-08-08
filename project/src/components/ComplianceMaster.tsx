import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Calendar, CheckCircle, XCircle, Clock, Search, MapPin, ArrowLeft, Save, X, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import { apiService, Initiative, Location } from '../services/api';

const ComplianceMaster: React.FC = () => {
  // State management
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Initiative | null>(null);
  const [showWorkLocations, setShowWorkLocations] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [showLocationDataForm, setShowLocationDataForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Success banner state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastAction, setLastAction] = useState<'wizard' | 'form' | null>(null);

  // Add missing formData state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    dueDate: '',
    assignedTo: ''
  });

  // Location data form state with proper typing
  const [locationFormData, setLocationFormData] = useState({
    title: '',
    description: '',
    category: 'Environmental' as Initiative['category'],
    status: 'Planning' as Initiative['status'],
    startDate: '',
    endDate: '',
    budget: 0,
    participants: 0,
    typeOfPermission: '' as Initiative['typeOfPermission'],
    agency: '' as Initiative['agency'],
    applicable: 'No' as Initiative['applicable'],
    registrationInfo: {
      registered: 'No' as Initiative['registrationInfo']['registered'],
      licenseNumber: '',
      validity: '',
      quantity: '',
      remarks: ''
    },
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    },
    // Add new tracking fields
    statusCounts: {
      planning: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      cancelled: 0
    },
    projectPhase: 'Initial' as 'Initial' | 'Design' | 'Execution' | 'Monitoring' | 'Closure',
    riskLevel: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
    complianceScore: 0,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  // Add ref to track focused element
  const lastActiveElement = useRef<string | null>(null);
  
  // Focus management
  const saveFocus = () => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.id) {
      lastActiveElement.current = activeElement.id;
    }
  };
  
  const restoreFocus = () => {
    if (lastActiveElement.current) {
      const elementToFocus = document.getElementById(lastActiveElement.current);
      if (elementToFocus) {
        elementToFocus.focus();
      }
    }
  };
  
  // Call restoreFocus after state updates that might affect the DOM
  useEffect(() => {
    restoreFocus();
  }, [locationFormData, formData, currentStep]);

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
      let errorMessage = 'Failed to load data';
      
      if (err instanceof Error) {
        if (err.message.includes('Backend service unavailable')) {
          errorMessage = 'Backend service is currently unavailable. Please try again later.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchLocation.toLowerCase()) && location.isActive
  );

  // Reusable handler for "Add more data" from success banner
  const handleAddMoreClick = () => {
    setShowSuccess(false);
    setShowForm(true);
    console.log(newLocationName);

    if (lastAction === 'wizard') {
      // Return to Work Locations list to add more location data
      setShowLocationDataForm(false);
      setShowWorkLocations(true);
    } else if (lastAction === 'form') {
      // Ensure we're on the main Compliance view and open the form
      setShowLocationDataForm(false);
      setShowWorkLocations(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', status: 'pending', dueDate: '', assignedTo: '' });
      setShowForm(true);

      // Optional: focus the first field
      setTimeout(() => {
        document.getElementById('compliance-title')?.focus();
      }, 0);
    }
  };

  // Floating success banner (visible over any page section)
  const SuccessBanner: React.FC = () =>
    showSuccess ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowSuccess(false)}
        />
        {/* Modal */}
        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
          <div className="flex items-start">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4 pr-6">
              <h3 className="text-lg font-semibold text-gray-900">Success</h3>
              <p className="mt-1 text-sm text-gray-600">
                {successMessage || 'Data updated successfully. Do you want to add more data?'}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleAddMoreClick}
                  className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Add more
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    ) : null;

  const handleAddLocation = async () => {
    if (newLocationName.trim() && !locations.some(loc => loc.name === newLocationName.trim())) {
      try {
        setSubmitting(true);
        const newLocation = await apiService.createLocation({
          name: newLocationName.trim(),
          description: '', // Add missing description field
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
      typeOfPermission: 'Not Applicable', // ✅ valid value
      agency: 'Government/Private',       // ✅ valid value
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
      },
      // Add new tracking fields with default values
      statusCounts: {
        planning: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0
      },
      projectPhase: 'Initial',
      riskLevel: 'Low',
      complianceScore: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

  };  

  const handleLocationFormSubmit = async () => {
    if (!selectedLocation) return;

    try {
      setSubmitting(true);
      
      // Ensure all required fields are properly formatted with type casting
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
        typeOfPermission: (locationFormData.typeOfPermission || 'Not Applicable') as Initiative['typeOfPermission'],
        agency: (locationFormData.agency || 'Not Applicable') as Initiative['agency'],
        applicable: (locationFormData.applicable || 'No') as Initiative['applicable'],
        registrationInfo: {
          registered: (locationFormData.registrationInfo.registered || 'No') as Initiative['registrationInfo']['registered'],
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
        // Add new tracking fields to initiative data
        statusCounts: locationFormData.statusCounts,
        projectPhase: locationFormData.projectPhase,
        riskLevel: locationFormData.riskLevel,
        complianceScore: locationFormData.complianceScore,
        lastUpdated: new Date(),
        isActive: true
      };

      console.log('Sending initiative data:', initiativeData);

      const newInitiative = await apiService.createInitiative(initiativeData);
      
      setInitiatives([...initiatives, newInitiative]);
      setShowLocationDataForm(false);
      setCurrentStep(1);
      setSelectedLocation(null);
      setShowWorkLocations(true); // ensure we land on Work Locations list

      // Show success banner and ask to add more
      setLastAction('wizard');
      setSuccessMessage('Data updated successfully. Do you want to add more data?');
      setShowSuccess(true);
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
    dueDate: item.endDate ?? '',
    assignedTo:
      typeof item.location === 'string'
        ? item.location
        : item.location?.name ?? '', // or use `.id` if needed
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
    if (currentStep === 1 && locationFormData.applicable === 'No') {
      // Skip step 2 if not applicable and go directly to review
      setCurrentStep(3);
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3 && locationFormData.applicable === 'No') {
      // Go back to step 1 if coming from review and not applicable
      setCurrentStep(1);
    } else if (currentStep > 1) {
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
    {
      step: 1,
      title: "Initiative Details",
      description: "Basic information and permissions"
    },
    {
      step: 2,
      title: "Registration Info",
      description: "License and registration details",
      conditional: true
    },
    {
      step: 3,
      title: "Review",
      description: "Review and submit data"
    }
  ].map((item) => {
    // Hide step 2 if not applicable
    if (item.conditional && locationFormData.applicable === 'No') {
      return null;
    }

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
              <div className="space-y-6" key="step-1">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Initiative Details & Status Tracking</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        id="initiative-title"
                        type="text"
                        value={locationFormData.title}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({...prev, title: e.target.value}));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter initiative title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <select
                        id="initiative-description"
                        value={locationFormData.description}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({...prev, description: e.target.value}));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Description</option>
                        <option value="Batching Plant">Batching Plant</option>
                        <option value="Blasting">Blasting</option>
                        <option value="BOCW Act">BOCW Act (Building and Other Construction Workers)</option>
                        <option value="CLRA Licence">CLRA Licence - Act 1970</option>
                        <option value="Crusher">Crusher</option>
                        <option value="DG Set">D G Set</option>
                        <option value="Employees Compensation Policy">Employees Compensation Policy</option>
                        <option value="Environment Clearance">Environment Clearance</option>
                        <option value="Extraction of Ground Water">Extraction of Ground Water</option>
                        <option value="Factories approval">Factories approval</option>
                        <option value="FSSAI license">FSSAI license (Food vendor)</option>
                        <option value="Hot Mix Plant">Hot Mix Plant</option>
                        <option value="ISMW">ISMW - Act 1979</option>
                        <option value="Mining Clearance">Mining Clearance (Specially Sand, etc.)</option>
                        <option value="Petrol/Diesel Browser">Petrol / Diesel Browser</option>
                        <option value="Petrol Pump Station">Petrol Pump Station</option>
                        <option value="PT Registration">PT Registration</option>
                        <option value="Shop & Establishment">Shop & establishment</option>
                        <option value="Tree Cutting">Tree Cutting</option>
                        <option value="Wet Mix Plant">Wet Mix Plant</option>
                      </select>
                    </div>

                    {/* Status Tracking Section */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Initiative Status Tracking</h4>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Planning Count</label>
                          <input
                            type="number"
                            value={locationFormData.statusCounts.planning}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                statusCounts: {
                                  ...prev.statusCounts,
                                  planning: parseInt(e.target.value) || 0
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Active Count</label>
                          <input
                            type="number"
                            value={locationFormData.statusCounts.active}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                statusCounts: {
                                  ...prev.statusCounts,
                                  active: parseInt(e.target.value) || 0
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Completed Count</label>
                          <input
                            type="number"
                            value={locationFormData.statusCounts.completed}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                statusCounts: {
                                  ...prev.statusCounts,
                                  completed: parseInt(e.target.value) || 0
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">On Hold Count</label>
                          <input
                            type="number"
                            value={locationFormData.statusCounts.onHold}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                statusCounts: {
                                  ...prev.statusCounts,
                                  onHold: parseInt(e.target.value) || 0
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cancelled Count</label>
                          <input
                            type="number"
                            value={locationFormData.statusCounts.cancelled}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                statusCounts: {
                                  ...prev.statusCounts,
                                  cancelled: parseInt(e.target.value) || 0
                                }
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Score (%)</label>
                          <input
                            type="number"
                            value={locationFormData.complianceScore}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                complianceScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Phase</label>
                          <select
                            value={locationFormData.projectPhase}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                projectPhase: e.target.value as typeof prev.projectPhase
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Initial">Initial</option>
                            <option value="Design">Design</option>
                            <option value="Execution">Execution</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Closure">Closure</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                          <select
                            value={locationFormData.riskLevel}
                            onChange={(e) => {
                              saveFocus();
                              setLocationFormData(prev => ({
                                ...prev,
                                riskLevel: e.target.value as typeof prev.riskLevel
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      {/* Summary Display */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Summary</h5>
                        <div className="text-sm text-gray-600">
                          <p>Total Initiatives: {Object.values(locationFormData.statusCounts).reduce((sum, count) => sum + count, 0)}</p>
                          <p>Completion Rate: {
                            Object.values(locationFormData.statusCounts).reduce((sum, count) => sum + count, 0) > 0 
                              ? Math.round((locationFormData.statusCounts.completed / Object.values(locationFormData.statusCounts).reduce((sum, count) => sum + count, 0)) * 100)
                              : 0
                          }%</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type of Permission</label>
                      <select
                        id="initiative-permission-type"
                        value={locationFormData.typeOfPermission}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({...prev, typeOfPermission: e.target.value as Initiative['typeOfPermission']}))
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Consent to Establish">Consent to Establish</option>
                        <option value="Consent to Operate">Consent to Operate</option>
                        <option value="Insurance">Insurance</option>
                        <option value="NOC">NOC</option>
                        <option value="NOC/Permission from client">NOC/Permission from client</option>
                        <option value="Permission">Permission</option>
                        <option value="blank">Blanks</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Agency</label>
                      <select
                        id="initiative-agency"
                        value={locationFormData.agency}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({...prev, agency: e.target.value as Initiative['agency']}));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Agency</option>
                        <option value="Chief Controller of Explosives">Chief Controller of Explosives</option>
                        <option value="DEIAA/SEIAA">DEIAA/SEIAA</option>
                        <option value="Factories Department">Factories Department</option>
                        <option value="Forest Department">Forest Department</option>
                        <option value="Government/Private">Government/Private</option>
                        <option value="Labour Department Authority">Labour Department Authority</option>
                        <option value="MOEFCC">MOEFCC</option>
                        <option value="State Pollution Control Board">State Pollution Control Board</option>
                        <option value="State Water Department">State Water Department</option>
                        <option value="The Food Safety and Standards Authority of India">The Food Safety and Standards Authority of India</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Applicable (Yes/No)</label>
                      <select
                        id="initiative-applicable"
                        value={locationFormData.applicable}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({...prev, applicable: e.target.value as Initiative['applicable'],}));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
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
                    disabled={!locationFormData.title || !locationFormData.description || !locationFormData.typeOfPermission || !locationFormData.agency || !locationFormData.applicable}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{locationFormData.applicable === 'No' ? 'Skip to Review' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Registration Info - Only show if applicable is Yes */}
            {currentStep === 2 && locationFormData.applicable === 'Yes' && (
              <div className="space-y-6" key="step-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Registration Info</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registered (Yes/No)</label>
                      <select
                        id="reg-registered"
                        value={locationFormData.registrationInfo.registered}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({
                            ...prev,
                            registrationInfo: {
                              ...prev.registrationInfo,
                              registered: e.target.value as Initiative['registrationInfo']['registered']
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        id="reg-license"
                        type="text"
                        value={locationFormData.registrationInfo.licenseNumber}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({
                            ...prev,
                            registrationInfo: {
                              ...prev.registrationInfo,
                              licenseNumber: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter license number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Validity</label>
                      <input
                        id="reg-validity"
                        type="date"
                        value={locationFormData.registrationInfo.validity}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({
                            ...prev,
                            registrationInfo: {
                              ...prev.registrationInfo,
                              validity: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity / Manpower Nos</label>
                      <input
                        id="reg-quantity"
                        type="text"
                        value={locationFormData.registrationInfo.quantity}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({
                            ...prev,
                            registrationInfo: {
                              ...prev.registrationInfo,
                              quantity: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity or manpower numbers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                      <input
                        id="reg-remarks"
                        type="text"
                        value={locationFormData.registrationInfo.remarks}
                        onChange={(e) => {
                          saveFocus();
                          setLocationFormData(prev => ({
                            ...prev,
                            registrationInfo: {
                              ...prev.registrationInfo,
                              remarks: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    disabled={!locationFormData.registrationInfo.registered}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6" key="step-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Review</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location:</label>
                        <p className="text-gray-900">{selectedLocation?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Title:</label>
                        <p className="text-gray-900">{locationFormData.title || 'Not specified'}</p>
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
                        <label className="text-sm font-medium text-gray-600">Applicable:</label>
                        <p className={`font-medium ${locationFormData.applicable === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                          {locationFormData.applicable || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Only show registration info if applicable is Yes */}
                    {locationFormData.applicable === 'Yes' && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Registration Information</h4>
                        <div className="grid grid-cols-2 gap-4">
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
                          <div className="mt-3">
                            <label className="text-sm font-medium text-gray-600">Remarks:</label>
                            <p className="text-gray-900">{locationFormData.registrationInfo.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show message if not applicable */}
                    {locationFormData.applicable === 'No' && (
                      <div className="border-t pt-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-700 text-sm">
                            <strong>Not Applicable:</strong> Registration information is not required for this initiative as it was marked as "Not Applicable".
                          </p>
                        </div>
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
        <SuccessBanner />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={() => setShowWorkLocations(false)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Compliance</span>
            </button> */}
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

  // if(showWorkLocations) {
  //   return ("")
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (editingItem) {
        const updateData = {
          title: formData.title,
          description: formData.description,
          status: (formData.status === 'pending' ? 'Planning' : 
                  formData.status === 'approved' ? 'Active' : 'On Hold') as Initiative['status'],
          endDate: formData.dueDate || '',
          location: formData.assignedTo
        };
        
        const updatedInitiative = await apiService.updateInitiative(editingItem._id!, updateData);
        
        setInitiatives(initiatives.map(item => 
          item._id === editingItem._id ? updatedInitiative : item
        ));
      } else {
        const newInitiativeData: Omit<Initiative, '_id'> = {
          title: formData.title,
          description: formData.description,
          location: formData.assignedTo,
          category: 'Other',
          status: (formData.status === 'pending' ? 'Planning' : 
                  formData.status === 'approved' ? 'Active' : 'On Hold') as Initiative['status'],
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
        setInitiatives([...initiatives, newInitiative]);
      }
      
      resetForm();

      // Show success banner and ask to add more
      setLastAction('form');
      setSuccessMessage('Data updated successfully. Do you want to add more data?');
      setShowSuccess(true);
    } catch (err) {
      console.error('Error saving initiative:', err);
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-gray-600">Loading compliance data...</div>
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
        <div className="mt-4 space-y-2">
          <button
            onClick={loadInitialData}
            className="text-sm text-red-600 hover:text-red-800 underline block"
          >
            Try again
          </button>
          {error.includes('Backend service unavailable') && (
            <div className="text-sm text-red-600">
              <p>Possible solutions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check if backend server is running</li>
                <li>Verify API URL in environment variables</li>
                <li>Check network connectivity</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SuccessBanner />
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
                  id="compliance-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    saveFocus();
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                  }}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  id="compliance-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    saveFocus();
                    setFormData(prev => ({ ...prev, dueDate: e.target.value }));
                  }}
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
                id="compliance-description"
                value={formData.description}
                onChange={(e) => {
                  saveFocus();
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                }}
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
                  id="compliance-status"
                  value={formData.status}
                  onChange={(e) => {
                    saveFocus();
                    setFormData(prev => ({ ...prev, status: e.target.value as any }));
                  }}
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
                  id="compliance-location"
                  value={formData.assignedTo}
                  onChange={(e) => {
                    saveFocus();
                    setFormData(prev => ({ ...prev, assignedTo: e.target.value }));
                  }}
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
            : (item.location as any)?.name || 'Unknown';
            
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
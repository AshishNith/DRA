import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Clock, Calendar, Eye, EyeOff, MapPin } from 'lucide-react';
import { apiService, Initiative } from '../services/api';
// import { useNavigate } from 'react-router-dom';

interface ExpiryNotification {
  id: string;
  title: string;
  type: 'expiry' | 'renewal' | 'compliance' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  daysRemaining: number;
  expiryDate: string;
  initiativeId?: string;
  locationName?: string;
  licenseNumber?: string;
}

interface NotificationProps {
  className?: string;
  onNotificationCountChange?: (count: number) => void;
  isPopupMode?: boolean;
}

const Notification: React.FC<NotificationProps> = ({ 
  className = '', 
  onNotificationCountChange,
  isPopupMode = false 
}) => {
//   const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ExpiryNotification[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  
  // Add states for popup form
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
    }
  });
  const [submitting, setSubmitting] = useState(false);

  // Add focus management refs
  const activeElementRef = useRef<string | null>(null);
  const formRefs = useRef<{ [key: string]: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }>({});

  // Focus management functions
  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (activeElement.id || activeElement.name)) {
      activeElementRef.current = activeElement.id || activeElement.name;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (activeElementRef.current) {
      const element = formRefs.current[activeElementRef.current] || 
                     document.getElementById(activeElementRef.current) ||
                     document.querySelector(`[name="${activeElementRef.current}"]`) as HTMLElement;
      
      if (element) {
        setTimeout(() => {
          element.focus();
          // For input elements, restore cursor position
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const length = element.value.length;
            element.setSelectionRange(length, length);
          }
        }, 0);
      }
    }
  }, []);

  // Optimized form data update function
  const updateFormData = useCallback((path: string, value: any) => {
    saveFocus();
    
    setFormData(prevData => {
      const newData = { ...prevData };
      const pathArray = path.split('.');
      
      if (pathArray.length === 1) {
        (newData as any)[pathArray[0]] = value;
      } else if (pathArray.length === 2) {
        (newData as any)[pathArray[0]] = {
          ...(newData as any)[pathArray[0]],
          [pathArray[1]]: value
        };
      } else if (pathArray.length === 3) {
        (newData as any)[pathArray[0]] = {
          ...(newData as any)[pathArray[0]],
          [pathArray[1]]: {
            ...(newData as any)[pathArray[0]][pathArray[1]],
            [pathArray[2]]: value
          }
        };
      }
      
      return newData;
    });
  }, [saveFocus]);

  // Restore focus after form data updates
  useEffect(() => {
    restoreFocus();
  }, [formData, restoreFocus]);

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate visible notifications first
  const visibleNotifications = notifications.filter(n => !dismissed.includes(n.id));
  const criticalCount = visibleNotifications.filter(n => n.severity === 'critical').length;
  const highCount = visibleNotifications.filter(n => n.severity === 'high').length;

  useEffect(() => {
    // Notify parent component of notification count changes
    if (onNotificationCountChange) {
      const criticalAndHighCount = visibleNotifications.filter(
        n => n.severity === 'critical' || n.severity === 'high'
      ).length;
      onNotificationCountChange(criticalAndHighCount);
    }
  }, [visibleNotifications, onNotificationCountChange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch initiatives to check for expiries
      const initiativesData = await apiService.getInitiatives({ limit: 1000 });
      const initiatives = Array.isArray(initiativesData) ? initiativesData : [];
      
      setInitiatives(initiatives);
      
      // Generate expiry notifications
      const expiryNotifications = generateExpiryNotifications(initiatives);
      setNotifications(expiryNotifications);
      
    } catch (err) {
      console.error('Error fetching notification data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const generateExpiryNotifications = (initiatives: Initiative[]): ExpiryNotification[] => {
    const notifications: ExpiryNotification[] = [];
    const today = new Date();
    
    initiatives.forEach((initiative) => {
      // Add debug logging
      console.log('Processing initiative:', initiative.title, 'ID:', initiative._id);
      
      // Check registration validity expiry
      if (initiative.registrationInfo?.validity && initiative.registrationInfo.registered === 'Yes') {
        const expiryDate = new Date(initiative.registrationInfo.validity);
        const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only show notifications for items expiring within 30 days or already expired
        if (daysRemaining <= 30) {
          let severity: ExpiryNotification['severity'] = 'low';
          let message = '';
          
          if (daysRemaining < 0) {
            severity = 'critical';
            message = `Registration expired ${Math.abs(daysRemaining)} days ago`;
          } else if (daysRemaining <= 7) {
            severity = 'critical';
            message = `Registration expires in ${daysRemaining} days`;
          } else if (daysRemaining <= 15) {
            severity = 'high';
            message = `Registration expires in ${daysRemaining} days`;
          } else {
            severity = 'medium';
            message = `Registration expires in ${daysRemaining} days`;
          }

          const notification = {
            id: `${initiative._id}-validity`,
            title: initiative.title,
            type: 'expiry' as const,
            severity,
            message,
            daysRemaining,
            expiryDate: initiative.registrationInfo.validity,
            initiativeId: initiative._id, // Ensure this is set
            locationName: typeof initiative.location === 'object' 
              ? (initiative.location as any)?.name 
              : 'Unknown Location',
            licenseNumber: initiative.registrationInfo.licenseNumber
          };
          
          console.log('Created notification with ID:', notification.initiativeId);
          notifications.push(notification);
        }
      }

      // Check initiative end date
      if (initiative.endDate && initiative.status !== 'Completed' && initiative.status !== 'Cancelled') {
        const endDate = new Date(initiative.endDate);
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 30) {
          let severity: ExpiryNotification['severity'] = 'low';
          let message = '';
          
          if (daysRemaining < 0) {
            severity = 'high';
            message = `Initiative deadline passed ${Math.abs(daysRemaining)} days ago`;
          } else if (daysRemaining <= 7) {
            severity = 'medium';
            message = `Initiative deadline in ${daysRemaining} days`;
          } else {
            severity = 'low';
            message = `Initiative deadline in ${daysRemaining} days`;
          }

          const notification = {
            id: `${initiative._id}-deadline`,
            title: initiative.title,
            type: 'compliance' as const,
            severity,
            message,
            daysRemaining,
            expiryDate: initiative.endDate,
            initiativeId: initiative._id, // Ensure this is set
            locationName: typeof initiative.location === 'object' 
              ? (initiative.location as any)?.name 
              : 'Unknown Location'
          };
          
          console.log('Created deadline notification with ID:', notification.initiativeId);
          notifications.push(notification);
        }
      }
    });

    // Sort by severity and days remaining
    return notifications.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return a.daysRemaining - b.daysRemaining;
    });
  };

  const getSeverityColor = (severity: ExpiryNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: ExpiryNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: ExpiryNotification['type']) => {
    switch (type) {
      case 'expiry':
        return 'Registration Expiry';
      case 'renewal':
        return 'Renewal Required';
      case 'compliance':
        return 'Compliance Deadline';
      case 'general':
        return 'General Notice';
      default:
        return 'Notification';
    }
  };

  const dismissNotification = (notificationId: string) => {
    setDismissed([...dismissed, notificationId]);
  };

  const handleGoToForm = async (notification: ExpiryNotification) => {
    if (notification.initiativeId) {
      try {
        // Fetch the full initiative details
        const initiative = initiatives.find(i => i._id === notification.initiativeId);
        if (initiative) {
          setEditingInitiative(initiative);

          // Format dates properly for form inputs
          const formatDateForInput = (dateString: string) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            } catch {
              return '';
            }
          };

          // Autofill previous data
          setFormData({
            title: initiative.title || '',
            description: initiative.description || '',
            status: initiative.status || 'Planning',
            startDate: formatDateForInput(initiative.startDate),
            endDate: formatDateForInput(initiative.endDate || ''),
            budget: initiative.budget || 0,
            participants: initiative.participants || 0,
            typeOfPermission: initiative.typeOfPermission || 'Not Applicable',
            agency: initiative.agency || 'Not Applicable',
            applicable: initiative.applicable || 'No',
            registrationInfo: {
              registered: initiative.registrationInfo?.registered || 'No',
              licenseNumber: initiative.registrationInfo?.licenseNumber || '',
              validity: formatDateForInput(initiative.registrationInfo?.validity || ''),
              quantity: initiative.registrationInfo?.quantity || '',
              remarks: initiative.registrationInfo?.remarks || ''
            },
            contactPerson: {
              name: initiative.contactPerson?.name || '',
              email: initiative.contactPerson?.email || '',
              phone: initiative.contactPerson?.phone || ''
            }
          });
          setShowEditForm(true);

          // Dismiss the notification
          dismissNotification(notification.id);
        }
      } catch (err) {
        console.error('Error fetching initiative details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load initiative details');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInitiative) return;

    try {
      setSubmitting(true);
      setError(null); // Clear any previous errors
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description) {
        throw new Error('Description is required');
      }
      
      // Validate dates
      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }

      // Validate registration validity date if registered
      if (formData.registrationInfo.registered === 'Yes' && 
          formData.registrationInfo.validity) {
        const validityDate = new Date(formData.registrationInfo.validity);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (validityDate < today) {
          throw new Error('Validity date cannot be in the past');
        }
      }
      
      const updateData = {
        title: formData.title.trim(),
        description: formData.description,
        status: formData.status,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || '',
        budget: Number(formData.budget) || 0,
        participants: Number(formData.participants) || 0,
        typeOfPermission: formData.typeOfPermission,
        agency: formData.agency,
        applicable: formData.applicable,
        registrationInfo: {
          registered: formData.registrationInfo.registered,
          licenseNumber: formData.registrationInfo.licenseNumber.trim(),
          validity: formData.registrationInfo.validity || '',
          quantity: formData.registrationInfo.quantity.trim(),
          remarks: formData.registrationInfo.remarks.trim()
        },
        contactPerson: {
          name: formData.contactPerson.name.trim(),
          email: formData.contactPerson.email.trim(),
          phone: formData.contactPerson.phone.trim()
        }
      };

      console.log('Updating initiative with data:', updateData);
      
      const updatedInitiative = await apiService.updateInitiative(editingInitiative._id!, updateData);
      
      // Update the initiatives list
      setInitiatives(prev => prev.map(item => 
        item._id === editingInitiative._id ? updatedInitiative : item
      ));
      
      // Refresh notifications to reflect changes
      const updatedInitiatives = initiatives.map(item => 
        item._id === editingInitiative._id ? updatedInitiative : item
      );
      const expiryNotifications = generateExpiryNotifications(updatedInitiatives);
      setNotifications(expiryNotifications);
      
      // Close the form and show success
      setShowEditForm(false);
      setEditingInitiative(null);
      
      // Show success message
      console.log('Initiative updated successfully');
      
    } catch (err) {
      console.error('Error updating initiative:', err);
      setError(err instanceof Error ? err.message : 'Failed to update initiative');
    } finally {
      setSubmitting(false);
    }
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingInitiative(null);
    setError(null); // Clear any errors
    setFormData({
      title: '',
      description: '',
      status: 'Planning',
      startDate: '',
      endDate: '',
      budget: 0,
      participants: 0,
      typeOfPermission: 'Not Applicable',
      agency: 'Not Applicable',
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

  // Edit Form Popup Component with improved focus management
  const EditFormPopup = () => (
    showEditForm && editingInitiative ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Edit Initiative</h2>
                <p className="text-blue-100 mt-1">Update details from notification alert</p>
              </div>
              <button
                onClick={closeEditForm}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={(el) => el && (formRefs.current['title'] = el)}
                      id="edit-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Enter initiative title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <select
                      ref={(el) => el && (formRefs.current['description'] = el)}
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      ref={(el) => el && (formRefs.current['status'] = el)}
                      id="edit-status"
                      name="status"
                      value={formData.status}
                      onChange={(e) => updateFormData('status', e.target.value as Initiative['status'])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <input
                      ref={(el) => el && (formRefs.current['budget'] = el)}
                      id="edit-budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => updateFormData('budget', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="Enter budget amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      ref={(el) => el && (formRefs.current['startDate'] = el)}
                      id="edit-startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      ref={(el) => el && (formRefs.current['endDate'] = el)}
                      id="edit-endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateFormData('endDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={formData.startDate || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Permission Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 font-semibold">2</span>
                  </div>
                  Permission Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type of Permission</label>
                    <select
                      ref={(el) => el && (formRefs.current['typeOfPermission'] = el)}
                      id="edit-typeOfPermission"
                      name="typeOfPermission"
                      value={formData.typeOfPermission}
                      onChange={(e) => updateFormData('typeOfPermission', e.target.value as Initiative['typeOfPermission'])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Consent to Establish">Consent to Establish</option>
                      <option value="Consent to Operate">Consent to Operate</option>
                      <option value="Insurance">Insurance</option>
                      <option value="NOC">NOC</option>
                      <option value="NOC/Permission from client">NOC/Permission from client</option>
                      <option value="Permission">Permission</option>
                      <option value="blank">Blank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agency</label>
                    <select
                      ref={(el) => el && (formRefs.current['agency'] = el)}
                      id="edit-agency"
                      name="agency"
                      value={formData.agency}
                      onChange={(e) => updateFormData('agency', e.target.value as Initiative['agency'])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Not Applicable">Not Applicable</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicable</label>
                    <select
                      ref={(el) => el && (formRefs.current['applicable'] = el)}
                      id="edit-applicable"
                      name="applicable"
                      value={formData.applicable}
                      onChange={(e) => updateFormData('applicable', e.target.value as Initiative['applicable'])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                    <input
                      ref={(el) => el && (formRefs.current['participants'] = el)}
                      id="edit-participants"
                      name="participants"
                      type="number"
                      value={formData.participants}
                      onChange={(e) => updateFormData('participants', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      placeholder="Number of participants"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Information - Only show if applicable is Yes */}
              {formData.applicable === 'Yes' && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    Registration Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registered</label>
                      <select
                        ref={(el) => el && (formRefs.current['registrationInfo.registered'] = el)}
                        id="edit-registered"
                        name="registrationInfo.registered"
                        value={formData.registrationInfo.registered}
                        onChange={(e) => updateFormData('registrationInfo.registered', e.target.value as Initiative['registrationInfo']['registered'])}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        ref={(el) => el && (formRefs.current['registrationInfo.licenseNumber'] = el)}
                        id="edit-licenseNumber"
                        name="registrationInfo.licenseNumber"
                        type="text"
                        value={formData.registrationInfo.licenseNumber}
                        onChange={(e) => updateFormData('registrationInfo.licenseNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter license number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validity Date
                        {formData.registrationInfo.registered === 'Yes' && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        ref={(el) => el && (formRefs.current['registrationInfo.validity'] = el)}
                        id="edit-validity"
                        name="registrationInfo.validity"
                        type="date"
                        value={formData.registrationInfo.validity}
                        onChange={(e) => updateFormData('registrationInfo.validity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                        required={formData.registrationInfo.registered === 'Yes'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity / Manpower Nos</label>
                      <input
                        ref={(el) => el && (formRefs.current['registrationInfo.quantity'] = el)}
                        id="edit-quantity"
                        name="registrationInfo.quantity"
                        type="text"
                        value={formData.registrationInfo.quantity}
                        onChange={(e) => updateFormData('registrationInfo.quantity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter quantity or manpower numbers"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                      <textarea
                        ref={(el) => el && (formRefs.current['registrationInfo.remarks'] = el)}
                        id="edit-remarks"
                        name="registrationInfo.remarks"
                        value={formData.registrationInfo.remarks}
                        onChange={(e) => updateFormData('registrationInfo.remarks', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter any additional remarks"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Person */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">{formData.applicable === 'Yes' ? '4' : '3'}</span>
                  </div>
                  Contact Person
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      ref={(el) => el && (formRefs.current['contactPerson.name'] = el)}
                      id="edit-contactName"
                      name="contactPerson.name"
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) => updateFormData('contactPerson.name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      ref={(el) => el && (formRefs.current['contactPerson.email'] = el)}
                      id="edit-contactEmail"
                      name="contactPerson.email"
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) => updateFormData('contactPerson.email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      ref={(el) => el && (formRefs.current['contactPerson.phone'] = el)}
                      id="edit-contactPhone"
                      name="contactPerson.phone"
                      type="tel"
                      value={formData.contactPerson.phone}
                      onChange={(e) => updateFormData('contactPerson.phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title.trim() || !formData.description}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{submitting ? 'Updating...' : 'Update Initiative'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ) : null
  );

  if (loading) {
    return (
      <div className={`${isPopupMode ? 'p-4' : 'bg-gray-50 border border-gray-200 rounded-lg p-4'} ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isPopupMode ? 'p-4' : 'bg-red-50 border border-red-200 rounded-lg p-4'} ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">Error loading notifications: {error}</span>
        </div>
      </div>
    );
  }

  if (visibleNotifications.length === 0) {
    if (isPopupMode) {
      return (
        <div className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">All Clear!</h3>
            <p className="text-xs text-green-600 mt-1">No upcoming expiries within 30 days.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-800">All Clear!</h3>
              <p className="text-xs text-green-600">No upcoming expiries within 30 days.</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="text-green-600 hover:text-green-700 transition-colors"
            title="Refresh notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Popup Mode Layout
  if (isPopupMode) {
    console.log('Popup mode - visible notifications:', visibleNotifications);
    
    return (
      <div className="max-h-96 overflow-y-auto">
        {visibleNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">All Clear!</h3>
              <p className="text-xs text-green-600 mt-1">No upcoming expiries within 30 days.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Individual Notifications in Popup */}
            {visibleNotifications.slice(0, 8).map((notification) => {
              console.log('Rendering notification:', notification.title, 'Initiative ID:', notification.initiativeId);
              
              return (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(notification.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <h4 className="text-sm font-medium text-gray-900 leading-tight">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notification.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        notification.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        notification.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {notification.locationName && (
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{notification.locationName}</span>
                        {notification.licenseNumber && (
                          <span className="ml-2 text-gray-400">• {notification.licenseNumber}</span>
                        )}
                      </div>
                    )}

                    {/* Show urgency message */}
                    {notification.daysRemaining <= 7 && (
                      <div className={`mb-3 text-xs px-2 py-1 rounded ${
                        notification.daysRemaining < 0 ? 'bg-red-50 text-red-700' :
                        notification.daysRemaining <= 3 ? 'bg-orange-50 text-orange-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>
                        {notification.daysRemaining < 0 ? 
                          `Expired ${Math.abs(notification.daysRemaining)} days ago` :
                          `Expires in ${notification.daysRemaining} days`
                        }
                      </div>
                    )}

                    {/* Debug info - remove after testing */}
                    <div className="mb-2 text-xs text-purple-600 bg-purple-50 p-1 rounded">
                      Debug: Initiative ID = {notification.initiativeId || 'MISSING'}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors font-medium"
                        title="Dismiss notification"
                      >
                        Dismiss
                      </button>
                      
                      {/* Debug the condition */}
                      {notification.initiativeId ? (
                        <button
                          onClick={() => {
                            console.log('Go to Form clicked for:', notification.title, 'ID:', notification.initiativeId);
                            handleGoToForm(notification);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors font-medium"
                          title="Edit initiative details"
                        >
                          Go to Form
                        </button>
                      ) : (
                        <div className="flex-1 px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded text-center">
                          No ID
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {visibleNotifications.length > 8 && (
              <div className="text-center p-3 bg-gray-50 border-t">
                <span className="text-xs text-gray-500">
                  and {visibleNotifications.length - 8} more notifications...
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default Dashboard Layout
  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {/* Summary Banner */}
        <div className={`rounded-lg p-4 border ${
          criticalCount > 0 
            ? 'bg-red-50 border-red-200' 
            : highCount > 0 
            ? 'bg-orange-50 border-orange-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {criticalCount > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : highCount > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <h3 className={`text-sm font-medium ${
                    criticalCount > 0 
                      ? 'text-red-800' 
                      : highCount > 0 
                      ? 'text-orange-800'
                      : 'text-yellow-800'
                  }`}>
                    Expiry Reminders ({visibleNotifications.length})
                  </h3>
                  <p className={`text-xs ${
                    criticalCount > 0 
                      ? 'text-red-600' 
                      : highCount > 0 
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                  }`}>
                    {criticalCount > 0 && `${criticalCount} critical, `}
                    {highCount > 0 && `${highCount} high priority, `}
                    {visibleNotifications.length - criticalCount - highCount} others
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-1 rounded transition-colors ${
                  criticalCount > 0 
                    ? 'text-red-600 hover:text-red-700' 
                    : highCount > 0 
                    ? 'text-orange-600 hover:text-orange-700'
                    : 'text-yellow-600 hover:text-yellow-700'
                }`}
                title={showNotifications ? 'Hide notifications' : 'Show notifications'}
              >
                {showNotifications ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={fetchData}
                className={`p-1 rounded transition-colors ${
                  criticalCount > 0 
                    ? 'text-red-600 hover:text-red-700' 
                    : highCount > 0 
                    ? 'text-orange-600 hover:text-orange-700'
                    : 'text-yellow-600 hover:text-yellow-700'
                }`}
                title="Refresh notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Individual Notifications */}
        {showNotifications && (
          <div className="space-y-2">
            {visibleNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg p-3 border ${getSeverityColor(notification.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(notification.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs opacity-75 mb-2">
                        {notification.locationName && (
                          <span>📍 {notification.locationName}</span>
                        )}
                        {notification.licenseNumber && (
                          <span>🔖 {notification.licenseNumber}</span>
                        )}
                        <span>📅 {new Date(notification.expiryDate).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Action Buttons for Dashboard Mode too */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="px-3 py-1 text-xs bg-white/70 hover:bg-white rounded transition-colors font-medium"
                          title="Dismiss notification"
                        >
                          Dismiss
                        </button>
                        {notification.initiativeId && (
                          <button
                            onClick={() => {
                              console.log('Dashboard Go to Form clicked:', notification.title);
                              handleGoToForm(notification);
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors font-medium"
                            title="Edit initiative details"
                          >
                            Go to Form
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="p-1 hover:bg-white/50 rounded transition-colors ml-2"
                    title="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {visibleNotifications.length > 5 && (
              <div className="text-center p-2">
                <span className="text-sm text-gray-500">
                  and {visibleNotifications.length - 5} more notifications...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Form Popup */}
      <EditFormPopup />
    </>
  );

};

export default Notification;

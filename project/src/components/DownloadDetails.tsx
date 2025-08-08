import React, { useState, useEffect } from 'react';
import { Download, Users, MapPin, Calendar, Filter, Search, RefreshCw, Building2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { User, Location, Initiative } from '../services/api';
import * as XLSX from 'xlsx';

const DownloadDetails: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Filter states
  const [userFilters, setUserFilters] = useState({
    role: '',
    isActive: '',
    search: ''
  });
  const [locationFilters, setLocationFilters] = useState({
    isActive: '',
    search: ''
  });
  const [initiativeFilters, setInitiativeFilters] = useState({
    status: '',
    category: '',
    location: '',
    search: ''
  });

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

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    if (data.length === 0) {
      alert('No data available to download');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '');
        let value = '';
        
        // Handle nested objects and different data structures
        switch (key) {
          case 'name':
            value = row.name || row.title || '';
            break;
          case 'email':
            value = row.email || '';
            break;
          case 'role':
            value = row.role || '';
            break;
          case 'status':
            value = row.status || (row.isActive ? 'Active' : 'Inactive');
            break;
          case 'createdat':
            value = row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '';
            break;
          case 'lastlogin':
            value = row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : '';
            break;
          case 'address':
            value = row.address || '';
            break;
          case 'city':
            value = row.city || '';
            break;
          case 'state':
            value = row.state || '';
            break;
          case 'zipcode':
            value = row.zipCode || '';
            break;
          case 'description':
            value = row.description || '';
            break;
          case 'title':
            value = row.title || '';
            break;
          case 'category':
            value = row.category || '';
            break;
          case 'budget':
            value = row.budget || 0;
            break;
          case 'participants':
            value = row.participants || 0;
            break;
          case 'startdate':
            value = row.startDate ? new Date(row.startDate).toLocaleDateString() : '';
            break;
          case 'enddate':
            value = row.endDate ? new Date(row.endDate).toLocaleDateString() : '';
            break;
          case 'location':
            value = typeof row.location === 'object' ? row.location?.name || '' : row.location || '';
            break;
          case 'contactperson':
            value = row.contactPerson?.name || '';
            break;
          case 'contactemail':
            value = row.contactPerson?.email || '';
            break;
          case 'contactphone':
            value = row.contactPerson?.phone || '';
            break;
          case 'agency':
            value = row.agency || '';
            break;
          case 'typeofpermission':
            value = row.typeOfPermission || '';
            break;
          case 'applicable':
            value = row.applicable || '';
            break;
          case 'compliancestatus':
            value = row.complianceStatus || '';
            break;
          case 'licensenumber':
            value = row.registrationInfo?.licenseNumber || '';
            break;
          case 'validity':
            value = row.registrationInfo?.validity || '';
            break;
          default:
            value = row[key] || '';
        }
        
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadLocationWiseExcel = async () => {
    setDownloading('location-wise');
    try {
      const filteredInitiatives = getFilteredInitiatives();
      
      if (filteredInitiatives.length === 0) {
        alert('No initiatives data available to download');
        return;
      }

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Summary sheet with all data
      const summaryHeaders = [
        'Title', 'Description', 'Category', 'Status', 'Location', 'Budget', 'Participants',
        'Start Date', 'End Date', 'Contact Person', 'Contact Email', 'Contact Phone',
        'Agency', 'Type of Permission', 'Applicable', 'Compliance Status', 'License Number', 
        'Validity', 'Registered', 'Quantity', 'Remarks', 'Created At'
      ];

      const summaryData = filteredInitiatives.map(initiative => ({
        'Title': initiative.title || '',
        'Description': initiative.description || '',
        'Category': initiative.category || '',
        'Status': initiative.status || '',
        'Location': typeof initiative.location === 'object' ? initiative.location?.name || '' : initiative.location || '',
        'Budget': initiative.budget || 0,
        'Participants': initiative.participants || 0,
        'Start Date': initiative.startDate ? new Date(initiative.startDate).toLocaleDateString() : '',
        'End Date': initiative.endDate ? new Date(initiative.endDate).toLocaleDateString() : '',
        'Contact Person': initiative.contactPerson?.name || '',
        'Contact Email': initiative.contactPerson?.email || '',
        'Contact Phone': initiative.contactPerson?.phone || '',
        'Agency': initiative.agency || '',
        'Type of Permission': initiative.typeOfPermission || '',
        'Applicable': initiative.applicable || '',
        'Compliance Status': initiative.complianceStatus || '',
        'License Number': initiative.registrationInfo?.licenseNumber || '',
        'Validity': initiative.registrationInfo?.validity || '',
        'Registered': initiative.registrationInfo?.registered || '',
        'Quantity': initiative.registrationInfo?.quantity || '',
        'Remarks': initiative.registrationInfo?.remarks || '',
        'Created At': initiative.createdAt ? new Date(initiative.createdAt).toLocaleDateString() : ''
      }));

      // Add summary sheet
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'All Locations Summary');

      // Group initiatives by location
      const locationGroups = locations.reduce((groups, location) => {
        const locationInitiatives = filteredInitiatives.filter(initiative => {
          if (typeof initiative.location === 'object' && initiative.location !== null) {
            return (initiative.location as any)._id === location._id;
          }
          return initiative.location === location._id;
        });

        if (locationInitiatives.length > 0) {
          groups[location.name] = locationInitiatives;
        }
        return groups;
      }, {} as Record<string, Initiative[]>);

      // Create separate sheet for each location
      Object.entries(locationGroups).forEach(([locationName, locationInitiatives]) => {
        // Location summary data
        const locationSummary = {
          'Location Name': locationName,
          'Total Initiatives': locationInitiatives.length,
          'Active Initiatives': locationInitiatives.filter(i => i.status === 'Active').length,
          'Completed Initiatives': locationInitiatives.filter(i => i.status === 'Completed').length,
          'Planning Initiatives': locationInitiatives.filter(i => i.status === 'Planning').length,
          'On Hold Initiatives': locationInitiatives.filter(i => i.status === 'On Hold').length,
          'Cancelled Initiatives': locationInitiatives.filter(i => i.status === 'Cancelled').length,
          'Total Budget': locationInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0),
          'Applicable Count': locationInitiatives.filter(i => i.applicable === 'Yes').length,
          'Registered Count': locationInitiatives.filter(i => i.registrationInfo?.registered === 'Yes').length,
          'Registration Rate': locationInitiatives.filter(i => i.applicable === 'Yes').length > 0 
            ? Math.round((locationInitiatives.filter(i => i.registrationInfo?.registered === 'Yes').length / 
                locationInitiatives.filter(i => i.applicable === 'Yes').length) * 100) + '%'
            : '0%',
          'Completion Rate': Math.round((locationInitiatives.filter(i => i.status === 'Completed').length / locationInitiatives.length) * 100) + '%'
        };

        // Detailed initiatives data for this location
        const locationData = locationInitiatives.map(initiative => ({
          'Title': initiative.title || '',
          'Description': initiative.description || '',
          'Category': initiative.category || '',
          'Status': initiative.status || '',
          'Budget': initiative.budget || 0,
          'Participants': initiative.participants || 0,
          'Start Date': initiative.startDate ? new Date(initiative.startDate).toLocaleDateString() : '',
          'End Date': initiative.endDate ? new Date(initiative.endDate).toLocaleDateString() : '',
          'Contact Person': initiative.contactPerson?.name || '',
          'Contact Email': initiative.contactPerson?.email || '',
          'Contact Phone': initiative.contactPerson?.phone || '',
          'Agency': initiative.agency || '',
          'Type of Permission': initiative.typeOfPermission || '',
          'Applicable': initiative.applicable || '',
          'Compliance Status': initiative.complianceStatus || '',
          'Registered': initiative.registrationInfo?.registered || '',
          'License Number': initiative.registrationInfo?.licenseNumber || '',
          'Validity': initiative.registrationInfo?.validity || '',
          'Quantity': initiative.registrationInfo?.quantity || '',
          'Remarks': initiative.registrationInfo?.remarks || '',
          'Created At': initiative.createdAt ? new Date(initiative.createdAt).toLocaleDateString() : ''
        }));

        // Create worksheet with summary at top and detailed data below
        const worksheet = XLSX.utils.json_to_sheet([locationSummary], { header: Object.keys(locationSummary) });
        
        // Add empty row
        XLSX.utils.sheet_add_json(worksheet, [{}], { skipHeader: true, origin: -1 });
        
        // Add detailed data headers
        const detailHeaders = ['DETAILED INITIATIVES DATA'];
        XLSX.utils.sheet_add_json(worksheet, [{ 'Title': 'DETAILED INITIATIVES DATA' }], { skipHeader: true, origin: -1 });
        
        // Add detailed initiatives data
        XLSX.utils.sheet_add_json(worksheet, locationData, { skipHeader: false, origin: -1 });

        // Sanitize sheet name (Excel sheet names have restrictions)
        const sanitizedSheetName = locationName.replace(/[\\\/\?\*\[\]:]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);
      });

      // Create analytics sheet
      const analyticsData = [
        { 'Metric': 'Total Locations', 'Value': locations.length },
        { 'Metric': 'Locations with Initiatives', 'Value': Object.keys(locationGroups).length },
        { 'Metric': 'Total Initiatives', 'Value': filteredInitiatives.length },
        { 'Metric': 'Active Initiatives', 'Value': filteredInitiatives.filter(i => i.status === 'Active').length },
        { 'Metric': 'Completed Initiatives', 'Value': filteredInitiatives.filter(i => i.status === 'Completed').length },
        { 'Metric': 'Planning Initiatives', 'Value': filteredInitiatives.filter(i => i.status === 'Planning').length },
        { 'Metric': 'Total Budget', 'Value': filteredInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0) },
        { 'Metric': 'Average Budget per Initiative', 'Value': filteredInitiatives.length > 0 ? Math.round(filteredInitiatives.reduce((sum, i) => sum + (i.budget || 0), 0) / filteredInitiatives.length) : 0 },
        { 'Metric': 'Total Applicable Initiatives', 'Value': filteredInitiatives.filter(i => i.applicable === 'Yes').length },
        { 'Metric': 'Total Registered Initiatives', 'Value': filteredInitiatives.filter(i => i.registrationInfo?.registered === 'Yes').length },
        { 'Metric': 'Overall Registration Rate', 'Value': filteredInitiatives.filter(i => i.applicable === 'Yes').length > 0 ? Math.round((filteredInitiatives.filter(i => i.registrationInfo?.registered === 'Yes').length / filteredInitiatives.filter(i => i.applicable === 'Yes').length) * 100) + '%' : '0%' },
        { 'Metric': 'Overall Completion Rate', 'Value': Math.round((filteredInitiatives.filter(i => i.status === 'Completed').length / filteredInitiatives.length) * 100) + '%' }
      ];

      const analyticsWorksheet = XLSX.utils.json_to_sheet(analyticsData);
      XLSX.utils.book_append_sheet(workbook, analyticsWorksheet, 'Analytics');

      // Download the Excel file
      const fileName = `Location_Wise_Initiatives_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('Error creating Excel file:', error);
      alert('Error creating Excel file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      if (userFilters.role && user.role !== userFilters.role) return false;
      if (userFilters.isActive !== '' && user.isActive !== (userFilters.isActive === 'true')) return false;
      if (userFilters.search && !user.name.toLowerCase().includes(userFilters.search.toLowerCase()) && 
          !user.email.toLowerCase().includes(userFilters.search.toLowerCase())) return false;
      return true;
    });
  };

  const getFilteredLocations = () => {
    return locations.filter(location => {
      if (locationFilters.isActive !== '' && location.isActive !== (locationFilters.isActive === 'true')) return false;
      if (locationFilters.search && !location.name.toLowerCase().includes(locationFilters.search.toLowerCase()) &&
          !location.description?.toLowerCase().includes(locationFilters.search.toLowerCase())) return false;
      return true;
    });
  };

  const getFilteredInitiatives = () => {
    return initiatives.filter(initiative => {
      if (initiativeFilters.status && initiative.status !== initiativeFilters.status) return false;
      if (initiativeFilters.category && initiative.category !== initiativeFilters.category) return false;
      if (initiativeFilters.location) {
        const locationMatch = typeof initiative.location === 'object' && initiative.location !== null
          ? (initiative.location as any).name === initiativeFilters.location
          : initiative.location === initiativeFilters.location;
        if (!locationMatch) return false;
      }
      if (initiativeFilters.search && 
          !initiative.title.toLowerCase().includes(initiativeFilters.search.toLowerCase()) &&
          !initiative.description?.toLowerCase().includes(initiativeFilters.search.toLowerCase())) return false;
      return true;
    });
  };

  const downloadUsers = async () => {
    setDownloading('users');
    try {
      const filteredUsers = getFilteredUsers();
      const headers = ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'];
      downloadCSV(filteredUsers, 'users', headers);
    } finally {
      setDownloading(null);
    }
  };

  const downloadLocations = async () => {
    setDownloading('locations');
    try {
      const filteredLocations = getFilteredLocations();
      const headers = ['Name', 'Description', 'Address', 'City', 'State', 'Zip Code', 'Status', 'Created At'];
      downloadCSV(filteredLocations, 'locations', headers);
    } finally {
      setDownloading(null);
    }
  };

  const downloadInitiatives = async () => {
    setDownloading('initiatives');
    try {
      const filteredInitiatives = getFilteredInitiatives();
      const headers = [
        'Title', 'Description', 'Category', 'Status', 'Location', 'Budget', 'Participants',
        'Start Date', 'End Date', 'Contact Person', 'Contact Email', 'Contact Phone',
        'Agency', 'Type of Permission', 'Applicable', 'Compliance Status', 'License Number', 'Validity', 'Created At'
      ];
      downloadCSV(filteredInitiatives, 'initiatives', headers);
    } finally {
      setDownloading(null);
    }
  };

  // Get unique values for filter options
  const uniqueRoles = [...new Set(users.map(user => user.role))];
  const uniqueStatuses = [...new Set(initiatives.map(init => init.status))];
  const uniqueCategories = [...new Set(initiatives.map(init => init.category))];
  const uniqueLocationNames = [...new Set(locations.map(loc => loc.name))];

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
          <button onClick={fetchData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const downloadOptions = [
    {
      title: 'Users',
      description: 'Export user details with roles and activity status',
      icon: Users,
      count: getFilteredUsers().length,
      totalCount: users.length,
      action: downloadUsers,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      downloadKey: 'users'
    },
    {
      title: 'Locations',
      description: 'Export location details including addresses and status',
      icon: MapPin,
      count: getFilteredLocations().length,
      totalCount: locations.length,
      action: downloadLocations,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      downloadKey: 'locations'
    },
    {
      title: 'Initiatives',
      description: 'Export initiatives with complete details and compliance info',
      icon: Building2,
      count: getFilteredInitiatives().length,
      totalCount: initiatives.length,
      action: downloadInitiatives,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      downloadKey: 'initiatives'
    },
    {
      title: 'Location-wise Excel',
      description: 'Export initiatives grouped by location in separate Excel sheets',
      icon: MapPin,
      count: getFilteredInitiatives().length,
      totalCount: initiatives.length,
      action: downloadLocationWiseExcel,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      downloadKey: 'location-wise'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Download className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Download Details</h2>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary flex items-center space-x-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Users Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Users ({getFilteredUsers().length}/{users.length})
          </h3>
        </div>
        
        {/* User Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={userFilters.role}
              onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
              className="input-field"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={userFilters.isActive}
              onChange={(e) => setUserFilters({...userFilters, isActive: e.target.value})}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={userFilters.search}
                onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
                placeholder="Search users..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <button
          onClick={downloadUsers}
          disabled={downloading === 'users'}
          className="btn-primary flex items-center space-x-2"
        >
          {downloading === 'users' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Download Users CSV ({getFilteredUsers().length} records)</span>
        </button>
      </div>

      {/* Locations Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-orange-600" />
            Locations ({getFilteredLocations().length}/{locations.length})
          </h3>
        </div>
        
        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={locationFilters.isActive}
              onChange={(e) => setLocationFilters({...locationFilters, isActive: e.target.value})}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={locationFilters.search}
                onChange={(e) => setLocationFilters({...locationFilters, search: e.target.value})}
                placeholder="Search locations..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <button
          onClick={downloadLocations}
          disabled={downloading === 'locations'}
          className="btn-primary flex items-center space-x-2"
        >
          {downloading === 'locations' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Download Locations CSV ({getFilteredLocations().length} records)</span>
        </button>
      </div>

      {/* Initiatives Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-green-600" />
            Initiatives ({getFilteredInitiatives().length}/{initiatives.length})
          </h3>
        </div>
        
        {/* Initiative Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={initiativeFilters.status}
              onChange={(e) => setInitiativeFilters({...initiativeFilters, status: e.target.value})}
              className="input-field"
            >
              <option value="">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={initiativeFilters.category}
              onChange={(e) => setInitiativeFilters({...initiativeFilters, category: e.target.value})}
              className="input-field"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={initiativeFilters.location}
              onChange={(e) => setInitiativeFilters({...initiativeFilters, location: e.target.value})}
              className="input-field"
            >
              <option value="">All Locations</option>
              {uniqueLocationNames.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={initiativeFilters.search}
                onChange={(e) => setInitiativeFilters({...initiativeFilters, search: e.target.value})}
                placeholder="Search initiatives..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <button
          onClick={downloadInitiatives}
          disabled={downloading === 'initiatives'}
          className="btn-primary flex items-center space-x-2"
        >
          {downloading === 'initiatives' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Download Initiatives CSV ({getFilteredInitiatives().length} records)</span>
        </button>
      </div>

      {/* New Location-wise Excel Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-purple-600" />
            Location-wise Excel Export ({getFilteredInitiatives().length} initiatives)
          </h3>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-purple-900 mb-2">Excel Export Features:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Summary sheet with all initiatives data</li>
            <li>• Separate sheet for each location with initiatives</li>
            <li>• Location-wise analytics and statistics</li>
            <li>• Registration and completion rates per location</li>
            <li>• Overall analytics summary sheet</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{locations.length}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {locations.filter(loc => 
                getFilteredInitiatives().some(init => 
                  (typeof init.location === 'object' ? (init.location as any)?._id : init.location) === loc._id
                )
              ).length}
            </div>
            <div className="text-sm text-gray-600">Locations with Data</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{getFilteredInitiatives().length}</div>
            <div className="text-sm text-gray-600">Total Initiatives</div>
          </div>
        </div>

        <button
          onClick={downloadLocationWiseExcel}
          disabled={downloading === 'location-wise'}
          className="btn-primary flex items-center space-x-2"
        >
          {downloading === 'location-wise' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Download Location-wise Excel ({getFilteredInitiatives().length} records)</span>
        </button>
      </div>

      {/* Download Instructions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Instructions</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <p>Apply filters to refine your data selection before downloading</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">2</span>
            </div>
            <p>Click download button to export filtered data in CSV format</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">3</span>
            </div>
            <p>Files include current date in filename and can be opened in Excel or Google Sheets</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">4</span>
            </div>
            <p>Use the refresh button to get the latest data before downloading</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-purple-600">5</span>
            </div>
            <p><strong>Location-wise Excel:</strong> Creates a comprehensive Excel file with separate sheets for each location, including summary data, detailed initiatives, and analytics</p>
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {downloadOptions.map((option, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{option.count}</div>
              <div className="text-sm text-gray-600">{option.title} (Filtered)</div>
              <div className="text-xs text-gray-500">Total: {option.totalCount}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            <span>Filters applied: 
              {Object.values({...userFilters, ...locationFilters, ...initiativeFilters})
                .filter(v => v !== '').length} active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadDetails;
import React from 'react';
import { Download, FileText, Users, MapPin, Calendar } from 'lucide-react';
import { mockWorkLocations, mockUsers, mockInitiatives } from '../data/mockData';

const DownloadDetails: React.FC = () => {
  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '')];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadWorkLocations = () => {
    const headers = ['Name', 'Address', 'City', 'Country', 'EmployeeCount', 'CreatedAt'];
    downloadCSV(mockWorkLocations, 'work-locations', headers);
  };

  const downloadUsers = () => {
    const headers = ['Name', 'Email', 'Role', 'CreatedAt'];
    downloadCSV(mockUsers, 'users', headers);
  };

  const downloadInitiatives = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'CreatedBy', 'CreatedAt', 'UpdatedAt'];
    downloadCSV(mockInitiatives, 'initiatives', headers);
  };

  const downloadOptions = [
    {
      title: 'Work Locations',
      description: 'Export all work location details including addresses and employee counts',
      icon: MapPin,
      count: mockWorkLocations.length,
      action: downloadWorkLocations,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Users',
      description: 'Export all system users with their roles and registration dates',
      icon: Users,
      count: mockUsers.length,
      action: downloadUsers,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Initiatives',
      description: 'Export all initiatives with status and priority information',
      icon: FileText,
      count: mockInitiatives.length,
      action: downloadInitiatives,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Download className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Download Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloadOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <div key={index} className={`${option.bgColor} border border-gray-200 rounded-lg p-6`}>
              <div className="flex items-start space-x-4 mb-4">
                <div className={`${option.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{option.count} records available</span>
                  </div>
                </div>
              </div>
              <button
                onClick={option.action}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download CSV</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Download Instructions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Instructions</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <p>Click on any download button above to export data in CSV format</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">2</span>
            </div>
            <p>The file will be automatically downloaded to your default download folder</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">3</span>
            </div>
            <p>Open the CSV file in Excel, Google Sheets, or any spreadsheet application</p>
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{mockWorkLocations.length}</div>
            <div className="text-sm text-gray-600">Work Locations</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{mockUsers.length}</div>
            <div className="text-sm text-gray-600">System Users</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{mockInitiatives.length}</div>
            <div className="text-sm text-gray-600">Initiatives</div>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DownloadDetails;
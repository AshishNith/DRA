import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Users, Building } from 'lucide-react';
import { mockWorkLocations } from '../data/mockData';
import { WorkLocation } from '../types';

const WorkLocations: React.FC = () => {
  const [locations, setLocations] = useState<WorkLocation[]>(mockWorkLocations);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    employeeCount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      setLocations(locs =>
        locs.map(loc =>
          loc.id === editingLocation.id
            ? { ...loc, ...formData }
            : loc
        )
      );
    } else {
      const newLocation: WorkLocation = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLocations([...locations, newLocation]);
    }
    resetForm();
  };

  const handleEdit = (location: WorkLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      country: location.country,
      employeeCount: location.employeeCount,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this work location?')) {
      setLocations(locs => locs.filter(loc => loc.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', city: '', country: '', employeeCount: 0 });
    setEditingLocation(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Work Locations</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Location</span>
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingLocation ? 'Edit Work Location' : 'Add New Work Location'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Count
                </label>
                <input
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingLocation ? 'Update Location' : 'Add Location'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div key={location.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                  <p className="text-sm text-gray-500">{location.city}, {location.country}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{location.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{location.employeeCount} employees</span>
              </div>
              <div className="text-xs text-gray-500">
                Added on {location.createdAt}
              </div>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work locations</h3>
          <p className="text-gray-500 mb-4">Start by adding your first work location</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add First Location
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkLocations;
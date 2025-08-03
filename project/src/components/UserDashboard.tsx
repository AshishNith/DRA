import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Plus, Edit, Trash2, Eye, Calendar, Flag } from 'lucide-react';
import { mockInitiatives } from '../data/mockData';
import { Initiative } from '../types';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>(
    mockInitiatives.filter(initiative => initiative.createdBy === user?.id)
  );
  const [showForm, setShowForm] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [viewingInitiative, setViewingInitiative] = useState<Initiative | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'active' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleAddInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    const newInitiative: Initiative = {
      id: Date.now().toString(),
      ...formData,
      createdBy: user?.id || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setInitiatives([...initiatives, newInitiative]);
    resetForm();
  };

  const handleEditInitiative = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setFormData({
      title: initiative.title,
      description: initiative.description,
      status: initiative.status,
      priority: initiative.priority,
    });
    setShowForm(true);
  };

  const handleUpdateInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInitiative) {
      setInitiatives(initiatives.map(initiative =>
        initiative.id === editingInitiative.id
          ? { ...initiative, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : initiative
      ));
      resetForm();
    }
  };

  const handleDeleteInitiative = (id: string) => {
    if (window.confirm('Are you sure you want to delete this initiative?')) {
      setInitiatives(initiatives.filter(initiative => initiative.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'draft', priority: 'medium' });
    setEditingInitiative(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">My Initiatives</h3>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Initiative</span>
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h4 className="text-lg font-medium mb-4">
            {editingInitiative ? 'Edit Initiative' : 'Add New Initiative'}
          </h4>
          <form onSubmit={editingInitiative ? handleUpdateInitiative : handleAddInitiative} className="space-y-4">
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
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingInitiative ? 'Update Initiative' : 'Add Initiative'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initiatives.map((initiative) => (
          <div key={initiative.id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-gray-900 line-clamp-2">{initiative.title}</h4>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => setViewingInitiative(initiative)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditInitiative(initiative)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteInitiative(initiative.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{initiative.description}</p>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(initiative.status)}`}>
                {initiative.status}
              </span>
              <div className="flex items-center space-x-1">
                <Flag className="h-3 w-3 text-gray-400" />
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(initiative.priority)}`}>
                  {initiative.priority}
                </span>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Updated {initiative.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {initiatives.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No initiatives yet</h3>
          <p className="text-gray-500 mb-4">Start by creating your first initiative</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add Your First Initiative
          </button>
        </div>
      )}

      {viewingInitiative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{viewingInitiative.title}</h3>
                <button
                  onClick={() => setViewingInitiative(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{viewingInitiative.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                    <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(viewingInitiative.status)}`}>
                      {viewingInitiative.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Priority</h4>
                    <span className={`text-sm px-3 py-1 rounded-full ${getPriorityColor(viewingInitiative.priority)}`}>
                      {viewingInitiative.priority}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span> {viewingInitiative.createdAt}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {viewingInitiative.updatedAt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
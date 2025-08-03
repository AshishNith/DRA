import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield, User } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { User as UserType } from '../types';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(mockUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setFormData({ name: '', email: '', role: 'user' });
    setShowAddForm(false);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowAddForm(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'user' });
      setShowAddForm(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'user' });
    setEditingUser(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">User Management</h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {showAddForm && (
        <div className="card p-6">
          <h4 className="text-lg font-medium mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h4>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  {user.role === 'admin' ? (
                    <Shield className="h-5 w-5 text-purple-600" />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-gray-500">
                Added {user.createdAt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
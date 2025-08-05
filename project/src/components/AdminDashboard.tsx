import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Shield, User, X, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { User as UserType } from '../services/api';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'manager',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await apiService.getUsers({ limit: 100 });
      setUsers(fetchedUsers);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // For adding users, we would need a different endpoint since loginUser is for authentication
      // This is a placeholder - you might want to create a dedicated admin user creation endpoint
      const newUserData = {
        uid: `user_${Date.now()}`, // Generate a temporary UID
        name: formData.name,
        email: formData.email,
        imageURL: ''
      };
      
      await apiService.loginUser(newUserData);
      await fetchUsers(); // Refresh the list
      setFormData({ name: '', email: '', role: 'user' });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    }
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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      try {
        await apiService.updateUser(editingUser.uid, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
        await fetchUsers(); // Refresh the list
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'user' });
        setShowAddForm(false);
      } catch (err: any) {
        setError(err.message || 'Failed to update user');
      }
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await apiService.deleteUser(uid);
        await fetchUsers(); // Refresh the list
      } catch (err: any) {
        setError(err.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'user' });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">User Management</h3>
          <span className="text-sm text-gray-500">({users.length} users)</span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

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
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'manager' })}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
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
          <div 
            key={user.uid} 
            className="card p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleUserClick(user)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100' : 
                  user.role === 'manager' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {user.role === 'admin' ? (
                    <Shield className="h-5 w-5 text-purple-600" />
                  ) : user.role === 'manager' ? (
                    <Users className="h-5 w-5 text-orange-600" />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEditUser(user)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.uid)}
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
                  : user.role === 'manager'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Last login: {formatDate(user.lastLogin)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Get started by adding your first user.</p>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-full ${
                  selectedUser.role === 'admin' ? 'bg-purple-100' : 
                  selectedUser.role === 'manager' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {selectedUser.role === 'admin' ? (
                    <Shield className="h-8 w-8 text-purple-600" />
                  ) : selectedUser.role === 'manager' ? (
                    <Users className="h-8 w-8 text-orange-600" />
                  ) : (
                    <User className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${selectedUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-500">
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedUser.uid}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : selectedUser.role === 'manager'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Last Login
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedUser.lastLogin).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Account Created
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Last Updated
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    handleEditUser(selectedUser);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit User</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    handleDeleteUser(selectedUser.uid);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Deactivate User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
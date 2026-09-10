import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Filter, 
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Award as AwardIcon } from 'lucide-react';
import { distributorAPI } from '../../api/distributors';
import { userAPI } from '../../api/users';
import { ViewModal, EditModal, DeleteModal } from '../../components/modals';
import type { Distributor, User as UserType } from '../../types';

interface DistributorStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  totalCGV: number;
  totalPBV: number;
}

// Add Distributor Modal Component
interface AddDistributorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const AddDistributorModal: React.FC<AddDistributorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    rank: 'Associate',
    upline_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<UserType[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadDistributors();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setLoadError(null);
    try {
      const response = await userAPI.getNonDistributors({ status: 'active' });
      let usersData: UserType[] = [];
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response && response.results) {
        usersData = response.results;
      }
      
      const availableUsers = usersData.filter(
        (user: UserType) => user.user_type !== 'distributor' && user.user_type !== 'admin'
      );
      setUsers(availableUsers);
      if (availableUsers.length === 0) {
        setLoadError('No available users found. Users must register first.');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setLoadError(error.response?.data?.error || 'Failed to load users.');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDistributors = async () => {
    setLoadingDistributors(true);
    try {
      const data = await distributorAPI.getAll();
      setDistributors(data);
    } catch (error) {
      console.error('Error loading distributors:', error);
      setDistributors([]);
    } finally {
      setLoadingDistributors(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'user_id' && value) {
      const user = users.find(u => u.id === parseInt(value));
      setSelectedUser(user || null);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.user_id) {
      newErrors.user_id = 'Please select a user';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave({
        user_id: parseInt(formData.user_id),
        rank: formData.rank,
        upline_id: formData.upline_id ? parseInt(formData.upline_id) : null,
      });
      onClose();
      setFormData({
        user_id: '',
        rank: 'Associate',
        upline_id: '',
      });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error adding distributor:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">Add Distributor</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              title="Refresh users"
            >
              <RefreshCw size={18} className={`text-gray-500 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Registered User <span className="text-red-500">*</span>
            </label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                errors.user_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a registered user</option>
              {loadingUsers ? (
                <option value="" disabled>Loading users...</option>
              ) : users.length === 0 ? (
                <option value="" disabled>No available users found</option>
              ) : (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email} - {user.email}
                  </option>
                ))
              )}
            </select>
            {errors.user_id && <p className="text-sm text-red-500 mt-1">{errors.user_id}</p>}
            {loadError && <p className="text-sm text-red-500 mt-1">{loadError}</p>}
          </div>

          {selectedUser && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-gray-500">Selected User</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">
                  {selectedUser.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{selectedUser.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  <p className="text-xs text-gray-400">Status: {selectedUser.status}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Rank
            </label>
            <select
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="Associate">Associate</option>
              <option value="Builder">Builder</option>
              <option value="Leader">Leader</option>
              <option value="Senior Leader">Senior Leader</option>
              <option value="Executive">Executive</option>
              <option value="Manager">Manager</option>
              <option value="Senior Manager">Senior Manager</option>
              <option value="Director">Director</option>
              <option value="Crown Director">Crown Director</option>
              <option value="Royal Crown Director">Royal Crown Director</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upline (Optional)
            </label>
            <select
              name="upline_id"
              value={formData.upline_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="">No upline (Top level)</option>
              {loadingDistributors ? (
                <option value="" disabled>Loading distributors...</option>
              ) : distributors.length === 0 ? (
                <option value="" disabled>No distributors available</option>
              ) : (
                distributors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.rank})
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-400 mt-1">Select the sponsor for this distributor</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-amber-100/30">
            <button
              type="submit"
              disabled={isLoading || users.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  Convert to Distributor
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Distributors Component
const Distributors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [stats, setStats] = useState<DistributorStats>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalCGV: 0,
    totalPBV: 0,
  });
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('access_token');

  const loadDistributors = async () => {
    setError(null);
    setLoading(true);
    try {
      // Check authentication
      if (!isAuthenticated) {
        setError('Please login to view distributors');
        setLoading(false);
        return;
      }

      console.log('Fetching distributors...');
      const data = await distributorAPI.getAll();
      console.log('Distributors data:', data);
      console.log('Number of distributors:', data.length);
      
      if (data.length > 0) {
        console.log('First distributor:', data[0]);
        console.log('First distributor name:', data[0].full_name);
      }
      
      setDistributors(data);
      
      const active = data.filter(d => d.user?.status === 'active').length;
      const pending = data.filter(d => d.user?.status === 'pending').length;
      const inactive = data.filter(d => d.user?.status === 'inactive' || d.user?.status === 'banned').length;
      const totalCGV = data.reduce((sum, d) => sum + Number(d.cgv || 0), 0);
      const totalPBV = data.reduce((sum, d) => sum + Number(d.pbv || 0), 0);

      setStats({
        total: data.length,
        active,
        pending,
        inactive,
        totalCGV,
        totalPBV,
      });
      
      console.log('Stats calculated:', {
        total: data.length,
        active,
        pending,
        inactive,
        totalCGV,
        totalPBV,
      });
    } catch (err: any) {
      console.error('Error loading distributors:', err);
      
      let errorMessage = 'Failed to load distributors.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        errorMessage = 'You don\'t have permission to view distributors.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Check your API configuration.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDistributors([]);
      setStats({
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0,
        totalCGV: 0,
        totalPBV: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributors();
  }, []);

  const filteredDistributors = distributors.filter(d => {
    const matchesSearch = d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = filterRank === 'All' || d.rank === filterRank;
    const matchesStatus = filterStatus === 'All' || d.user?.status === filterStatus.toLowerCase();
    return matchesSearch && matchesRank && matchesStatus;
  });

  const handleView = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setViewModalOpen(true);
  };

  const handleEdit = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setEditModalOpen(true);
  };

  const handleDelete = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setDeleteModalOpen(true);
  };

  const handleAdd = () => {
    if (!isAuthenticated) {
      setError('Please login to add distributors');
      return;
    }
    setAddModalOpen(true);
  };

  const handleSaveAdd = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Creating distributor with data:', data);
      await distributorAPI.create(data);
      await loadDistributors();
      setAddModalOpen(false);
    } catch (err: any) {
      console.error('Error adding distributor:', err);
      let errorMessage = 'Failed to add distributor. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Updating distributor with data:', data);
      await distributorAPI.update(data.id, data);
      await loadDistributors();
      setEditModalOpen(false);
    } catch (err: any) {
      console.error('Error updating distributor:', err);
      let errorMessage = 'Failed to update distributor. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDistributor) return;
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Deleting distributor:', selectedDistributor.id);
      await distributorAPI.delete(selectedDistributor.id);
      await loadDistributors();
      setDeleteModalOpen(false);
      setSelectedDistributor(null);
    } catch (err: any) {
      console.error('Error deleting distributor:', err);
      let errorMessage = 'Failed to delete distributor. Please try again.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rankColors: Record<string, string> = {
    'Royal Crown Director': 'bg-amber-100 text-amber-700 border-amber-300',
    'Crown Director': 'bg-purple-100 text-purple-700 border-purple-300',
    'Director': 'bg-blue-100 text-blue-700 border-blue-300',
    'Senior Manager': 'bg-green-100 text-green-700 border-green-300',
    'Manager': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Executive': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'Senior Leader': 'bg-cyan-100 text-cyan-700 border-cyan-300',
    'Leader': 'bg-sky-100 text-sky-700 border-sky-300',
    'Builder': 'bg-orange-100 text-orange-700 border-orange-300',
    'Associate': 'bg-gray-100 text-gray-600 border-gray-300',
  };

  const statusColors: Record<string, string> = {
    'active': 'bg-green-100 text-green-700',
    'inactive': 'bg-red-100 text-red-700',
    'pending': 'bg-yellow-100 text-yellow-700',
    'banned': 'bg-red-200 text-red-800',
  };

  const rankLevels = [
    'All',
    'Royal Crown Director',
    'Crown Director',
    'Director',
    'Senior Manager',
    'Manager',
    'Executive',
    'Senior Leader',
    'Leader',
    'Builder',
    'Associate'
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading distributors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Distributors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your OMA Flowers distributors network</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.total === 0 ? 'No distributors found' : `Total: ${stats.total} distributors`}
          </p>
          {!isAuthenticated && (
            <p className="text-xs text-red-500 mt-1">⚠️ Please login to manage distributors</p>
          )}
        </div>
        <button 
          onClick={handleAdd}
          disabled={!isAuthenticated}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium ${
            isAuthenticated 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <UserPlus size={16} />
          Add Distributor
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Distributors</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-600">{stats.active} Active</span>
                {stats.pending > 0 && (
                  <span className="text-xs text-yellow-600">{stats.pending} Pending</span>
                )}
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Users className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Distributors</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total CGV</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.totalCGV.toLocaleString()}</h3>
              <p className="text-xs text-gray-400 mt-1">Cumulative Group Volume</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <DollarSign className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total PBV</p>
              <h3 className="text-2xl font-bold text-purple-600">{stats.totalPBV}</h3>
              <p className="text-xs text-gray-400 mt-1">Personal Business Volume</p>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <AwardIcon className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search distributors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterRank}
          onChange={(e) => setFilterRank(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[160px]"
        >
          {rankLevels.map(rank => (
            <option key={rank} value={rank}>{rank}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
        </select>
        <button 
          onClick={loadDistributors}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter size={18} className="text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Distributors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">PBV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">CGV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Bonus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredDistributors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || filterRank !== 'All' || filterStatus !== 'All' 
                      ? 'No distributors match your filters' 
                      : stats.total === 0 ? 'No distributors found. Add your first distributor!' : 'No distributors found'}
                  </td>
                </tr>
              ) : (
                filteredDistributors.map((distributor) => (
                  <tr key={distributor.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                          {distributor.full_name?.split(' ').map(n => n[0]).join('') || 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{distributor.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{distributor.user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${rankColors[distributor.rank] || 'bg-gray-100 text-gray-600'}`}>
                        {distributor.rank || 'Associate'}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">Level {distributor.level || 1}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{distributor.pbv || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{distributor.cgv?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                      <span className="font-medium text-amber-600">{distributor.bonus_percentage || 0}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[distributor.user?.status] || 'bg-gray-100 text-gray-600'}`}>
                        {distributor.user?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleView(distributor)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="text-gray-400 hover:text-amber-600" />
                        </button>
                        <button 
                          onClick={() => handleEdit(distributor)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-gray-400 hover:text-amber-600" />
                        </button>
                        <button 
                          onClick={() => handleDelete(distributor)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredDistributors.length} of {stats.total} distributors</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Add Distributor Modal */}
      <AddDistributorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveAdd}
        isLoading={isSubmitting}
      />

      {/* View Modal */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Distributor Details"
      >
        {selectedDistributor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl">
                {selectedDistributor.full_name?.split(' ').map(n => n[0]).join('') || 'D'}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">{selectedDistributor.full_name || 'Unknown'}</h4>
                <p className="text-sm text-amber-600">{selectedDistributor.rank || 'Associate'} • Level {selectedDistributor.level || 1}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">PBV</p>
                <p className="text-lg font-bold text-amber-700">{selectedDistributor.pbv || 0}</p>
              </div>
              <div className="bg-blue-50/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">CGV</p>
                <p className="text-lg font-bold text-blue-700">{selectedDistributor.cgv?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-green-50/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Bonus</p>
                <p className="text-lg font-bold text-green-700">{selectedDistributor.bonus_percentage || 0}%</p>
              </div>
              <div className="bg-purple-50/50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p className={`text-lg font-bold ${statusColors[selectedDistributor.user?.status] || 'text-gray-600'}`}>
                  {selectedDistributor.user?.status || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="border-t border-amber-100/30 pt-4">
              <h5 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h5>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Email:</span> {selectedDistributor.user?.email || 'N/A'}</p>
                <p><span className="text-gray-500">Phone:</span> {selectedDistributor.user?.phone || 'N/A'}</p>
                <p><span className="text-gray-500">Location:</span> {selectedDistributor.user?.city || 'N/A'}, {selectedDistributor.user?.region || 'N/A'}, {selectedDistributor.user?.country || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t border-amber-100/30 pt-4">
              <h5 className="text-sm font-medium text-gray-500 mb-2">Network</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Downline</p>
                  <p className="text-sm font-medium">{selectedDistributor.downline_count || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Active Downline</p>
                  <p className="text-sm font-medium">{selectedDistributor.active_downline_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-amber-100/30 pt-4">
              <p className="text-xs text-gray-500">Joined: {selectedDistributor.join_date ? new Date(selectedDistributor.join_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        )}
      </ViewModal>

      {/* Edit Modal */}


<EditModal
  isOpen={editModalOpen}
  onClose={() => setEditModalOpen(false)}
  onSave={handleSaveEdit}
  title="Edit Distributor"
  initialData={selectedDistributor ? {
    id: selectedDistributor.id,
    rank: selectedDistributor.rank || 'Associate',
    level: selectedDistributor.level || 1,
    pbv: selectedDistributor.pbv || 0,
    cgv: selectedDistributor.cgv || 0,
    bonus_percentage: selectedDistributor.bonus_percentage || 0,
    // Do NOT include user_id here
  } : {}}
  isLoading={isSubmitting}
  fields={[
    {
      name: 'rank',
      label: 'Rank',
      type: 'select',
      required: true,
      options: [
        { value: 'Associate', label: 'Associate' },
        { value: 'Builder', label: 'Builder' },
        { value: 'Leader', label: 'Leader' },
        { value: 'Senior Leader', label: 'Senior Leader' },
        { value: 'Executive', label: 'Executive' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Senior Manager', label: 'Senior Manager' },
        { value: 'Director', label: 'Director' },
        { value: 'Crown Director', label: 'Crown Director' },
        { value: 'Royal Crown Director', label: 'Royal Crown Director' },
      ]
    },
    {
      name: 'pbv',
      label: 'PBV',
      type: 'number',
      required: true,
    },
    {
      name: 'cgv',
      label: 'CGV',
      type: 'number',
      required: true,
    },
    {
      name: 'bonus_percentage',
      label: 'Bonus %',
      type: 'number',
      required: true,
    },
    {
      name: 'level',
      label: 'Level',
      type: 'number',
      required: false,
    },
  ]}
/>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Distributor"
        message="Are you sure you want to delete this distributor? This action cannot be undone."
        itemName={selectedDistributor?.full_name}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Distributors;
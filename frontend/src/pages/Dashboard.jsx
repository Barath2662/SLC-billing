import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiDollarSign, FiCalendar, FiPlusCircle, FiSearch } from 'react-icons/fi';
import { billAPI } from '../services/api';
import BillTable from '../components/BillTable';
import { formatCurrency } from '../utils/calculations';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await billAPI.getDashboard();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome to Srii Lakshmi Cab Billing System</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link to="/create-bill" className="btn-primary flex items-center space-x-2">
            <FiPlusCircle />
            <span>New Bill</span>
          </Link>
          <Link to="/search-bills" className="btn-secondary flex items-center space-x-2">
            <FiSearch />
            <span>Search</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiFileText className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Bills</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBills || 0}</p>
          </div>
        </div>

        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiDollarSign className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
          </div>
        </div>

        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FiCalendar className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">This Month's Bills</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.monthlyBillCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bills</h2>
          <Link to="/search-bills" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
            View All →
          </Link>
        </div>
        <BillTable bills={stats?.recentBills || []} />
      </div>
    </div>
  );
}

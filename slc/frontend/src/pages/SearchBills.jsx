import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { billAPI } from '../services/api';
import BillTable from '../components/BillTable';
import toast from 'react-hot-toast';

export default function SearchBills() {
  const [query, setQuery] = useState('');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', customerName: '', billFrom: '', billTo: '' });
  const [filterActive, setFilterActive] = useState(false);

  // Load all bills on mount
  useEffect(() => {
    fetchAllBills(1);
  }, []);

  const fetchAllBills = async (p) => {
    setLoading(true);
    try {
      const res = await billAPI.getAll(p, 20);
      setBills(res.data.bills);
      setPagination(res.data.pagination);
      setPage(p);
    } catch (err) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      fetchAllBills(1);
      setFilterActive(false);
      return;
    }
    setLoading(true);
    setFilterActive(false);
    try {
      const res = await billAPI.search(query);
      setBills(res.data.bills);
      setPagination(null);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleFilter = async () => {
    const hasFilter = filters.dateFrom || filters.dateTo || filters.customerName || filters.billFrom || filters.billTo;
    if (!hasFilter) {
      toast('Please set at least one filter', { icon: 'ℹ️' });
      return;
    }
    setLoading(true);
    setFilterActive(true);
    setQuery('');
    try {
      const params = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.customerName) params.customerName = filters.customerName;
      if (filters.billFrom) params.billFrom = filters.billFrom;
      if (filters.billTo) params.billTo = filters.billTo;
      const res = await billAPI.filter(params);
      setBills(res.data.bills);
      setPagination(null);
    } catch (err) {
      toast.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', customerName: '', billFrom: '', billTo: '' });
    setFilterActive(false);
    fetchAllBills(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = async (billNumber) => {
    if (!window.confirm(`Are you sure you want to delete bill ${billNumber}?`)) return;
    try {
      await billAPI.delete(billNumber);
      toast.success('Bill deleted successfully');
      if (filterActive) {
        handleFilter();
      } else if (query.trim()) {
        handleSearch();
      } else {
        fetchAllBills(page);
      }
    } catch (err) {
      toast.error('Failed to delete bill');
    }
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Bills</h1>
        <p className="text-gray-500 text-sm mt-1">Search by bill number, customer name, or vehicle number</p>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search by bill number, customer name, vehicle number..."
              className="input-field pl-10"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary flex items-center justify-center space-x-2">
            <FiSearch />
            <span>Search</span>
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary flex items-center justify-center space-x-2 ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
          >
            <FiFilter />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card mb-4 border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><FiFilter /> Filter Bills</h2>
            {filterActive && (
              <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                <FiX /> Clear filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter('dateFrom', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter('dateTo', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => setFilter('customerName', e.target.value)}
                placeholder="e.g. ABC Company"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number From</label>
              <input
                type="text"
                value={filters.billFrom}
                onChange={(e) => setFilter('billFrom', e.target.value)}
                placeholder="e.g. 26-001"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number To</label>
              <input
                type="text"
                value={filters.billTo}
                onChange={(e) => setFilter('billTo', e.target.value)}
                placeholder="e.g. 26-050"
                className="input-field"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleFilter} className="btn-primary flex items-center gap-2">
              <FiFilter /> Apply Filters
            </button>
            {filterActive && (
              <button onClick={clearFilters} className="btn-secondary">Reset</button>
            )}
          </div>
        </div>
      )}

      {filterActive && (
        <div className="mb-3 text-sm text-primary-700 font-medium">
          Showing filtered results — <button onClick={clearFilters} className="underline">clear filters</button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900"></div>
        </div>
      ) : (
        <div className="card">
          <BillTable bills={bills} onDelete={handleDelete} />

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} bills)
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchAllBills(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchAllBills(page + 1)}
                  disabled={page >= pagination.pages}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


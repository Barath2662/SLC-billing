import { useState, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import { billAPI } from '../services/api';
import BillTable from '../components/BillTable';
import toast from 'react-hot-toast';

export default function SearchBills() {
  const [query, setQuery] = useState('');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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
      return;
    }

    setLoading(true);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = async (billNumber) => {
    if (!window.confirm(`Are you sure you want to delete bill ${billNumber}?`)) return;

    try {
      await billAPI.delete(billNumber);
      toast.success('Bill deleted successfully');
      if (query.trim()) {
        handleSearch();
      } else {
        fetchAllBills(page);
      }
    } catch (err) {
      toast.error('Failed to delete bill');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Bills</h1>
        <p className="text-gray-500 text-sm mt-1">Search by bill number, customer name, or vehicle number</p>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
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
        </div>
      </div>

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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BillForm from '../components/BillForm';
import { billAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CreateBill() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await billAPI.create(data);
      toast.success(`Bill ${res.data.bill.billNumber} created successfully!`);
      navigate(`/view-bill/${res.data.bill.billNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to generate a new invoice</p>
      </div>
      <BillForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

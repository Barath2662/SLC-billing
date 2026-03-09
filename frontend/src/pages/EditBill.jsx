import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BillForm from '../components/BillForm';
import { billAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function EditBill() {
  const { billNumber } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBill();
  }, [billNumber]);

  const fetchBill = async () => {
    try {
      const res = await billAPI.getByNumber(billNumber);
      const b = res.data.bill;
      // Format dates for form inputs
      setBill({
        ...b,
        date: b.date ? new Date(b.date).toISOString().split('T')[0] : '',
        tripDate: b.tripDate ? new Date(b.tripDate).toISOString().split('T')[0] : '',
        startingKms: b.startingKms ?? '',
        closingKms: b.closingKms ?? '',
        chargePerKm: b.chargePerKm ?? '',
        chargePerDay: b.chargePerDay ?? '',
        fuelCharges: b.fuelCharges ?? '',
        localTripCharges: b.localTripCharges ?? '',
        freeKms: b.freeKms ?? '',
        waitingCharges: b.waitingCharges ?? '',
        nightHaltCharges: b.nightHaltCharges ?? '',
        driverBata: b.driverBata ?? '',
        permitCharges: b.permitCharges ?? '',
        otherExpenses: b.otherExpenses ?? '',
      });
    } catch (err) {
      toast.error('Bill not found');
      navigate('/search-bills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await billAPI.update(billNumber, data);
      toast.success('Bill updated successfully!');
      navigate(`/view-bill/${billNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update bill');
    } finally {
      setSaving(false);
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Bill - {billNumber}</h1>
        <p className="text-gray-500 text-sm mt-1">Update the bill details</p>
      </div>
      {bill && <BillForm onSubmit={handleSubmit} defaultValues={bill} isEdit loading={saving} />}
    </div>
  );
}

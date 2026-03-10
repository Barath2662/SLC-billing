import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  calculateTotalKms,
  calculateTotalHours,
  calculateChargeableKms,
  calculateTotalAmount,
  calculatePayableAmount,
  numberToWords,
} from '../utils/calculations';
import { billAPI } from '../services/api';

function InputField({ label, name, type = 'text', required = false, readOnly = false, placeholder = '', register, errors }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name, required ? { required: `${label} is required` } : {})}
        className={`input-field ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors[name] ? 'border-red-500 ring-red-500' : ''}`}
        readOnly={readOnly}
        placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );
}

export default function BillForm({ onSubmit, defaultValues, isEdit = false, loading = false }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || {
      customerName: '',
      travelDetails: '',
      gstin: '',
      date: new Date().toISOString().split('T')[0],
      vehicleNumber: '',
      multipleDays: false,
      tripDate: '',
      tripEndDate: '',
      startingTime: '',
      closingTime: '',
      totalHours: 0,
      startingKms: '',
      closingKms: '',
      totalKms: 0,
      chargePerKm: '',
      chargePerHour: '',
      freeKms: '',
      chargeableKms: 0,
      chargePerDay: '',
      tollCharges: '',
      nightHaltCharges: '',
      driverBata: '',
      permitCharges: '',
      otherExpenses: '',
      totalAmount: 0,
      advance: '',
      payableAmount: 0,
      rupeesInWords: '',
    },
  });

  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState(defaultValues?.customerName || '');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    billAPI.getCustomers()
      .then((res) => setCustomers(res.data.customers || []))
      .catch(() => {});
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    setCustomerSearch(customer.name);
    setValue('customerName', customer.name);
    setValue('gstin', customer.gstin || '');
    setShowDropdown(false);
  };

  const customerReg = register('customerName', { required: 'Customer name is required' });

  const watchedFields = watch();

  // Auto-calculate fields
  useEffect(() => {
    const totalKms = calculateTotalKms(watchedFields.startingKms, watchedFields.closingKms);
    const totalHours = calculateTotalHours(
      watchedFields.startingTime, watchedFields.closingTime,
      watchedFields.multipleDays, watchedFields.tripDate, watchedFields.tripEndDate
    );
    const chargeableKms = calculateChargeableKms(totalKms, watchedFields.freeKms);

    setValue('totalKms', totalKms);
    setValue('totalHours', totalHours);
    setValue('chargeableKms', chargeableKms);

    const totalAmount = calculateTotalAmount({
      ...watchedFields,
      totalKms,
      totalHours,
      chargeableKms,
    });
    const advance = parseFloat(watchedFields.advance) || 0;
    const payableAmount = calculatePayableAmount(totalAmount, advance);
    setValue('totalAmount', totalAmount);
    setValue('payableAmount', payableAmount);
    setValue('rupeesInWords', numberToWords(totalAmount));
  }, [
    watchedFields.startingKms, watchedFields.closingKms,
    watchedFields.startingTime, watchedFields.closingTime,
    watchedFields.multipleDays, watchedFields.tripDate, watchedFields.tripEndDate,
    watchedFields.chargePerKm, watchedFields.chargePerHour, watchedFields.freeKms,
    watchedFields.chargePerDay,
    watchedFields.tollCharges, watchedFields.nightHaltCharges, watchedFields.driverBata,
    watchedFields.permitCharges, watchedFields.otherExpenses,
    watchedFields.advance,
    setValue,
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Name with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...customerReg}
              value={customerSearch}
              onChange={(e) => {
                customerReg.onChange(e);
                setCustomerSearch(e.target.value);
                setValue('customerName', e.target.value);
                setShowDropdown(true);
              }}
              onBlur={(e) => {
                customerReg.onBlur(e);
                setTimeout(() => setShowDropdown(false), 150);
              }}
              autoComplete="off"
              className={`input-field ${errors.customerName ? 'border-red-500 ring-red-500' : ''}`}
              placeholder="Type to search or enter new customer"
            />
            {errors.customerName && (
              <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
            )}
            {showDropdown && filteredCustomers.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <li
                    key={c.id}
                    onMouseDown={() => handleCustomerSelect(c)}
                    className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                  >
                    <span className="font-medium">{c.name}</span>
                    {c.gstin && <span className="text-gray-400 ml-2 text-xs">{c.gstin}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <InputField label="GSTIN" name="gstin" placeholder="Enter GSTIN (optional)" register={register} errors={errors} />
          <div className="md:col-span-2">
            <InputField label="Travel Details" name="travelDetails" placeholder="Enter travel details" register={register} errors={errors} />
          </div>
        </div>
      </div>

      {/* Invoice & Vehicle Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">
          Vehicle & Trip Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Date" name="date" type="date" register={register} errors={errors} />
          <InputField label="Vehicle Number" name="vehicleNumber" placeholder="e.g. TN 01 AB 1234" register={register} errors={errors} />
          {/* Multiple Days Checkbox */}
          <div className="flex items-center md:col-span-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 mt-5">
              <input
                type="checkbox"
                {...register('multipleDays')}
                className="w-4 h-4 accent-primary-700 cursor-pointer"
              />
              Multiple Days Trip
            </label>
          </div>
          {watchedFields.multipleDays ? (
            <>
              <InputField label="Trip Start Date" name="tripDate" type="date" register={register} errors={errors} />
              <InputField label="Trip End Date" name="tripEndDate" type="date" register={register} errors={errors} />
            </>
          ) : (
            <InputField label="Trip Date" name="tripDate" type="date" register={register} errors={errors} />
          )}
        </div>
      </div>

      {/* Trip Timing */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">
          Trip Timing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Starting Time" name="startingTime" type="time" register={register} errors={errors} />
          <InputField label="Closing Time" name="closingTime" type="time" register={register} errors={errors} />
          <InputField label="Total Hours" name="totalHours" type="number" readOnly register={register} errors={errors} />
        </div>
      </div>

      {/* Distance Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">
          Distance Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField label="Starting Kms" name="startingKms" type="number" placeholder="0" register={register} errors={errors} />
          <InputField label="Closing Kms" name="closingKms" type="number" placeholder="0" register={register} errors={errors} />
          <InputField label="Total Kms" name="totalKms" type="number" readOnly register={register} errors={errors} />
        </div>
      </div>

      {/* Charges */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">
          Charges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Free Kms" name="freeKms" type="number" placeholder="0" register={register} errors={errors} />
          <InputField label="Chargeable Kms" name="chargeableKms" type="number" readOnly register={register} errors={errors} />
          <InputField label="Charge per Km (₹)" name="chargePerKm" type="number" placeholder="0.00" register={register} errors={errors} />
          <InputField label="Charge per Hour (₹)" name="chargePerHour" type="number" placeholder="0.00" register={register} errors={errors} />
          <InputField label="Charge per Day (₹)" name="chargePerDay" type="number" placeholder="0.00" register={register} errors={errors} />
        </div>
      </div>

      {/* Additional Charges */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-900 mb-4 pb-2 border-b border-gray-200">
          Additional Charges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField label="Toll Charges (Rs.)" name="tollCharges" type="number" placeholder="0.00" register={register} errors={errors} />
          <InputField label="Night Halt Charges (Rs.)" name="nightHaltCharges" type="number" placeholder="0.00" register={register} errors={errors} />
          <InputField label="Driver Bata per Day (₹)" name="driverBata" type="number" placeholder="0.00" register={register} errors={errors} />
          <InputField label="Permit Charges (₹)" name="permitCharges" type="number" placeholder="0.00" register={register} errors={errors} />
          <InputField label="Other Expenses (₹)" name="otherExpenses" type="number" placeholder="0.00" register={register} errors={errors} />
        </div>
      </div>

      {/* Total */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-1">Total Amount (₹)</label>
            <input
              type="number"
              {...register('totalAmount')}
              className="input-field text-2xl font-bold text-primary-900 bg-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-1">Advance (₹)</label>
            <input
              type="number"
              {...register('advance')}
              className="input-field"
              placeholder="0.00"
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-1">Payable Amount (₹)</label>
            <input
              type="number"
              {...register('payableAmount')}
              className="input-field text-2xl font-bold text-green-700 bg-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-primary-900 mb-1">Rupees in Words</label>
            <input
              type="text"
              {...register('rupeesInWords')}
              className="input-field bg-white italic text-gray-600"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-3">
        <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-lg">
          {loading ? 'Saving...' : isEdit ? 'Update Bill' : 'Create Bill'}
        </button>
      </div>
    </form>
  );
}

import { Link } from 'react-router-dom';
import { FiEye, FiEdit, FiTrash2, FiFileText } from 'react-icons/fi';
import { formatDate, formatCurrency } from '../utils/calculations';

export default function BillTable({ bills, onDelete }) {
  if (!bills || bills.length === 0) {
    return (
      <div className="card text-center py-12">
        <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500 text-lg">No bills found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-primary-900 text-white">
            <th className="px-4 py-3 text-left text-sm font-medium">Bill No</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Vehicle</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
            <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bills.map((bill) => (
            <tr key={bill.billNumber} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link to={`/view-bill/${bill.billNumber}`} className="text-primary-700 font-medium hover:underline">
                  {bill.billNumber}
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(bill.date)}</td>
              <td className="px-4 py-3 text-sm text-gray-800 hidden sm:table-cell">{bill.customerName}</td>
              <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{bill.vehicleNumber || '-'}</td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                {formatCurrency(bill.totalAmount)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center space-x-2">
                  <Link
                    to={`/view-bill/${bill.billNumber}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <FiEye size={16} />
                  </Link>
                  <Link
                    to={`/edit-bill/${bill.billNumber}`}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit size={16} />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(bill.billNumber)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

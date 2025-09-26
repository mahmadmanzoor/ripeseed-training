import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { AdminCreditTransfer, AdminCreditTransfersResponse } from '../types/auth';
import { CreditCard, User, Calendar, DollarSign, ArrowRight, MessageSquare } from 'lucide-react';

const AdminCreditTransfersTable: React.FC = () => {
  const [creditTransfers, setCreditTransfers] = useState<AdminCreditTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditTransfers();
  }, []);

  const fetchCreditTransfers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<AdminCreditTransfersResponse>('/admin/credit-transfers');
      setCreditTransfers(response.data.creditTransfers);
    } catch (error) {
      console.error('Error fetching credit transfers:', error);
      setError('Failed to fetch credit transfers');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading credit transfers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCreditTransfers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Credit Transfers Management</h2>
        <button
          onClick={fetchCreditTransfers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transfer ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receiver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {creditTransfers.map((transfer) => (
              <tr key={transfer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {transfer.id.slice(-8)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-red-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.sender.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {transfer.sender.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 text-gray-400 mr-2" />
                    <User className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.receiver.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {transfer.receiver.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      ${transfer.amount.toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transfer.message ? (
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900 max-w-xs truncate">
                        {transfer.message}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No message</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(transfer.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creditTransfers.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No credit transfers found</p>
        </div>
      )}

      {/* Summary Stats */}
      {creditTransfers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Credit Transfer Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{creditTransfers.length}</div>
              <div className="text-sm text-gray-600">Total Transfers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${creditTransfers.reduce((sum, transfer) => sum + transfer.amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Amount Transferred</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${(creditTransfers.reduce((sum, transfer) => sum + transfer.amount, 0) / creditTransfers.length).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Average Transfer</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditTransfersTable;

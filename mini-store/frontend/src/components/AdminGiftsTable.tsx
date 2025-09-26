import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { AdminGift, AdminGiftsResponse } from '../types/auth';
import { Gift, User, Calendar, DollarSign, Package, MessageSquare } from 'lucide-react';

const AdminGiftsTable: React.FC = () => {
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<AdminGiftsResponse>('/admin/gifts');
      setGifts(response.data.gifts);
    } catch (error) {
      console.error('Error fetching gifts:', error);
      setError('Failed to fetch gifts');
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
        <span className="ml-2 text-gray-600">Loading gifts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchGifts}
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
        <h2 className="text-xl font-semibold text-gray-900">Gifts Management</h2>
        <button
          onClick={fetchGifts}
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
                Gift ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receiver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
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
            {gifts.map((gift) => (
              <tr key={gift.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {gift.id.slice(-8)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {gift.sender.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {gift.sender.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {gift.receiver.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {gift.receiver.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      Product #{gift.productId}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {gift.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      ${gift.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {gift.message ? (
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900 max-w-xs truncate">
                        {gift.message}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No message</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(gift.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {gifts.length === 0 && (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No gifts found</p>
        </div>
      )}

      {/* Summary Stats */}
      {gifts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Gift Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{gifts.length}</div>
              <div className="text-sm text-gray-600">Total Gifts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${gifts.reduce((sum, gift) => sum + gift.totalAmount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Gift Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {gifts.reduce((sum, gift) => sum + gift.quantity, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Items Gifted</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGiftsTable;

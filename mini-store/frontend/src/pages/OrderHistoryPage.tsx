import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import type { OrderHistoryItem } from '../types/auth';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const { fetchOrderHistory, user } = useAuthContext();

  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrderHistory();
        setOrders(response.orders);
        setTotal(response.total);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load order history');
        console.error('Error loading order history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrderHistory();
  }, [fetchOrderHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your order history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Orders</div>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                📦 Order History
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {total === 0 ? 'No orders yet' : `${total} order${total === 1 ? '' : 's'} found`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <div className="text-gray-600 text-xl font-semibold mb-4">No Orders Yet</div>
              <p className="text-gray-500 mb-6">Start shopping to see your order history here!</p>
              <a
                href="/products"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🛍️ Browse Products
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {order.product ? (
                        <img
                          src={order.product.thumbnail}
                          alt={order.product.title}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {order.product ? order.product.title : `Product ID: ${order.productId}`}
                          </h3>
                          {order.product && (
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                                {order.product.brand}
                              </span>
                              <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                                {order.product.category}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Quantity: <span className="font-medium">{order.quantity}</span></span>
                            <span>Ordered: <span className="font-medium">{formatDate(order.createdAt)}</span></span>
                          </div>
                        </div>

                        {/* Price and Status */}
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                          {order.product && (
                            <div className="text-sm text-gray-500">
                              {order.product.discountPercentage > 0 && (
                                <span className="text-red-500 line-through mr-2">
                                  ${(order.product.price * order.quantity).toFixed(2)}
                                </span>
                              )}
                              <span>After {order.product.discountPercentage > 0 ? `${order.product.discountPercentage}% discount` : 'no discount'}</span>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              ✅ Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {orders.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Order Summary</h3>
                <p className="text-gray-600">Total orders: {total}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Spent</div>
                <div className="text-2xl font-bold text-green-600">
                  ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;

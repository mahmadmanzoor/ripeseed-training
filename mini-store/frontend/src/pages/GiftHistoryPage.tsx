import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import type { GiftHistoryItem } from '../types/auth';

const GiftHistoryPage = () => {
  const [sentGifts, setSentGifts] = useState<GiftHistoryItem[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const { fetchGiftHistory, user } = useAuthContext();

  useEffect(() => {
    const loadGiftHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchGiftHistory();
        setSentGifts(response.sentGifts);
        setReceivedGifts(response.receivedGifts);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load gift history');
        console.error('Error loading gift history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGiftHistory();
  }, [fetchGiftHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderGiftItem = (gift: GiftHistoryItem, isReceived: boolean = false) => (
    <div key={gift.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {gift.product ? (
              <img
                src={gift.product.thumbnail}
                alt={gift.product.title}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 bg-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-2xl">🎁</span>
              </div>
            )}
          </div>

          {/* Gift Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {gift.product ? gift.product.title : `Product ID: ${gift.productId}`}
                </h3>
                {gift.product && (
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                      {gift.product.brand}
                    </span>
                    <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                      {gift.product.category}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>Quantity: <span className="font-medium">{gift.quantity}</span></span>
                  <span>{isReceived ? 'Received' : 'Sent'}: <span className="font-medium">{formatDate(gift.createdAt)}</span></span>
                </div>
                
                {/* Gift Message */}
                {gift.message && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                    <div className="text-sm text-purple-800">
                      <span className="font-medium">💌 Message: </span>
                      <span className="italic">"{gift.message}"</span>
                    </div>
                  </div>
                )}

                {/* Recipient/Sender Info */}
                <div className="text-sm text-gray-600">
                  {isReceived ? (
                    <span>From: <span className="font-medium text-purple-600">{gift.sender?.email}</span></span>
                  ) : (
                    <span>To: <span className="font-medium text-purple-600">{gift.receiver?.email}</span></span>
                  )}
                </div>
              </div>

              {/* Price and Status */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  ${gift.totalAmount.toFixed(2)}
                </div>
                {gift.product && (
                  <div className="text-sm text-gray-500">
                    {gift.product.discountPercentage > 0 && (
                      <span className="text-red-500 line-through mr-2">
                        ${(gift.product.price * gift.quantity).toFixed(2)}
                      </span>
                    )}
                    <span>After {gift.product.discountPercentage > 0 ? `${gift.product.discountPercentage}% discount` : 'no discount'}</span>
                  </div>
                )}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    isReceived 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}>
                    {isReceived ? '🎁 Received' : '✅ Sent'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your gift history...</p>
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
              <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Gifts</div>
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

  const currentGifts = activeTab === 'sent' ? sentGifts : receivedGifts;
  const totalSent = sentGifts.length;
  const totalReceived = receivedGifts.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎁 Gift History
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {totalSent === 0 && totalReceived === 0 
                  ? 'No gifts yet' 
                  : `${totalSent + totalReceived} gift${totalSent + totalReceived === 1 ? '' : 's'} total`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 border border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📤 Sent Gifts ({totalSent})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'received'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📥 Received Gifts ({totalReceived})
            </button>
          </div>
        </div>

        {/* Gift List */}
        {currentGifts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">
                {activeTab === 'sent' ? '📤' : '📥'}
              </div>
              <div className="text-gray-600 text-xl font-semibold mb-4">
                {activeTab === 'sent' ? 'No Gifts Sent Yet' : 'No Gifts Received Yet'}
              </div>
              <p className="text-gray-500 mb-6">
                {activeTab === 'sent' 
                  ? 'Start gifting products to see your sent gifts here!' 
                  : 'Ask someone to send you a gift to see received gifts here!'
                }
              </p>
              <a
                href="/products"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {activeTab === 'sent' ? '🎁 Send a Gift' : '🛍️ Browse Products'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentGifts.map((gift) => renderGiftItem(gift, activeTab === 'received'))}
          </div>
        )}

        {/* Summary */}
        {(totalSent > 0 || totalReceived > 0) && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{totalSent}</div>
                <div className="text-sm text-gray-600">Gifts Sent</div>
                <div className="text-lg font-semibold text-green-600">
                  ${sentGifts.reduce((sum, gift) => sum + gift.totalAmount, 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{totalReceived}</div>
                <div className="text-sm text-gray-600">Gifts Received</div>
                <div className="text-lg font-semibold text-blue-600">
                  ${receivedGifts.reduce((sum, gift) => sum + gift.totalAmount, 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{totalSent + totalReceived}</div>
                <div className="text-sm text-gray-600">Total Gifts</div>
                <div className="text-lg font-semibold text-gray-700">
                  ${(sentGifts.reduce((sum, gift) => sum + gift.totalAmount, 0) + receivedGifts.reduce((sum, gift) => sum + gift.totalAmount, 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftHistoryPage;

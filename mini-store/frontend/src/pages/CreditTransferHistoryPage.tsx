import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import type { CreditTransferHistoryItem } from '../types/auth';

const CreditTransferHistoryPage = () => {
  const [sentTransfers, setSentTransfers] = useState<CreditTransferHistoryItem[]>([]);
  const [receivedTransfers, setReceivedTransfers] = useState<CreditTransferHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const { fetchCreditTransferHistory, user } = useAuthContext();

  useEffect(() => {
    const loadCreditTransferHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCreditTransferHistory();
        setSentTransfers(response.sentTransfers);
        setReceivedTransfers(response.receivedTransfers);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load credit transfer history');
        console.error('Error loading credit transfer history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCreditTransferHistory();
  }, [fetchCreditTransferHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTransferItem = (transfer: CreditTransferHistoryItem, isReceived: boolean = false) => (
    <div key={transfer.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-2xl">
                {isReceived ? '📥' : '📤'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isReceived ? 'Received Transfer' : 'Sent Transfer'}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(transfer.createdAt)}
                </p>
              </div>
            </div>
            
            {/* Transfer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Amount:</span>
                <p className="font-semibold text-lg text-green-600">
                  ${transfer.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">
                  {isReceived ? 'From:' : 'To:'}
                </span>
                <p className="font-medium text-gray-900">
                  {isReceived 
                    ? transfer.sender?.email || 'Unknown' 
                    : transfer.receiver?.email || 'Unknown'
                  }
                </p>
              </div>
            </div>
            
            {/* Message */}
            {transfer.message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="text-sm text-green-800">
                  <span className="font-medium">💬 Message: </span>
                  <span className="italic">"{transfer.message}"</span>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isReceived 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-blue-100 text-blue-800 border-blue-200'
              }`}>
                {isReceived ? '✅ Received' : '💸 Sent'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your credit transfer history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Transfers</div>
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

  const currentTransfers = activeTab === 'sent' ? sentTransfers : receivedTransfers;
  const totalSent = sentTransfers.length;
  const totalReceived = receivedTransfers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                💸 Credit Transfer History
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {totalSent === 0 && totalReceived === 0 
                  ? 'No transfers yet' 
                  : `${totalSent + totalReceived} transfer${totalSent + totalReceived === 1 ? '' : 's'} total`
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
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📤 Sent Transfers ({totalSent})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'received'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📥 Received Transfers ({totalReceived})
            </button>
          </div>
        </div>

        {/* Transfer List */}
        {currentTransfers.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">
                {activeTab === 'sent' ? '📤' : '📥'}
              </div>
              <div className="text-gray-600 text-xl font-semibold mb-4">
                {activeTab === 'sent' ? 'No Transfers Sent Yet' : 'No Transfers Received Yet'}
              </div>
              <p className="text-gray-500 mb-6">
                {activeTab === 'sent' 
                  ? 'Start transferring credits to see your sent transfers here!' 
                  : 'Ask someone to send you credits to see received transfers here!'
                }
              </p>
              <a
                href="/"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {activeTab === 'sent' ? '💸 Transfer Credits' : '🏠 Go Home'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentTransfers.map((transfer) => renderTransferItem(transfer, activeTab === 'received'))}
          </div>
        )}

        {/* Summary */}
        {(totalSent > 0 || totalReceived > 0) && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{totalSent}</div>
                <div className="text-sm text-gray-600">Transfers Sent</div>
                <div className="text-lg font-semibold text-red-600">
                  ${sentTransfers.reduce((sum, transfer) => sum + transfer.amount, 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{totalReceived}</div>
                <div className="text-sm text-gray-600">Transfers Received</div>
                <div className="text-lg font-semibold text-blue-600">
                  ${receivedTransfers.reduce((sum, transfer) => sum + transfer.amount, 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{totalSent + totalReceived}</div>
                <div className="text-sm text-gray-600">Total Transfers</div>
                <div className="text-lg font-semibold text-gray-700">
                  Net: ${(receivedTransfers.reduce((sum, transfer) => sum + transfer.amount, 0) - sentTransfers.reduce((sum, transfer) => sum + transfer.amount, 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditTransferHistoryPage;

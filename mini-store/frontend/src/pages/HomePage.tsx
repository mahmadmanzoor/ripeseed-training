import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import CreditTransferModal from '../components/CreditTransferModal';
import Navbar from '../components/Navbar';

const HomePage = () => {
  const { user, isAuthenticated, logout, transferCredits } = useAuthContext();
  const [isCreditTransferModalOpen, setIsCreditTransferModalOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleCreditTransfer = () => {
    if (!user) {
      setTransferMessage({ type: 'error', text: 'Please login to transfer credits' });
      return;
    }
    
    setIsCreditTransferModalOpen(true);
    setTransferMessage(null);
  };

  const handleCreditTransferConfirm = async (recipientEmail: string, amount: number, message?: string) => {
    try {
      setTransferLoading(true);
      setTransferMessage(null);

      const result = await transferCredits(recipientEmail, amount, message);
      
      setTransferMessage({ 
        type: 'success', 
        text: `💸 Successfully transferred $${amount.toFixed(2)} to ${recipientEmail}!` 
      });
      
      setIsCreditTransferModalOpen(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setTransferMessage(null), 5000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Credit transfer failed. Please try again.';
      setTransferMessage({ type: 'error', text: errorMessage });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCloseCreditTransferModal = () => {
    setIsCreditTransferModalOpen(false);
    setTransferMessage(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏪 Mini Store
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your one-stop shop for amazing products
            </p>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome to Mini Store
              </h2>
              <p className="text-gray-600 mb-6">
                Browse our collection of products, manage your wallet, and discover great deals!
              </p>
              <div className="space-y-4">
                <a
                  href="/login"
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Create Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Products Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🛍️ Browse Products
            </h2>
            <p className="text-gray-600 mb-4">
              Discover amazing products from our collection
            </p>
            <a
              href="/products"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
            >
              View Products
            </a>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📦 Order History
            </h2>
            <p className="text-gray-600 mb-4">
              Track your past purchases and orders
            </p>
            <a
              href="/orders"
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
            >
              View Orders
            </a>
          </div>

          {/* Gifts Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎁 Gift History
            </h2>
            <p className="text-gray-600 mb-4">
              Manage your sent and received gifts
            </p>
            <a
              href="/gifts"
              className="block w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-center"
            >
              View Gifts
            </a>
          </div>

          {/* Credit Transfer Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💸 Transfer Credits
            </h2>
            <p className="text-gray-600 mb-4">
              Send wallet credits to other users
            </p>
            <button
              onClick={handleCreditTransfer}
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Transfer Credits
            </button>
          </div>
        </div>

        {/* Credit Transfer Success/Error Message */}
        {transferMessage && (
          <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg ${
            transferMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="mr-3">
                {transferMessage.type === 'success' ? '💸' : '❌'}
              </div>
              <div>
                <p className="font-medium">{transferMessage.text}</p>
              </div>
              <button
                onClick={() => setTransferMessage(null)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Credit Transfer Modal */}
        <CreditTransferModal
          isOpen={isCreditTransferModalOpen}
          onClose={handleCloseCreditTransferModal}
          onConfirm={handleCreditTransferConfirm}
          currentWalletBalance={user?.walletBalance || 0}
          isLoading={transferLoading}
        />
      </div>
    </div>
  );
};

export default HomePage;

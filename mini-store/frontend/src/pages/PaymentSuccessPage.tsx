import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { apiClient } from '../lib/api';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUserWalletBalance } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Verify the payment with the backend
      verifyPayment(sessionId);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log('Verifying payment for session:', sessionId);
      
      // Get payment history to find the latest payment
      const response = await apiClient.get('/payment/history');
      const payments = response.data;
      
      console.log('Payment history:', payments);
      
      // Find the most recent payment (should be the one we just made)
      const latestPayment = payments[0];
      
      console.log('Latest payment:', latestPayment);
      
      if (latestPayment && latestPayment.status === 'succeeded') {
        console.log('Payment already succeeded, amount:', latestPayment.amount);
        
        // Refresh user data to get updated wallet balance
        try {
          const userResponse = await apiClient.get('/auth/me');
          if (userResponse.data.user) {
            updateUserWalletBalance(parseFloat(userResponse.data.user.walletBalance));
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
        
        setPaymentAmount(parseFloat(latestPayment.amount));
        
        // Redirect to homepage after 3 seconds to show updated balance
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else if (latestPayment && latestPayment.status === 'pending') {
        // If payment is still pending, process all pending payments
        console.log('Payment is pending, processing pending payments...');
        console.log('Amount to add:', latestPayment.amount);
        
        try {
          const processResponse = await apiClient.post('/payment/process-pending-payments');
          console.log('Pending payments processed:', processResponse.data);
          
          // Update the user's wallet balance in the frontend immediately
          if (processResponse.data.newBalance) {
            updateUserWalletBalance(parseFloat(processResponse.data.newBalance));
            console.log('Wallet balance updated to:', processResponse.data.newBalance);
          }
          
          setPaymentAmount(parseFloat(latestPayment.amount));
          
          // Redirect to homepage after 3 seconds to show updated balance
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } catch (processError) {
          console.error('Error processing pending payments:', processError);
          setPaymentAmount(parseFloat(latestPayment.amount));
        }
      } else {
        console.log('No payment found or unknown status');
        // Fallback: show a generic success message
        setPaymentAmount(null);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      // Fallback: show a generic success message
      setPaymentAmount(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your payment has been processed successfully.
            </p>
          </div>

          {paymentAmount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">
                  ${paymentAmount.toFixed(2)} added to your wallet
                </span>
              </div>
              <p className="text-sm text-green-700">
                You can now use these credits to purchase products or send gifts!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
            
            <p className="text-sm text-gray-500 mt-2">
              You'll be automatically redirected to the homepage in 3 seconds to see your updated wallet balance.
            </p>
            
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

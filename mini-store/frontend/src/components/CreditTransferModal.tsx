import { useState } from 'react';

interface CreditTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (recipientEmail: string, amount: number, message?: string) => Promise<void>;
  currentWalletBalance: number;
  isLoading?: boolean;
}

const CreditTransferModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentWalletBalance,
  isLoading = false
}: CreditTransferModalProps) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Recipient email is required';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validateAmount = (amountStr: string) => {
    const amountNum = parseFloat(amountStr);
    if (!amountStr) {
      return 'Amount is required';
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      return 'Amount must be a positive number';
    }
    if (amountNum > currentWalletBalance) {
      return 'Amount exceeds your wallet balance';
    }
    if (amountNum < 0.01) {
      return 'Minimum transfer amount is $0.01';
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setRecipientEmail(email);
    setEmailError(validateEmail(email));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amountStr = e.target.value;
    setAmount(amountStr);
    setAmountError(validateAmount(amountStr));
  };

  const handleConfirm = async () => {
    const emailValidationError = validateEmail(recipientEmail);
    const amountValidationError = validateAmount(amount);

    if (emailValidationError) {
      setEmailError(emailValidationError);
    }
    if (amountValidationError) {
      setAmountError(amountValidationError);
    }

    if (!emailValidationError && !amountValidationError && !isLoading) {
      await onConfirm(recipientEmail, parseFloat(amount), message.trim() || undefined);
      setRecipientEmail('');
      setAmount('');
      setMessage('');
      setEmailError(null);
      setAmountError(null);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setRecipientEmail('');
      setAmount('');
      setMessage('');
      setEmailError(null);
      setAmountError(null);
      onClose();
    }
  };

  const isFormValid = !emailError && !amountError && recipientEmail && amount && !isLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">💸 Transfer Credits</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Recipient Email */}
          <div className="mb-6">
            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              onChange={handleEmailChange}
              placeholder="Enter recipient's email address"
              disabled={isLoading}
              className={`input-field ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                max={currentWalletBalance}
                disabled={isLoading}
                className={`input-field pl-7 ${amountError ? 'border-red-500' : ''}`}
              />
            </div>
            {amountError && <p className="mt-1 text-sm text-red-600">{amountError}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Available balance: ${currentWalletBalance.toFixed(2)}
            </p>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              disabled={isLoading}
              className="input-field resize-none"
            />
          </div>

          {/* Wallet Balance */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 font-medium">Your Wallet Balance:</span>
              <span className="text-lg font-bold text-blue-900">
                ${currentWalletBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Transfer Amount */}
          {amount && !amountError && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-green-800 font-medium">Transfer Amount:</span>
                <span className="text-xl font-bold text-green-900">
                  ${parseFloat(amount).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                Remaining balance: ${(currentWalletBalance - parseFloat(amount)).toFixed(2)}
              </div>
            </div>
          )}

          {/* Warning Messages */}
          {amount && parseFloat(amount) > currentWalletBalance * 0.8 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-500 mr-2">⚠️</div>
                <div>
                  <p className="text-yellow-800 font-medium">High Transfer Amount</p>
                  <p className="text-yellow-600 text-sm">
                    You're transferring {((parseFloat(amount) / currentWalletBalance) * 100).toFixed(0)}% of your wallet balance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isFormValid}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              isFormValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Transferring...
              </div>
            ) : (
              `💸 Transfer $${amount ? parseFloat(amount).toFixed(2) : '0.00'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditTransferModal;

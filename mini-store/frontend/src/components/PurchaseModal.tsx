import { useState } from 'react';
import type { Product } from '../types/product';

interface PurchaseModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => Promise<void>;
  currentWalletBalance: number;
  isLoading?: boolean;
}

const PurchaseModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onConfirm, 
  currentWalletBalance,
  isLoading = false 
}: PurchaseModalProps) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const discountPrice = product.price - (product.price * product.discountPercentage) / 100;
  const totalAmount = discountPrice * quantity;
  const canAfford = currentWalletBalance >= totalAmount;

  const handleConfirm = async () => {
    if (canAfford && !isLoading) {
      await onConfirm(product, quantity);
      setQuantity(1); // Reset quantity after purchase
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setQuantity(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Confirm Purchase</h2>
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

        {/* Product Details */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Rating:</span>
                <div className="flex items-center">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-medium text-gray-700 ml-1">{product.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Unit Price:</span>
              <div className="flex items-center space-x-2">
                {product.discountPercentage > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-bold text-green-600">
                  ${discountPrice.toFixed(2)}
                </span>
              </div>
            </div>
            {product.discountPercentage > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Discount:</span>
                <span className="text-sm font-medium text-red-600">
                  -{product.discountPercentage.toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isLoading || quantity <= 1}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg font-medium">-</span>
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock}
                disabled={isLoading}
                className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={isLoading || quantity >= product.stock}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg font-medium">+</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available in stock: {product.stock}
            </p>
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

          {/* Total Amount */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-white">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {!canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-500 mr-2">⚠️</div>
                <div>
                  <p className="text-red-800 font-medium">Insufficient Balance</p>
                  <p className="text-red-600 text-sm">
                    You need ${(totalAmount - currentWalletBalance).toFixed(2)} more to complete this purchase.
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
            disabled={!canAfford || isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              canAfford && !isLoading
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Purchase for $${totalAmount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

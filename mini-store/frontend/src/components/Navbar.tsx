import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="text-2xl">🏪</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mini Store</h1>
                <p className="text-xs text-gray-500">Your one-stop shop</p>
              </div>
            </Link>

            {/* Auth Links */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl">🏪</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mini Store</h1>
              <p className="text-xs text-gray-500">Welcome back, {user?.email}</p>
            </div>
          </Link>

          {/* Navigation Links - Hide regular links for admin users */}
          {!user?.isAdmin && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/products"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/products')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🛍️ Products
              </Link>
              
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/orders')
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📦 Orders
              </Link>
              
              <Link
                to="/gifts"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/gifts')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🎁 Gifts
              </Link>

              {/* Credit Transfer History */}
              <Link
                to="/credit-transfers"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/credit-transfers')
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                💸 Transfer History
              </Link>
            </div>
          )}

          {/* Admin Dashboard - Only show for admin users */}
          {user?.isAdmin && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🛡️ Admin Dashboard
              </Link>
            </div>
          )}

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance - Only show for regular users */}
            {!user?.isAdmin && (
              <div className="hidden sm:block bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm font-medium">💰</span>
                  <span className="text-sm text-green-800 font-medium">
                    ${Number(user?.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Admin Badge - Only show for admin users */}
            {user?.isAdmin && (
              <div className="hidden sm:block bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 text-sm font-medium">🛡️</span>
                  <span className="text-sm text-red-800 font-medium">
                    Admin
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button - Always visible for authenticated users */}
          <div className="flex items-center">
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
          {!user?.isAdmin ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/products"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-center ${
                  isActive('/products')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🛍️ Products
              </Link>
              
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-center ${
                  isActive('/orders')
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📦 Orders
              </Link>
              
              <Link
                to="/gifts"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-center ${
                  isActive('/gifts')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🎁 Gifts
              </Link>

              <Link
                to="/credit-transfers"
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-center text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                💸 Transfer History
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-center ${
                  isActive('/admin')
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🛡️ Admin Dashboard
              </Link>
            </div>
          )}
          
          {/* Mobile User Info */}
          <div className="mt-3 text-center">
            {!user?.isAdmin ? (
              <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600 text-sm font-medium">💰</span>
                  <span className="text-sm text-green-800 font-medium">
                    Wallet: ${Number(user?.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-red-600 text-sm font-medium">🛡️</span>
                  <span className="text-sm text-red-800 font-medium">
                    Admin User
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Logout Button */}
          <div className="mt-3 text-center">
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

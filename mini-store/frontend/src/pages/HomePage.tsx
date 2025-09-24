import { useAuthContext } from '../contexts/AuthContext';

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏪 Mini Store</h1>
              <p className="text-gray-600">Welcome back, {user?.email}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/products"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </a>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-sm text-green-800">Wallet Balance</span>
                <p className="text-lg font-semibold text-green-900">
                  ${Number(user?.walletBalance || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              View Orders
            </button>
          </div>

          {/* Gifts Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎁 Gift History
            </h2>
            <p className="text-gray-600 mb-4">
              Manage your sent and received gifts
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              View Gifts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

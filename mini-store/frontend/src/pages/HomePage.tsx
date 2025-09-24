const HomePage = () => {
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
            <p className="text-gray-600">
              Browse our collection of products, manage your wallet, and discover great deals!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

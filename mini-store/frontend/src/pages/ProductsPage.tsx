import { useState } from 'react';
import { useProducts, useProductCategories } from '../hooks/useProducts';
import ProductGrid from '../components/ProductGrid';
import SearchAndFilter from '../components/SearchAndFilter';
import type { Product, ProductFilters } from '../types/product';

const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { products, loading, error, total } = useProducts(filters);
  const { categories, loading: categoriesLoading } = useProductCategories();

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handlePurchase = (product: Product) => {
    // TODO: Implement purchase functionality in Step 5
    alert(`Purchase functionality will be implemented in Step 5!\n\nProduct: ${product.title}\nPrice: $${(product.price - (product.price * product.discountPercentage) / 100).toFixed(2)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🛍️ Product Catalog
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {loading ? 'Loading amazing products...' : `${total} products found`}
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">
                ⚡ Powered by DummyJSON API
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <SearchAndFilter
          onFiltersChange={handleFiltersChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
        />

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-1 rounded-lg mr-2">
                    <span className="text-blue-600 text-sm">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">Active Filters</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {filters.search && (
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      🔍 "{filters.search}"
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      📂 {filters.category}
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      💰 Min: ${filters.minPrice}
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                      💰 Max: ${filters.maxPrice}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setFilters({})}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium border border-red-200"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onPurchase={handlePurchase}
        />

        {/* Results Summary */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {products.length} of {total} products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;

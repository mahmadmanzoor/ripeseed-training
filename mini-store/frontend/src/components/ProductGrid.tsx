import ProductCard from './ProductCard';
import type { Product } from '../types/product';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onPurchase?: (product: Product) => void;
  onGift?: (product: Product) => void;
}

const ProductGrid = ({ products, loading, error, onPurchase, onGift }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse border border-gray-100">
            <div className="h-56 bg-gradient-to-r from-gray-200 to-gray-300"></div>
            <div className="p-5">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded-full w-20"></div>
                <div className="h-4 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded mb-2"></div>
              <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded-full w-24"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Products</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <div className="text-gray-600 text-xl font-semibold mb-4">No Products Found</div>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onPurchase={onPurchase}
          onGift={onGift}
        />
      ))}
    </div>
  );
};

export default ProductGrid;

import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onPurchase?: (product: Product) => void;
  onGift?: (product: Product) => void;
}

const ProductCard = ({ product, onPurchase, onGift }: ProductCardProps) => {
  const discountPrice = product.price - (product.price * product.discountPercentage) / 100;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-56 object-cover hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discountPercentage.toFixed(0)}%
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {product.brand}
          </span>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className="text-sm text-gray-700 ml-1 font-medium">{product.rating}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          {product.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {product.discountPercentage > 0 && (
              <span className="text-sm text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-bold text-green-600">
              ${discountPrice.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Stock</div>
            <div className="text-sm font-medium text-gray-700">{product.stock}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            {product.category}
          </span>
          
          <div className="flex space-x-2">
            {onGift && (
              <button
                onClick={() => onGift(product)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                🎁 Gift
              </button>
            )}
            {onPurchase && (
              <button
                onClick={() => onPurchase(product)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

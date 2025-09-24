import { useState } from 'react';
import type { ProductFilters, ProductCategory } from '../types/product';

interface SearchAndFilterProps {
  onFiltersChange: (filters: ProductFilters) => void;
  categories: ProductCategory[];
  categoriesLoading: boolean;
}

const SearchAndFilter = ({ onFiltersChange, categories, categoriesLoading }: SearchAndFilterProps) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    const filters: ProductFilters = {};
    
    if (search.trim()) filters.search = search.trim();
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    onFiltersChange(filters);
  };

  const handleClear = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <span className="text-blue-600 text-xl">🔍</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Search & Filter Products</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            className="input-field"
            disabled={categoriesLoading}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)}
            placeholder="$0"
            min="0"
            className="input-field"
          />
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)}
            placeholder="$1000"
            min="0"
            className="input-field"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Press Enter or click Search to apply filters
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleClear}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            Clear Filters
          </button>
          <button
            onClick={handleSearch}
            className="btn-primary px-6 py-2"
          >
            🔍 Search Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;

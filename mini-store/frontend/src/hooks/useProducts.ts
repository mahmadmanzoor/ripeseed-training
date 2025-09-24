import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Product, ProductsResponse, ProductFilters, ProductCategory } from '../types/product';

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `${DUMMYJSON_BASE_URL}/products`;
        
        // Add search parameter if provided
        if (filters?.search) {
          url = `${DUMMYJSON_BASE_URL}/products/search?q=${encodeURIComponent(filters.search)}`;
        }

        // Add category filter if provided
        if (filters?.category) {
          url = `${DUMMYJSON_BASE_URL}/products/category/${encodeURIComponent(filters.category)}`;
        }

        const response = await axios.get<ProductsResponse>(url);
        
        let filteredProducts = response.data.products;

        // Apply additional filters on the frontend
        if (filters) {
          if (filters.brand) {
            filteredProducts = filteredProducts.filter(product =>
              product.brand.toLowerCase().includes(filters.brand!.toLowerCase())
            );
          }
          
          if (filters.minPrice !== undefined) {
            filteredProducts = filteredProducts.filter(product =>
              product.price >= filters.minPrice!
            );
          }
          
          if (filters.maxPrice !== undefined) {
            filteredProducts = filteredProducts.filter(product =>
              product.price <= filters.maxPrice!
            );
          }
        }

        setProducts(filteredProducts);
        setTotal(filteredProducts.length);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { products, loading, error, total };
};

export const useProductCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<ProductCategory[]>(`${DUMMYJSON_BASE_URL}/products/categories`);
        setCategories(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<Product>(`${DUMMYJSON_BASE_URL}/products/${id}`);
        setProduct(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};

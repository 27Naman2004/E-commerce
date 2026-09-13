import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { debounce } from '../utils/formatCurrency';
import { motion } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

const categories = ['Dress', 'Combo', 'Jewellery', 'Bansuri', 'Accessories'];
const sorts = [
  { id: 'newest', name: 'New Arrivals' },
  { id: 'popularity', name: 'Popularity' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
];

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State from URL
  const initialCategory = queryParams.get('category') || '';
  const initialSearch = queryParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters State
  const [category, setCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sort, setSort] = useState('newest');
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', {
        params: {
          category,
          keyword: searchTerm,
          sort,
          page,
          limit: 12,
        }
      });
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(() => {
    setPage(1); // Reset page on new search
    fetchProducts();
  }, 400), [category, searchTerm, sort]);

  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  // If page changes without filter changes (pagination)
  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
  }, [page]);

  const handleClearFilters = () => {
    setCategory('');
    setSearchTerm('');
    setSort('newest');
    setPage(1);
    navigate('/shop');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold font-playfair text-maroon">Shop</h1>
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center text-sm font-medium border border-gray-300 rounded-md px-3 py-1.5"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1" /> Filters
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`md:w-64 flex-shrink-0 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)}><XMarkIcon className="h-6 w-6" /></button>
          </div>

          <div className="space-y-8">
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
              <input
                type="text"
                placeholder="Search products..."
                className="input-field py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory('')}
                  className={`block text-left text-sm w-full ${!category ? 'font-bold text-saffron' : 'text-gray-600 hover:text-primary'}`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`block text-left text-sm w-full ${category === cat ? 'font-bold text-saffron' : 'text-gray-600 hover:text-primary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-800 underline w-full text-left"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold font-playfair text-maroon">
              {category ? category : 'All Products'} {searchTerm && `— "${searchTerm}"`}
            </h1>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">Sort By:</label>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="border-none bg-transparent text-sm font-medium focus:ring-0 cursor-pointer"
              >
                {sorts.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading && page === 1 ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your category or search term.</p>
              <button onClick={handleClearFilters} className="btn-secondary">View All Products</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center space-x-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-md font-medium ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default Shop;

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products as localProducts } from '../data/products';
import { productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop({ initialCategory = 'all' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sortBy, setSortBy] = useState('featured');
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const pathCategory = location.pathname.substring(1); 
  const effectiveCategory = ['dresses', 'combos', 'accessories'].includes(pathCategory) ? pathCategory : activeCategory;

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts({ page: 0, size: 50 });
        if (res.data?.success && res.data?.data?.content && isMounted) {
          const mapped = res.data.data.content.map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            price: p.minPrice || 499,
            image: p.primaryImageUrl || '/hero-krishna.jpg',
            category: p.categoryName ? p.categoryName.toLowerCase() : 'dresses',
            description: p.title + ' handcrafted for Kanha Ji',
          }));
          setApiProducts(mapped);
        }
      } catch (err) {
        console.warn('Backend API offline, using static product catalog fallback:', err.message);
        if (isMounted) setApiProducts(localProducts);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  const displaySource = apiProducts.length > 0 ? apiProducts : localProducts;

  const filteredProducts = useMemo(() => {
    let result = displaySource;

    if (effectiveCategory !== 'all') {
      result = result.filter(p => (p.category || '').toLowerCase().includes(effectiveCategory));
    }

    result = result.filter(p => p.price <= maxPrice);

    if (sortBy === 'price-low') result = [...result].sort((a,b) => a.price - b.price);
    if (sortBy === 'price-high') result = [...result].sort((a,b) => b.price - a.price);

    return result;
  }, [displaySource, effectiveCategory, maxPrice, sortBy]);

  return (
    <div className="bg-accent dark:bg-darkAccent transition-colors duration-300 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-10">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-10 sticky top-28 h-fit">
          <div>
            <h3 className="font-heading font-bold text-xl text-textMain dark:text-darkText mb-4 border-b pb-2 border-borderSoft dark:border-darkBorder transition-colors">Categories</h3>
            <ul className="space-y-3 font-body text-textMain/80 dark:text-darkText/80 transition-colors">
              {['all', 'dresses', 'combos', 'accessories'].map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setActiveCategory(cat)} 
                    className={`capitalize hover:text-primary dark:hover:text-darkPrimary transition-colors ${effectiveCategory === cat ? 'text-primary dark:text-darkPrimary font-bold' : ''}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold text-xl text-textMain dark:text-darkText mb-4 border-b pb-2 border-borderSoft dark:border-darkBorder transition-colors">Filter by Price</h3>
            <span className="font-body text-sm font-bold text-primary dark:text-darkPrimary block mb-2">Up to ₹{maxPrice}</span>
            <input 
              type="range" 
              min="100" max="3000" step="100" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              className="w-full accent-primary dark:accent-darkPrimary"
            />
          </div>

          <div>
             <h3 className="font-heading font-bold text-xl text-textMain dark:text-darkText mb-4 border-b pb-2 border-borderSoft dark:border-darkBorder transition-colors">Sort By</h3>
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)} 
               className="w-full bg-surface dark:bg-darkSurface text-textMain dark:text-darkText border border-borderSoft dark:border-darkBorder p-3 rounded-lg font-body text-sm outline-none transition-colors"
             >
               <option value="featured">Featured Arrivals</option>
               <option value="price-low">Price: Low to High</option>
               <option value="price-high">Price: High to Low</option>
             </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
           <div className="mb-8 flex justify-between items-end border-b pb-4 border-borderSoft dark:border-darkBorder transition-colors">
             <h2 className="text-3xl font-heading font-bold text-primary dark:text-darkPrimary capitalize transition-colors">
               {effectiveCategory === 'all' ? 'Entire Collection' : effectiveCategory}
             </h2>
             <span className="font-body text-textMuted dark:text-darkTextMuted text-sm transition-colors">
               {loading ? 'Loading...' : `${filteredProducts.length} Products`}
             </span>
           </div>

           {loading ? (
             <div className="py-20 text-center">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
               <p className="font-body text-textMuted dark:text-darkTextMuted mt-4">Loading devotional catalog...</p>
             </div>
           ) : filteredProducts.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
           ) : (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
               <h3 className="font-heading font-bold text-2xl text-textMain dark:text-darkText mb-2">No Products Found</h3>
               <p className="font-body text-textMuted dark:text-darkTextMuted">Try adjusting your price filters.</p>
               <button onClick={() => setMaxPrice(3000)} className="mt-6 text-primary dark:text-darkPrimary underline font-bold">Reset Filters</button>
             </motion.div>
           )}
        </div>

      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product }) => {
  return (
    <div className="card group relative flex flex-col justify-between h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discountPercent > 0 && (
          <span className="badge-sale px-2.5 py-1 text-[10px] uppercase tracking-wider backdrop-blur-sm bg-white/90 shadow-sm border border-red-100">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="badge bg-gold/90 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider shadow-sm border border-yellow-200">
            Best Seller
          </span>
        )}
      </div>

      {/* Image Block */}
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden aspect-[4/5]">
        <img
          src={product.images?.[0]?.url || 'https://placehold.co/400x500'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-center">
          <span className="text-white text-sm font-medium flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
            <ShoppingBagIcon className="h-4 w-4 mr-2" /> View Details
          </span>
        </div>
      </Link>

      {/* Content Block */}
      <div className="p-4 flex flex-col flex-1 bg-white">
        <div className="text-xs text-saffron uppercase font-semibold tracking-wider mb-1">
          {product.category}
        </div>
        
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 hover:text-maroon transition-colors duration-200 mb-2 h-[40px]">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="mt-auto flex items-end gap-2 pt-2 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-sm text-gray-400 line-through mb-0.5">
              {formatCurrency(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

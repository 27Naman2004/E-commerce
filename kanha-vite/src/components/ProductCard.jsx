import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.4 }}
      className="bg-surface dark:bg-darkSurface text-textMain dark:text-darkText border border-borderSoft dark:border-darkBorder hover:border-gold dark:hover:border-darkGold rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
    >
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-accent dark:bg-darkAccent block cursor-pointer">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="hover:text-primary dark:hover:text-darkPrimary transition-colors">
          <h3 className="font-heading font-bold text-lg mb-1 leading-snug">{product.name}</h3>
        </Link>
        <p className="text-primary dark:text-darkPrimary font-bold text-xl mb-4 font-body mt-auto transition-colors">₹{product.price}</p>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addToCart(product)}
          className="w-full py-3 bg-primary hover:bg-primaryDark text-white dark:bg-darkPrimary dark:hover:bg-darkPrimaryHover font-body font-semibold rounded-lg transition-colors shadow-sm"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}

import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { products } from '../data/products';
import { motion, AnimatePresence } from 'framer-motion';

const sizes = ["0", "1", "2", "3", "4", "5", "6"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const product = products.find(p => p.id === parseInt(id));
  
  const [selectedSize, setSelectedSize] = useState("0");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    window.scrollTo(0,0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-accent dark:bg-darkAccent transition-colors">
        <h2 className="text-4xl font-heading font-bold text-primary dark:text-darkPrimary mb-4">Product Not Found</h2>
        <Link to="/home" className="bg-primary hover:bg-primaryDark text-white px-8 py-3 rounded-lg mt-6">Return Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add multiple quantities if selected
    for(let i = 0; i < qty; i++) {
       addToCart(product);
    }
  };

  return (
    <div className="bg-accent dark:bg-darkAccent min-h-screen transition-colors duration-300 py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Left Column: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 flex flex-col gap-6"
        >
          <div className="relative aspect-[4/5] bg-surface dark:bg-darkSurface rounded-2xl overflow-hidden border border-borderSoft dark:border-darkBorder shadow-md group">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(thumb => (
              <div key={thumb} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-transparent hover:border-gold dark:hover:border-darkGold cursor-pointer transition-all">
                <img src={product.image} alt="thumbnail" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col"
        >
          <nav className="text-sm font-body text-textMuted dark:text-darkTextMuted mb-6 flex gap-2">
            <Link to="/home" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
            <span>/</span>
            <span className="text-textMain dark:text-darkText font-medium truncate">{product.name}</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-textMain dark:text-darkText mb-4 leading-tight">{product.name}</h1>
          <p className="text-3xl font-body font-bold text-primary dark:text-darkPrimary mb-8">₹{product.price}</p>
          
          {/* Size Selector */}
          <div className="mb-8">
            <h3 className="font-body font-bold text-textMain dark:text-darkText mb-3 uppercase tracking-wider text-sm">Select Laddu Gopal Size</h3>
            <div className="flex flex-wrap gap-3">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full font-body font-bold transition-all ${
                    selectedSize === size 
                    ? 'bg-primary dark:bg-darkPrimary text-white shadow-md scale-110' 
                    : 'bg-surface dark:bg-darkSurface text-textMain dark:text-darkText border border-borderSoft dark:border-darkBorder hover:border-gold'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs font-body text-textMuted dark:text-darkTextMuted mt-3 underline cursor-pointer hover:text-gold transition-colors">Size Guide</p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center justify-between bg-surface dark:bg-darkSurface border border-borderSoft dark:border-darkBorder rounded-lg px-4 h-14 w-full sm:w-36">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-xl text-primary font-bold px-2 hover:scale-125 transition-transform">-</button>
              <span className="font-body font-bold text-textMain dark:text-darkText">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-xl text-primary font-bold px-2 hover:scale-125 transition-transform">+</button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 bg-primary hover:bg-primaryDark text-white dark:bg-darkPrimary dark:hover:bg-darkPrimaryHover h-14 rounded-lg font-body font-bold uppercase tracking-widest shadow-md transition-colors"
            >
              Add To Cart
            </motion.button>
          </div>

          {/* Buy Now Checkout shortcut */}
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { handleAddToCart(); navigate('/checkout'); }}
            className="w-full bg-gold hover:bg-[#b08e22] dark:bg-darkGold text-white h-14 rounded-lg font-body font-bold uppercase tracking-widest shadow-lg transition-colors mb-12"
          >
             Buy It Now
          </motion.button>

          {/* Accordion Info */}
          <div className="border-t border-borderSoft dark:border-darkBorder pt-8 flex flex-col gap-6">
            <div className="flex gap-8 border-b border-borderSoft dark:border-darkBorder pb-2">
              <button onClick={() => setActiveTab('description')} className={`font-heading font-bold text-lg pb-2 transition-colors ${activeTab === 'description' ? 'text-primary dark:text-darkPrimary border-b-2 border-primary dark:border-darkPrimary' : 'text-textMuted dark:text-darkTextMuted hover:text-textMain'}`}>Description</button>
              <button onClick={() => setActiveTab('shipping')} className={`font-heading font-bold text-lg pb-2 transition-colors ${activeTab === 'shipping' ? 'text-primary dark:text-darkPrimary border-b-2 border-primary dark:border-darkPrimary' : 'text-textMuted dark:text-darkTextMuted hover:text-textMain'}`}>Shipping</button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="font-body text-textMain/90 dark:text-darkText/90 leading-relaxed"
              >
                {activeTab === 'description' ? (
                  <p>Handcrafted deeply with extreme elegance, this premium layout is perfect for daily seva. Derived from pure Vrindavan cotton and laced with exquisite golden embroidery, ensuring your Laddu Gopal Ji is comfortable and beautiful simultaneously.</p>
                ) : (
                  <p>We ship globally. Delivery within India typically takes 3-5 business days. Pure devotional products packaged securely to preserve their sanctity during transit.</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

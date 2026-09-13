import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, CheckBadgeIcon, ShieldCheckIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid';

const ANIM_DURATION = 0.6;

// Dummy Images Config using placehold.co mapped to the pink palette
const getImg = (text = '', color = 'F8DDE5', textCol = '8E2948', w = 600, h = 600) => 
  `https://placehold.co/${w}x${h}/${color}/${textCol}?text=${text.replace(/ /g, '+')}`;

// Dummy Data
const categories = [
  { name: 'Laddu Gopal Dresses', img: getImg('Dresses', 'FFF4F7') },
  { name: 'Krishna Jewellery', img: getImg('Jewellery', 'FFF4F7') },
  { name: 'Mukut & Crowns', img: getImg('Mukut', 'FFF4F7') },
  { name: 'Divine Mala', img: getImg('Mala', 'FFF4F7') },
  { name: 'Shringar Accessories', img: getImg('Shringar', 'FFF4F7') },
  { name: 'Seva Combos', img: getImg('Combos', 'FFF4F7') },
];

const bestSellers = [
  { _id: '1', name: 'Premium Zari Work Poshak', price: 950, discount: 799, rating: 4.8, img: getImg('Zari+Poshak', 'F8DDE5'), badge: 'Best Seller' },
  { _id: '2', name: 'Golden Pearl Mukut Set', price: 450, discount: null, rating: 4.9, img: getImg('Mukut', 'F8DDE5'), badge: 'New' },
  { _id: '3', name: 'Peacock Feather Flute (Bansuri)', price: 320, discount: 250, rating: 4.7, img: getImg('Flute', 'F8DDE5') },
  { _id: '4', name: 'Pure Cotton Daily Wear Set', price: 650, discount: 550, rating: 5.0, img: getImg('Cotton+Set', 'F8DDE5'), badge: 'Best Seller' },
];

const premiumCollection = [
  { name: 'The Rajwadi Diamond Set', img: getImg('Rajwadi+Set', 'FFF9F2', 'C94F73', 800, 1000), desc: 'Exquisite diamond-studded jewellery set for special occasions.' },
  { name: 'Handcrafted Velvet Winter Collection', img: getImg('Velvet+Collection', 'FFF9F2', 'C94F73', 800, 1000), desc: 'Keep your Laddu Gopal warm and stylish during winter seva.' },
];

const sevaCombos = [
  { _id: '5', name: '7-Days Navagraha Poshak Combo', price: 2100, discount: 1850, rating: 5.0, img: getImg('7+Days+Combo', 'FFF9F2'), badge: 'Save 15%' },
  { _id: '6', name: 'Complete Shringar Box', price: 1500, discount: 1200, rating: 4.8, img: getImg('Shringar+Box', 'FFF9F2') },
  { _id: '7', name: 'Janmashtami Special Set', price: 3500, discount: 3100, rating: 4.9, img: getImg('Festive+Combo', 'FFF9F2'), badge: 'Limited' },
];

const instagramGallery = [
  getImg('Gallery+1', 'F8DDE5', 'ffffff', 400, 400),
  getImg('Gallery+2', 'F8DDE5', 'ffffff', 400, 400),
  getImg('Gallery+3', 'F8DDE5', 'ffffff', 400, 400),
  getImg('Gallery+4', 'F8DDE5', 'ffffff', 400, 400),
  getImg('Gallery+5', 'F8DDE5', 'ffffff', 400, 400),
  getImg('Gallery+6', 'F8DDE5', 'ffffff', 400, 400),
];

const reviews = [
  { id: 1, name: 'Anjali S.', text: 'The poshak quality is exceptional. Softest material for Laddu Gopal Ji.', rating: 5 },
  { id: 2, name: 'Megha P.', text: 'I absolutely love the Rajwadi mukut. Highly recommended for festive days!', rating: 5 },
  { id: 3, name: 'Ritu K.', text: 'Beautiful packaging and fast delivery. Very premium feel overall.', rating: 4 },
];

const DummyProductCard = ({ product }) => {
  const [wishlist, setWishlist] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--color-border)] group"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {product.badge && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold text-secondary rounded-full shadow-sm">
            {product.badge}
          </div>
        )}
        <button 
          onClick={() => setWishlist(!wishlist)}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          {wishlist ? <HeartSolidIcon className="w-5 h-5 text-primary" /> : <HeartIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />}
        </button>
        <button className="absolute bottom-[-50px] left-0 w-full bg-secondary text-white py-3 font-semibold text-sm opacity-0 group-hover:bottom-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
          <ShoppingCartIcon className="w-5 h-5" /> Add to Cart
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-accent' : 'text-gray-300'}`} />
          ))}
          <span className="text-[10px] text-muted-text ml-1">({product.rating})</span>
        </div>
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="font-semibold text-main-text text-sm md:text-base leading-tight hover:text-primary transition-colors mb-2 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          {product.discount ? (
            <>
              <span className="font-bold text-lg text-primary">₹{product.discount}</span>
              <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="font-bold text-lg text-primary">₹{product.price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  return (
    <div className="bg-[var(--color-bg-light)] overflow-hidden">
      
      {/* 3. Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-[#FBF0F4]">
        <img src="/images/hero_pink_krishna.png" alt="Devotional Background" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50" />
        
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF4F7]/90 via-[#FFF4F7]/70 to-transparent"></div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: ANIM_DURATION }}>
              <span className="inline-block py-1 px-3 rounded-full bg-white text-secondary text-sm font-semibold mb-4 tracking-wider uppercase border border-pink-100 shadow-sm">
                New Arrival Collection
              </span>
              <h1 className="font-playfair text-5xl md:text-7xl font-bold text-main-text mb-6 leading-[1.1]">
                Divine Love. <br />
                <span className="text-primary italic">Eternal Purity.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-text mb-8 max-w-lg leading-relaxed">
                Handcrafted premium poshaks and shringar offering the utmost comfort and beauty for your Laddu Gopal Ji.
              </p>
              <div className="flex gap-4">
                <Link to="/shop" className="bg-secondary text-white hover:bg-primary px-8 py-4 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl text-lg flex items-center gap-2">
                  Shop Highlights
                </Link>
                <Link to="/shop?category=Dress" className="bg-white text-secondary hover:bg-pink-50 border border-pink-200 px-8 py-4 rounded-full font-semibold transition-colors shadow-sm text-lg">
                  View Dresses
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Shop by Category */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-3">Shop by Devotion</h2>
            <p className="text-muted-text">Explore our premium offerings crafted with love</p>
          </div>
          
          <div className="overflow-x-auto pb-6 hide-scrollbar">
            <div className="flex md:grid md:grid-cols-6 gap-6 min-w-max md:min-w-0">
              {categories.map((cat, idx) => (
                <motion.div 
                  key={cat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/shop?category=${cat.name}`} className="flex flex-col items-center group w-32 md:w-auto">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg group-hover:shadow-pink-200 transition-all duration-300 group-hover:border-pink-100">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <span className="text-sm font-semibold text-main-text text-center group-hover:text-primary transition-colors">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Selling Products */}
      <section className="py-24 bg-[var(--color-bg-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-3">Most Loved</h2>
              <p className="text-muted-text">Our finest creations adored by devotees worldwide</p>
            </div>
            <Link to="/shop" className="hidden md:inline-flex text-primary font-semibold hover:text-secondary items-center gap-1">
              View All <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {bestSellers.map((product, idx) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <DummyProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/shop" className="inline-block border border-primary text-primary px-6 py-3 rounded-full font-semibold">View All Products</Link>
          </div>
        </div>
      </section>

      {/* 6. Festive Collection Banner */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] flex items-center group">
          <img src="/images/festive_banner_krishna.png" alt="Festive Banner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-xl">
            <span className="text-accent font-semibold tracking-widest uppercase text-sm mb-2 block">Festive Ready</span>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-6 leading-tight">Celebrate Every Day as a Festival</h2>
            <p className="text-pink-100 mb-8 text-lg">Bring home our limited edition intricate designer poshaks made for magnificent celebrations.</p>
            <Link to="/shop?category=Festive" className="bg-white text-secondary hover:bg-accent hover:text-white px-8 py-3 rounded-full font-bold transition-colors">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Premium Collection */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-3">The Premium Selection</h2>
            <p className="text-muted-text">Exclusive designs requiring over 40 hours of handcrafting</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {premiumCollection.map((cat, idx) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden cursor-pointer shadow-lg"
              >
                <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent"></div>
                <div className="absolute bottom-0 w-full p-8 md:p-12 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-playfair font-bold mb-3">{cat.name}</h3>
                  <p className="text-pink-100 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{cat.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-accent pb-1">
                    Discover <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Seva Combos */}
      <section className="py-24 bg-[var(--color-bg-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-3">Weekly Seva Combos</h2>
              <p className="text-muted-text">Carefully curated matching sets to make your daily seva beautiful and seamless.</p>
            </div>
            <Link to="/shop?category=Combos" className="bg-primary text-white hover:bg-secondary px-6 py-3 rounded-full font-semibold transition-colors shrink-0 text-center">
              View All Combos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {sevaCombos.map((combo, idx) => (
              <motion.div 
                key={combo._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <DummyProductCard product={combo} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Why Choose Kanha Collection */}
      <section className="py-16 bg-white border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { icon: CheckBadgeIcon, title: 'Premium Quality', desc: 'Finest materials used' },
              { icon: HeartIcon, title: 'Handcrafted', desc: 'Made with absolute devotion' },
              { icon: ShieldCheckIcon, title: 'Secure Payment', desc: '100% safe transactions' },
              { icon: TruckIcon, title: 'Fast Delivery', desc: 'Safely delivered to your door' }
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-2xl bg-pink-50 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-main-text mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-text leading-tight">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Customer Reviews */}
      <section className="py-24 bg-[var(--color-bg-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-secondary mb-3">Voices of Devotion</h2>
          <p className="text-muted-text mb-16">Trusted by thousands of devotees globally</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--color-border)] relative"
              >
                <div className="text-5xl text-pink-100 font-serif absolute top-4 left-6">"</div>
                <div className="flex justify-center mb-4 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-accent' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-main-text font-medium italic mb-6 relative z-10">"{review.text}"</p>
                <h4 className="font-bold text-primary">— {review.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Instagram Gallery */}
      <section className="py-4">
        <div className="flex overflow-x-auto gap-1 hide-scrollbar">
          {instagramGallery.map((img, idx) => (
            <div key={idx} className="min-w-[200px] md:min-w-[250px] aspect-square relative group overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer">
              <img src={img} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-secondary/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <HeartSolidIcon className="w-8 h-8 text-white animate-bounce" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. Newsletter Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-pink-50 rounded-full text-primary mb-6">
            <HeartSolidIcon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-playfair font-bold text-main-text mb-4">Join Our Devotional Family</h2>
          <p className="text-lg text-muted-text mb-10 max-w-2xl mx-auto">
            Subscribe to receive updates on our latest festive collections, special offers, and beautiful devotion stories.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address..." 
              required
              className="flex-grow bg-[var(--color-bg-cream)] border border-[var(--color-border)] rounded-full px-6 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-main-text"
            />
            <button type="submit" className="bg-secondary text-white hover:bg-primary font-bold px-8 py-4 rounded-full transition-colors whitespace-nowrap shadow-md">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;

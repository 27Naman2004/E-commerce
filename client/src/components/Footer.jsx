import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold font-playfair text-accent mb-4">Kanha Collection</h3>
            <p className="text-pink-100 text-sm mb-6">
              Premium dresses, jewellery, and accessories crafted with devotion for your Laddu Gopal Ji.
            </p>
            <div className="flex space-x-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary cursor-pointer transition">IG</div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary cursor-pointer transition">FB</div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary cursor-pointer transition">YT</div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-pink-100">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/shop" className="hover:text-white transition">Shop All</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">Shop By Category</h4>
            <ul className="space-y-2 text-sm text-pink-100">
              <li><Link to="/shop?category=Dress" className="hover:text-white transition">Laddu Gopal Dresses</Link></li>
              <li><Link to="/shop?category=Combo" className="hover:text-white transition">Daily Seva Combos</Link></li>
              <li><Link to="/shop?category=Jewellery" className="hover:text-white transition">Premium Jewellery</Link></li>
              <li><Link to="/shop?category=Bansuri" className="hover:text-white transition">Beautiful Bansuris</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-white transition">Singhasan & Jhula</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent">Newsletter</h4>
            <p className="text-sm text-pink-100 mb-4">Subscribe to receive updates on new arrivals and special offers.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white/10 border border-white/20 rounded-l-md px-3 py-2 text-sm text-white placeholder-pink-200 focus:outline-none focus:border-accent"
              />
              <button type="submit" className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-r-md text-sm font-semibold transition">
                Subscribe
              </button>
            </form>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-pink-200">
          <p>&copy; {new Date().getFullYear()} Kanha Collection. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/shipping" className="hover:text-white transition">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

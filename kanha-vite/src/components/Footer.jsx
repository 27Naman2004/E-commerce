import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-accent pt-16 pb-8 border-t-[4px] border-secondary mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-heading font-bold text-secondary mb-4">Kanha Collection</h2>
        <p className="max-w-md mx-auto mb-8 font-body opacity-90">
          Pure daily wear poshak, shringar, and devotional accessories for Laddu Gopal Ji. Crafted with immaculate devotion.
        </p>
        <div className="flex justify-center gap-6 mb-8 uppercase text-sm font-semibold tracking-widest text-secondary">
          <Link to="/about" className="hover:text-light transition-colors">About Story</Link>
          <Link to="/contact" className="hover:text-light transition-colors">Contact Support</Link>
        </div>
        <div className="w-24 h-[1px] bg-secondary/40 mx-auto mb-6"></div>
        <p className="text-xs font-body tracking-wider uppercase opacity-70">
          &copy; 2026 Kanha Collection. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

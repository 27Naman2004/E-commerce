import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import HeroSlideshow from '../components/HeroSlideshow';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Singhasan', img: 'https://source.unsplash.com/200x200/?throne,gold', link: '/accessories' },
  { name: 'Jewelry Set', img: 'https://source.unsplash.com/200x200/?jewelry,indian', link: '/accessories' },
  { name: 'Combo Dresses', img: 'https://source.unsplash.com/200x200/?fabric,rose', link: '/combos' },
  { name: 'Heavy Dresses', img: 'https://source.unsplash.com/200x200/?embroidery,traditional', link: '/dresses' },
  { name: 'Bansuri', img: 'https://source.unsplash.com/200x200/?flute,gold', link: '/accessories' },
  { name: 'Shop All', img: 'https://source.unsplash.com/200x200/?temple,flowers', link: '/home' },
];

const exploreBlocks = [
  { title: 'Special Collection', subtitle: 'Make this Janmashtami extra special', bg: 'bg-primary/10' },
  { title: 'Fresh Designs', subtitle: 'For daily seva and festive looks', bg: 'bg-gold/10' },
  { title: 'Devotees’ Most Loved', subtitle: 'Popular shringar picks', bg: 'bg-secondary/20' },
  { title: 'Finest Quality', subtitle: 'Divine service and gifting', bg: 'bg-borderSoft/30' },
];

export default function Home() {
  const featuredCombo = products.filter(p => p.category === 'combos').slice(0, 4);
  const premiumPicks = products.slice(4, 8);

  return (
    <div className="flex flex-col flex-grow bg-accent dark:bg-darkAccent transition-colors duration-300">
      
      {/* 1. Hero Slideshow */}
      <HeroSlideshow />

      {/* 2. Choose Your Favourite Seva Category */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-heading font-bold text-center mb-16 text-textMain dark:text-darkText transition-colors"
        >
          Choose Your Favourite Seva Category
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((cat, i) => (
            <motion.div 
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }} className="flex flex-col items-center group cursor-pointer"
            >
              <Link to={cat.link} className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-[4px] border-surface dark:border-darkSurface shadow-md group-hover:border-gold dark:group-hover:border-darkGold group-hover:shadow-lg transition-all">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </Link>
              <span className="mt-5 font-body font-semibold text-lg text-textMain dark:text-darkText text-center group-hover:text-primary dark:group-hover:text-darkPrimary transition-colors">
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Explore Kanha Collection... */}
      <section className="py-24 px-4 w-full bg-surface dark:bg-darkSurface transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-center mb-16 text-primary dark:text-darkPrimary transition-colors"
          >
            Explore Kanha Collection...
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {exploreBlocks.map((block, i) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`${block.bg} dark:bg-darkAccent/50 p-10 rounded-2xl border border-transparent hover:border-gold dark:hover:border-darkGold shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center cursor-default`}
              >
                <h3 className="font-heading font-bold text-2xl text-textMain dark:text-darkText mb-3">{block.title}</h3>
                <p className="font-body text-base text-textMuted dark:text-darkTextMuted leading-relaxed">{block.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Loved Combo Dresses for Laddu Gopal Ji */}
      <section className="py-28 px-4 w-full">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-center mb-16 text-textMain dark:text-darkText transition-colors"
          >
            Loved Combo Dresses for Laddu Gopal Ji
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCombo.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* 5. Feature Banner Module */}
      <section className="py-0 w-full bg-primary dark:bg-darkSecondary relative overflow-hidden transition-colors flex items-center">
        <div className="absolute inset-0 bg-[url('https://placehold.co/100x100/B76E79/9C5A66?text=pattern')] dark:bg-[url('https://placehold.co/100x100/4A2E36/381C25?text=pattern')] opacity-20" />
        <div className="max-w-5xl mx-auto px-4 py-24 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-5xl font-heading font-bold text-surface drop-shadow-sm leading-relaxed"
          >
            A beautiful and comfortable cotton dress combo for Kanha ji, perfect for daily seva and special days.
          </motion.h2>
          <motion.div whileHover={{ scale: 1.05 }} className="mt-10 inline-block">
             <Link to="/dresses" className="bg-surface text-textMain dark:bg-darkSurface dark:text-darkText px-10 py-4 rounded-md font-bold tracking-widest uppercase hover:bg-gold hover:text-white dark:hover:bg-darkGold transition-colors duration-300 shadow-xl border-2 border-transparent">
               Explore Collection
             </Link>
          </motion.div>
        </div>
      </section>

      {/* 6. Premium Collection */}
      <section className="py-28 px-4 w-full bg-surface dark:bg-darkSurface transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading font-bold text-center mb-16 text-primary dark:text-darkPrimary transition-colors tracking-wide"
          >
            Premium Collection
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {premiumPicks.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

    </div>
  );
}

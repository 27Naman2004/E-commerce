import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-accent dark:bg-darkAccent transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden w-full min-h-[50vh] flex items-center justify-center bg-primary/20 dark:bg-darkSecondary/50 border-b-[6px] border-gold dark:border-darkGold transition-colors">
        <div className="absolute inset-0 bg-[url('https://placehold.co/100x100/B76E79/9C5A66?text=pattern')] dark:bg-[url('https://placehold.co/100x100/1C1418/2A1E23?text=pattern')] opacity-10" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-20 flex flex-col items-center">
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", duration: 1.5 }} className="w-24 h-24 bg-surface dark:bg-darkSurface rounded-full border-4 border-gold dark:border-darkGold shadow-xl flex items-center justify-center mb-8">
               <span className="text-4xl">🦚</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-heading font-bold text-primary dark:text-darkPrimary drop-shadow-sm mb-6 transition-colors">
              Our Spiritual Journey
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-lg md:text-xl font-body text-textMain dark:text-darkText leading-relaxed">
              Kanha Collection was born out of pure devotion. What began as a personal quest to dress Laddu Gopal Ji with the finest, softest fabrics has blossomed into a global family of devotees.
            </motion.p>
        </div>
      </section>

      {/* 3. Our Journey Steps */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-b border-borderSoft dark:border-darkBorder">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-heading font-bold text-center text-textMain dark:text-darkText mb-16">
           How We Prepare Every Order
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-10 lg:gap-20 relative">
           {/* Connecting Line */}
           <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-1 bg-borderSoft dark:bg-darkBorder -z-10" />
           
           {[
             { num: '01', title: 'Thoughtfully Made', text: 'Carefully woven with pure Vrindavan cotton and intricately styled with hand-embroidery. We craft every dress with chanting & pure intent.' },
             { num: '02', title: 'Quality Assured', text: 'Each fabric is checked manually to ensure smooth textures and perfect fits, strictly prioritizing Laddu Gopal Ji\'s absolute comfort.' },
             { num: '03', title: 'Safely Packed', text: 'Wrapped securely in our robust devotional packaging to ensure the shringar arrives purely unblemished and delightfully fragrant.' }
           ].map((step, i) => (
             <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.2 }} className="flex flex-col flex-1 relative group cursor-default">
                 <motion.div whileHover={{ scale: 1.1, backgroundColor: '#C9A227', borderColor: '#C9A227', color: '#fff' }} className="w-24 h-24 rounded-full bg-surface dark:bg-darkSurface border-[4px] border-primary dark:border-darkPrimary flex items-center justify-center font-heading font-bold text-3xl text-primary dark:text-darkPrimary shadow-xl mx-auto mb-8 transition-colors">
                    {step.num}
                 </motion.div>
                 <h3 className="font-heading font-bold text-2xl text-center text-primary dark:text-darkPrimary mb-4">{step.title}</h3>
                 <p className="font-body text-textMuted dark:text-darkTextMuted text-center leading-relaxed">{step.text}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 5. Values Grid */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-heading font-bold text-center text-textMain dark:text-darkText mb-16">
           Our Core Values
        </motion.h2>
        
        <div className="grid sm:grid-cols-2 gap-8">
           {[
             { emoji: '💮', title: 'Made with Care', desc: 'No harsh chemicals, purely tailored with soft fabrics.' },
             { emoji: '✨', title: 'Quality Checked', desc: 'Detailed inspections before shipping any devotionals.' },
             { emoji: '📦', title: 'Safe Packaging', desc: 'Sturdy, weather-proof sealing protecting your seva items.' },
             { emoji: '🙏', title: 'Trust Focused', desc: 'A spiritual commitment to transparency and service.' }
           ].map((val, i) => (
              <motion.div key={val.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i*0.1 }} className="flex items-center gap-6 p-8 bg-surface dark:bg-darkSurface rounded-3xl border border-borderSoft dark:border-darkBorder shadow-sm hover:border-gold dark:hover:border-darkGold transition-all group">
                 <div className="text-5xl group-hover:scale-110 transition-transform">{val.emoji}</div>
                 <div>
                    <h3 className="font-heading font-bold text-xl text-primary dark:text-darkPrimary mb-1">{val.title}</h3>
                    <p className="font-body text-textMuted dark:text-darkTextMuted">{val.desc}</p>
                 </div>
              </motion.div>
           ))}
        </div>
        
        {/* 6. CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 text-center">
            <Link to="/dresses" className="inline-block px-12 py-5 bg-gold hover:bg-[#b08e22] text-white font-body font-bold tracking-widest uppercase rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                Explore Our Collection
            </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default About;

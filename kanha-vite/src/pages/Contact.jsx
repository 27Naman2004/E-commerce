import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', orderId: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('✅ Message sent! We will reply within 24 hours.');
    setForm({ name: '', email: '', phone: '', subject: '', orderId: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const showOrderId = ['Order Related Issue', 'Return / Refund', 'Delivery Delay'].includes(form.subject);

  const faqs = [
    { q: 'How do I choose the right size for Laddu Gopal Ji?', a: 'Please refer to our universal size guide. Measure from the neck to the feet. 0-6 sizes are most popular.' },
    { q: 'What is included in a combo dress set?', a: 'A standard combo includes a heavy dress, matching pagdi (turban), a small bansuri, and a minimal jewelry set.' },
    { q: 'Are the colors exactly the same as shown in photos?', a: 'We try our best, though natural lighting might alter the hues by 5-10%.' },
    { q: 'How long does delivery usually take?', a: 'Delivery pan-India takes approximately 3-7 business days depending on location.' },
  ];

  return (
    <div className="min-h-screen bg-accent dark:bg-darkAccent pt-20 pb-28 px-4 transition-colors duration-300">
      
      {/* 1. Hero */}
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading font-bold text-4xl md:text-5xl text-center text-primary dark:text-darkPrimary mb-4">
        Get in Touch
      </motion.h1>
      <p className="text-center font-body text-textMuted dark:text-darkTextMuted mb-16 max-w-xl mx-auto">
        We'd love to hear from you. Whether it's a query, a custom order, or feedback — reach out anytime.
      </p>

      {/* 2. Contact Info Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
        {[
          { icon: '📧', title: 'Email Us', value: 'support@kanhacollection.in' },
          { icon: '📱', title: 'Phone / WhatsApp', value: '+91 79887 84660' },
          { icon: '📍', title: 'Store Location', value: 'Huda sector 12, Panipat 132103, Haryana, India' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.1 }} whileHover={{ scale: 1.05, y: -5 }} className="bg-surface dark:bg-darkSurface rounded-2xl p-8 text-center border-[3px] border-borderSoft dark:border-darkBorder hover:border-gold dark:hover:border-darkGold shadow-sm hover:shadow-xl transition-all duration-300 cursor-default group">
             <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{item.icon}</div>
             <h3 className="font-heading font-bold text-xl text-primary dark:text-darkPrimary mb-2">{item.title}</h3>
             <p className="font-body text-textMuted dark:text-darkTextMuted">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
         {/* 3. Contact Form */}
         <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 bg-surface dark:bg-darkSurface rounded-3xl shadow-xl p-8 lg:p-12 border border-borderSoft dark:border-darkBorder transition-colors">
           <h3 className="text-2xl font-heading font-bold text-primary dark:text-darkPrimary mb-8">Send a Message</h3>
           <form onSubmit={handleSubmit} className="space-y-5 font-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input required type="text" placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-primary outline-none transition-colors" />
                <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-primary outline-none transition-colors" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-primary outline-none transition-colors" />
                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-borderSoft dark:border-darkBorder bg-surface dark:bg-darkSurface text-textMain dark:text-darkText focus:border-primary outline-none transition-colors">
                  <option value="">Select Subject *</option>
                  <option>Order Related Issue</option>
                  <option>Product Query</option>
                  <option>Size / Fit Help</option>
                  <option>Return / Refund</option>
                  <option>Delivery Delay</option>
                  <option>Feedback / Suggestion</option>
                </select>
              </div>

              <AnimatePresence>
                {showOrderId && (
                  <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} type="text" placeholder="Order ID (for faster help) *" value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-primary outline-none transition-all overflow-hidden" required />
                )}
              </AnimatePresence>

              <textarea required rows="4" placeholder="Your Message *" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full px-5 py-4 rounded-xl border border-borderSoft dark:border-darkBorder bg-transparent text-textMain dark:text-darkText focus:border-primary outline-none resize-none transition-colors" />

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 mt-4 rounded-xl bg-primary hover:bg-primaryDark dark:bg-darkPrimary dark:hover:bg-darkPrimaryHover text-white font-bold uppercase tracking-widest shadow-md transition-colors duration-300">
                Send Message
              </motion.button>
              
              {submitted && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[#2e5d32] dark:text-[#81c784] font-bold mt-4">
                  ✅ Message sent! We'll reply within 24 hours.
                </motion.p>
              )}
           </form>
         </motion.div>

         {/* Right Sidebar */}
         <div className="w-full lg:w-[400px] flex flex-col gap-10">
            {/* 5. Support Info Box */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-primary/5 dark:bg-darkAccent p-8 rounded-3xl border-[3px] border-borderSoft dark:border-darkBorder shadow-sm">
               <h3 className="text-xl font-heading font-bold text-primary dark:text-darkPrimary mb-6">Quick Support</h3>
               <ul className="space-y-4 font-body text-textMain dark:text-darkText">
                 <li className="flex items-start gap-4"><span className="text-2xl mt-[-2px]">📦</span> <div><p className="font-bold">Order Issues</p><p className="text-sm opacity-80 mt-1">Share your Order ID for faster resolution.</p></div></li>
                 <li className="flex items-start gap-4"><span className="text-2xl mt-[-2px]">🔁</span> <div><p className="font-bold">Easy Returns</p><p className="text-sm opacity-80 mt-1">We offer a highly flexible 7-day return window.</p></div></li>
                 <li className="flex items-start gap-4"><span className="text-2xl mt-[-2px]">⏱️</span> <div><p className="font-bold">Response Time</p><p className="text-sm opacity-80 mt-1">We aim to reply within 24 business hours.</p></div></li>
                 <li className="flex items-start gap-4"><span className="text-2xl mt-[-2px]">💬</span> <div><p className="font-bold">WhatsApp Expert</p><button className="text-sm mt-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors mt-2">Chat Now</button></div></li>
               </ul>
            </motion.div>

            {/* 6. FAQ Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
               <h3 className="text-2xl font-heading font-bold text-textMain dark:text-darkText mb-6">Frequently Asked</h3>
               <div className="space-y-4">
                 {faqs.map((faq, index) => (
                   <div key={index} className="bg-surface dark:bg-darkSurface border border-borderSoft dark:border-darkBorder rounded-xl overflow-hidden transition-colors">
                     <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center p-4 text-left font-body font-bold text-textMain dark:text-darkText hover:text-primary dark:hover:text-darkPrimary transition-colors">
                       <span>{faq.q}</span>
                       <span className="text-xl">{openFaq === index ? '−' : '+'}</span>
                     </button>
                     <AnimatePresence>
                       {openFaq === index && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="font-body text-sm text-textMuted dark:text-darkTextMuted px-4 pb-4">
                           {faq.a}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 ))}
               </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
};

export default Contact;

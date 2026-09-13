import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

const faqs = [
  {
    question: "How do I choose the right size for Laddu Gopal Ji?",
    answer: "Our sizes range from 0 to 5. Size 0 is for very small Laddu Gopal Ji (approx 1-2 inches), while Size 5 fits a 5-6 inch deity. Please refer to our size guide table on the product details page to match with your Laddu Gopal Ji's measurements."
  },
  {
    question: "What is included in a combo dress set?",
    answer: "A combo dress set typically includes multiple poshaks (usually 5 or 7 for weekly seva). Some premium combos may also include matching jewellery items like a necklace, earrings, and mukut. Please check the specific product description for exact inclusions."
  },
  {
    question: "Are the colors exactly the same as shown in photos?",
    answer: "We strive to display colors as accurately as possible. However, due to lighting and individual monitor settings, there might be a slight difference. The vibrant colors of our poshaks look even more beautiful in real life during seva!"
  },
  {
    question: "How long does delivery usually take?",
    answer: "We dispatch orders within 24-48 hours. Standard delivery takes 3-5 business days across India depending on your location. Once dispatched, you will receive a tracking link via email."
  },
  {
    question: "Can I buy dresses, bansuri and accessories together?",
    answer: "Absolutely! You can mix and match items from any category into your single cart. This is a great way to completely style your Laddu Gopal Ji and also qualify for our tier-based bundle discounts."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-3xl mx-auto divide-y divide-gray-200">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="py-5">
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-start justify-between text-left text-gray-900 group"
            >
              <span className="text-base font-semibold group-hover:text-maroon transition-colors">{faq.question}</span>
              <span className="ml-6 flex h-7 items-center">
                <ChevronDownIcon
                  className={`h-5 w-5 transform transition-transform duration-300 ${
                    isOpen ? '-rotate-180 text-primary' : 'text-gray-400'
                  }`}
                />
              </span>
            </button>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="pt-4 text-sm text-gray-600 leading-relaxed pr-12">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default FAQ;

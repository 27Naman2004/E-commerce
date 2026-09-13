/**
 * Format a number as Indian Rupee currency
 * @param {number} amount
 * @returns {string} e.g. "₹1,099.00"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate discount percentage
 */
export const calcDiscountPercent = (price, mrp) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

/**
 * Truncate text to a given length
 */
export const truncate = (text, length = 80) => {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '…' : text;
};

/**
 * Debounce function
 */
export const debounce = (fn, delay = 400) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Get cart tier discount label
 */
export const getNextTierMessage = (subtotal) => {
  if (subtotal < 999) return `Add ${formatCurrency(999 - subtotal)} more to get 3% off`;
  if (subtotal < 1499) return `Add ${formatCurrency(1499 - subtotal)} more to get 5% off`;
  if (subtotal < 2499) return `Add ${formatCurrency(2499 - subtotal)} more to get 10% off`;
  return 'You have the best discount applied! 🎉';
};

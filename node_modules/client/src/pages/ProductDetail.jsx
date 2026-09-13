import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart, openCart } from '../redux/slices/cartSlice';
import api from '../services/api';
import ReactImageMagnify from 'react-image-magnify';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import { Tab } from '@headlessui/react';
import { ShoppingCartIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setReviews(data.reviews);
        setMainImage(data.product.images[0]?.url);
        if (data.product.sizes?.length > 0) {
          setSelectedSize(data.product.sizes[0]);
        }
        
        // Fetch related products (same category)
        const relatedRes = await api.get('/products', { params: { category: data.product.category, limit: 4 } });
        setRelated(relatedRes.data.products.filter(p => p._id !== data.product._id));
      } catch (error) {
        toast.error('Failed to load product');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    dispatch(addToCart({ product, qty, size: selectedSize }));
    toast.success('Added to Cart');
    dispatch(openCart());
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    dispatch(addToCart({ product, qty, size: selectedSize }));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        <Skeleton className="w-full md:w-1/2 aspect-[4/5] rounded-xl" />
        <div className="w-full md:w-1/2 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Section: Images and Details */}
        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          
          {/* Images Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 overflow-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`w-20 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition ${mainImage === img.url ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setMainImage(img.url)}
                >
                  <img src={img.url} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* React Image Magnify for desktop zoom */}
            <div className="flex-1 w-full bg-cream rounded-xl overflow-hidden z-20 hidden md:block">
              <ReactImageMagnify {...{
                smallImage: { alt: product.name, isFluidWidth: true, src: mainImage },
                largeImage: { src: mainImage, width: 1200, height: 1500 },
                enlargedImageContainerDimensions: { width: '150%', height: '100%'}
              }} />
            </div>
            {/* Simple image for mobile */}
            <div className="flex-1 w-full bg-cream rounded-xl overflow-hidden md:hidden">
              <img src={mainImage} className="w-full h-auto object-cover" alt={product.name} />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-saffron">{product.category}</span>
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-accent mr-1">★</span> {product.ratings.toFixed(1)} ({product.numReviews} Reviews)
              </div>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-1">{formatCurrency(product.mrp)}</span>
                  <span className="badge-sale mb-2 tracking-widest">{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                  <button className="text-sm text-primary underline">Size Guide</button>
                </div>
                <div className="flex gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-medium transition ${
                        selectedSize === size ? 'border-primary bg-[var(--color-soft-bg)] text-primary' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Combo items */}
            {product.isCombo && product.comboItems?.length > 0 && (
              <div className="mb-8 p-4 bg-[var(--color-soft-bg)] rounded-lg border border-[var(--color-border)]">
                <h4 className="text-sm font-bold text-primary mb-2 flex items-center">
                  <CheckBadgeIcon className="w-5 h-5 mr-1" /> Combo Includes:
                </h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {product.comboItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="mt-auto space-y-4 pt-4 border-t border-gray-100">
              <div className="flex gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg w-32 shrink-0">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50">-</button>
                  <span className="flex-1 text-center font-medium">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-50">+</button>
                </div>
                {product.stock > 0 ? (
                  <button onClick={handleAddToCart} className="btn-secondary flex-1 flex justify-center items-center">
                    <ShoppingCartIcon className="w-5 h-5 mr-2" /> Add to Cart
                  </button>
                ) : (
                  <button disabled className="btn-secondary flex-1 opacity-50 cursor-not-allowed">
                    Out of Stock
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-primary w-full disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
            
            <div className="mt-8 flex justify-center space-x-6 text-sm text-gray-500 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center"><span className="text-xl mb-1">🚚</span> Free Ship &gt; ₹499</div>
              <div className="flex flex-col items-center"><span className="text-xl mb-1">💳</span> Cash on Delivery</div>
              <div className="flex flex-col items-center"><span className="text-xl mb-1">🔄</span> Easy Returns</div>
            </div>

          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="mb-20">
          <Tab.Group>
            <Tab.List className="flex space-x-8 border-b border-gray-200 mb-8 overflow-x-auto">
              <Tab className={({ selected }) => `pb-4 text-lg font-medium whitespace-nowrap focus:outline-none transition-colors border-b-2 ${selected ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Description</Tab>
              <Tab className={({ selected }) => `pb-4 text-lg font-medium whitespace-nowrap focus:outline-none transition-colors border-b-2 ${selected ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Reviews ({product.numReviews})</Tab>
              <Tab className={({ selected }) => `pb-4 text-lg font-medium whitespace-nowrap focus:outline-none transition-colors border-b-2 ${selected ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Shipping & Returns</Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className="prose max-w-none text-gray-600">
                <p>{product.description}</p>
              </Tab.Panel>
              <Tab.Panel>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((r, i) => (
                      <div key={i} className="border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">{r.user?.name || 'Customer'}</span>
                          <span className="text-accent">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                        </div>
                        <p className="text-gray-600">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel className="prose max-w-none text-gray-600">
                <p>We process all orders within 24-48 hours. Shipping takes 3-5 business days.</p>
                <p>If you are not satisfied, we offer a 7-day return policy for unused products in their original packaging.</p>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Frequently Bought Together / Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-playfair mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;

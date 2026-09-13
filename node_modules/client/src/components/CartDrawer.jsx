import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  selectCartItems, selectCartSubtotal, selectDiscount, selectIsCartOpen,
  closeCart, removeFromCart, updateQty,
} from '../redux/slices/cartSlice';
import { formatCurrency, getNextTierMessage } from '../utils/formatCurrency';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const discount = useSelector(selectDiscount);
  const isOpen = useSelector(selectIsCartOpen);

  const discountAmount = Math.round((subtotal * discount.percent) / 100);
  const total = subtotal - discountAmount;

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => dispatch(closeCart())}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between px-4 py-6 sm:px-6 bg-cream border-b border-gray-200">
                      <Dialog.Title className="text-xl font-bold font-playfair text-maroon">Your Devotional Cart</Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={() => dispatch(closeCart())}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Discount Tier Banner */}
                    {cartItems.length > 0 && (
                      <div className="bg-[var(--color-soft-bg)] px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center text-sm font-medium text-primary">
                          <TagIcon className="h-5 w-5 mr-2 text-primary" />
                          {getNextTierMessage(subtotal)}
                        </div>
                        {discount.percent > 0 && (
                          <span className="badge-sale px-3">{discount.percent}% OFF Applied</span>
                        )}
                      </div>
                    )}

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                          <img src="https://placehold.co/150x150/FFF8F0/D4AF37?text=Empty+Cart" alt="Empty" className="w-32 h-32 rounded-full mb-4 opacity-50" />
                          <h3 className="text-lg font-medium text-gray-900">Your cart is currently empty</h3>
                          <p className="text-gray-500 max-w-xs">Looks like you haven't added anything for your Laddu Gopal Ji yet.</p>
                          <button
                            onClick={() => {
                              dispatch(closeCart());
                              navigate('/shop');
                            }}
                            className="btn-primary mt-6"
                          >
                            Explore Collection
                          </button>
                        </div>
                      ) : (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <li key={`${item._id}-${item.size}`} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3><Link to={`/product/${item.slug}`} onClick={() => dispatch(closeCart())}>{item.name}</Link></h3>
                                    <p className="ml-4 font-semibold">{formatCurrency(item.price * item.qty)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.size ? `Size: ${item.size}` : 'Standard'}
                                  </p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm mt-4">
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                      type="button"
                                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                      onClick={() => dispatch(updateQty({ id: item._id, size: item.size, qty: item.qty - 1 }))}
                                      disabled={item.qty <= 1}
                                    >-</button>
                                    <span className="px-3 py-1 font-medium">{item.qty}</span>
                                    <button
                                      type="button"
                                      className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                      onClick={() => dispatch(updateQty({ id: item._id, size: item.size, qty: item.qty + 1 }))}
                                    >+</button>
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => dispatch(removeFromCart({ id: item._id, size: item.size }))}
                                      className="font-medium text-red-600 hover:text-red-500 flex items-center"
                                    >
                                      <TrashIcon className="h-4 w-4 mr-1" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6 bg-gray-50">
                        
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                          <p>Subtotal</p>
                          <p>{formatCurrency(subtotal)}</p>
                        </div>
                        
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-sm font-medium text-green-600 mb-2">
                            <p>Discount ({discount.percent}%)</p>
                            <p>- {formatCurrency(discountAmount)}</p>
                          </div>
                        )}

                        <div className="flex justify-between text-lg font-bold text-gray-900 mb-6 pt-2 border-t border-gray-200">
                          <p>Total</p>
                          <p>{formatCurrency(total)}</p>
                        </div>
                        
                        <p className="mt-0.5 text-sm text-gray-500 mb-6 text-center">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <button
                            onClick={handleCheckout}
                            className="btn-primary w-full py-4 text-lg rounded-xl flex justify-center items-center"
                          >
                            Proceed to Checkout
                          </button>
                        </div>
                        <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-saffron hover:text-primary"
                              onClick={() => dispatch(closeCart())}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CartDrawer;

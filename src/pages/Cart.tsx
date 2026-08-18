// src/pages/Cart.tsx
import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Luxury Class A Flower', price: 250000, quantity: 2, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
    { id: 2, name: 'Classic Class B Flower', price: 34000, quantity: 3, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100000 ? 0 : 5000;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
          <p className="text-gray-500 mt-2">Looks like you haven't added any items yet</p>
          <Link to="/shop" className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
              <div className="divide-y divide-amber-100/30">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-amber-600 font-bold">TSh {item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-3 py-1 hover:bg-amber-50 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 min-w-[30px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-3 py-1 hover:bg-amber-50 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">
                        TSh {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>TSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `TSh ${shipping.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-amber-200/30 pt-3">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-amber-600">TSh {total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/checkout"
                    className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                  <button className="w-full px-6 py-3 border border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                    <CreditCard size={18} />
                    Continue Shopping
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-amber-100/30">
                  <Truck size={18} className="text-amber-500" />
                  <span>Free shipping on orders over TSh 100,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
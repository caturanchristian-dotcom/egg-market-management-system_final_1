import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import { EGG_PLACEHOLDER } from '../constants';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    changeCartItemUnit, 
    getItemPrice, 
    totalAmount,
    clearCart
  } = useCart();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [productToRemove, setProductToRemove] = useState<{ id: number, unit: string } | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      navigate('/auth');
      return;
    }
    if (cart.length === 0) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.id,
          items: cart.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            unit: item.unit,
            price: getItemPrice(item)
          })),
          total_amount: totalAmount
        })
      });

      if (response.ok) {
        clearCart();
        setIsCartOpen(false);
        showToast('Order Placed Successfully! Your eggs are being prepared by the farmer.', 'success');
        navigate('/customer/orders');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Your Cart</h2>
                    <p className="text-emerald-100 text-xs">{cart.length} items selected</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200">
                      <ShoppingCart size={40} />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900">Your cart is empty</h3>
                      <p className="text-emerald-500 text-sm">Looks like you haven't added any eggs yet.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/marketplace');
                      }}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={`${item.product.id}-${item.unit}`} className="flex gap-4 group">
                        <div className="relative w-24 h-24 shrink-0">
                          <img 
                            src={item.product.image_url || EGG_PLACEHOLDER} 
                            className="w-full h-full rounded-2xl object-cover shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={() => {
                              setProductToRemove({ id: item.product.id, unit: item.unit });
                              setShowRemoveConfirm(true);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-lg shadow-lg hover:bg-red-600 transition-all z-20"
                            title="Remove from cart"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-emerald-900 truncate pr-2">{item.product.name}</h4>
                            <span className="font-bold text-emerald-600">₱{(getItemPrice(item) * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">
                            {item.product.farmer_name}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <select 
                                value={item.unit}
                                onChange={(e) => changeCartItemUnit(item.product.id, item.unit, e.target.value as any)}
                                className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer hover:bg-emerald-100 transition-colors"
                              >
                                {item.product.stock > 0 && <option value="unit">Unit</option>}
                                {item.product.price_per_dozen && item.product.price_per_dozen > 0 && (item.product.stock_dozen || 0) > 0 && <option value="dozen">Dozen</option>}
                                {item.product.price_per_tray && item.product.price_per_tray > 0 && (item.product.stock_tray || 0) > 0 && <option value="tray">Tray</option>}
                              </select>
                              <span className="text-emerald-400 text-[10px]">₱{getItemPrice(item).toFixed(2)} / {item.unit}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-2 py-1">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.unit, -1)}
                                className="text-emerald-600 hover:bg-emerald-200 rounded-lg p-1 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold text-emerald-700 w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.unit, 1)}
                                className="text-emerald-600 hover:bg-emerald-200 rounded-lg p-1 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-emerald-50 border-t border-emerald-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-600 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-emerald-900">₱{totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="py-4 rounded-2xl font-bold text-emerald-600 bg-white border border-emerald-100 hover:bg-emerald-100 transition-all"
                  >
                    Continue Shopping
                  </button>
                  <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 shadow-lg shadow-emerald-100 transition-all"
                  >
                    {user ? 'Checkout' : 'Login to Checkout'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setProductToRemove(null);
        }}
        onConfirm={() => {
          if (productToRemove) {
            removeFromCart(productToRemove.id, productToRemove.unit);
            setShowRemoveConfirm(false);
            setProductToRemove(null);
          }
        }}
        title="Remove from Cart"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        type="danger"
      />
    </>
  );
}

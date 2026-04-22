import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Product, Category } from '../types';
import { Search, Filter, ShoppingCart, Plus, Minus, CheckCircle2, MessageSquare, Star, X, MapPin, Map as MapIcon, LayoutGrid, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

import ConfirmationModal from '../components/ConfirmationModal';
import SupplierMap from '../components/SupplierMap';
import { EGG_PLACEHOLDER } from '../constants';

/**
 * Marketplace Component
 * The main customer interface for browsing and purchasing fresh eggs from local farmers.
 * Supports filtering, switching between Grid and Map views, and managing a live shopping cart.
 */
export default function Marketplace() {
  const { user } = useAuth();
  
  // Destructure cart utilities from custom context
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    changeCartItemUnit, 
    getItemPrice, 
    totalAmount,
    isCartOpen: showMobileCart,
    setIsCartOpen: setShowMobileCart,
    clearCart
  } = useCart();
  
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  
  // UI and product states
  const [activeTab, setActiveTab] = useState('marketplace');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and view states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedEggType, setSelectedEggType] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Farmer/Supplier related states
  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<{ id: number, name: string, address?: string, purok?: string, latitude?: number, longitude?: number } | null>(null);
  const [farmerReviews, setFarmerReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Confirmation and mobile UI states
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [productToRemove, setProductToRemove] = useState<{ id: number, unit: string } | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /**
   * Access control: Redirect staff roles away from the consumer marketplace
   */
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'farmer')) {
      navigate(user.role === 'admin' ? '/admin' : '/farmer');
      return;
    }
    fetchData();
  }, [user]);

  /**
   * Toast helper for consistency across interactions
   */
  const showNotify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    showToast(message, type as any);
  };

  /**
   * Parallel data retrieval for products, categories, and farmers
   */
  const fetchData = async () => {
    try {
      const [prodRes, catRes, farmerRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/farmers')
      ]);
      
      const prodData = prodRes.ok ? await prodRes.json() : [];
      const catData = catRes.ok ? await catRes.json() : [];
      const farmerData = farmerRes.ok ? await farmerRes.json() : [];
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setFarmers(Array.isArray(farmerData) ? farmerData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches public reviews for a specific farmer to build confidence
   */
  const fetchFarmerReviews = async (farmerId: number, farmerName: string, address?: string, purok?: string) => {
    setSelectedFarmer({ id: farmerId, name: farmerName, address, purok });
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/farmers/${farmerId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setFarmerReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Derive unique filter lists from product data for the dropdowns
  const eggTypes = Array.from(new Set(products.map(p => p.egg_type).filter(Boolean))) as string[];
  const suppliers = Array.from(new Set(products.map(p => p.farmer_name).filter(Boolean))) as string[];

  /**
   * Client-side combined filtering logic
   */
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesEggType = selectedEggType === 'all' || p.egg_type === selectedEggType;
    const matchesSupplier = selectedSupplier === 'all' || p.farmer_name === selectedSupplier;
    return matchesSearch && matchesCategory && matchesEggType && matchesSupplier;
  });

  /**
   * Processes the checkout, sending the full cart contents to the order API
   */
  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth'); // Guest checkout not allowed
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
        showNotify('Order Placed Successfully! Your eggs are being prepared by the farmer.', 'success');
        fetchData(); // Refresh product stock levels locally
      } else {
        const data = await response.json();
        showNotify(data.error || 'Failed to place order', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showNotify('An error occurred during checkout', 'error');
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">Fresh Egg Marketplace</h1>
            <p className="text-emerald-600 text-sm md:text-base">Directly from local farmers to your doorstep.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Mobile Filter Button */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden p-2.5 bg-white border border-emerald-100 rounded-2xl text-emerald-600 shadow-sm flex items-center gap-2"
            >
              <Filter size={18} />
              <span className="text-sm font-bold">Filters</span>
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="pl-9 pr-8 py-2 text-sm bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="all">Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                <select 
                  value={selectedEggType}
                  onChange={(e) => setSelectedEggType(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="all">Egg Types</option>
                  {eggTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                <select 
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm bg-white border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="all">Suppliers</option>
                  {suppliers.map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex bg-white border border-emerald-100 rounded-2xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'map' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-600'}`}
                title="Map View"
              >
                <MapIcon size={18} />
              </button>
            </div>

            {/* Mobile Cart Toggle */}
            <button 
              onClick={() => setShowMobileCart(true)}
              className="lg:hidden relative p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Grid / Map View */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === 'map' ? (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <MapIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900">Interactive Supplier Map</h3>
                      <p className="text-emerald-500 text-xs">Find fresh eggs near you by browsing our local farmers.</p>
                    </div>
                  </div>
                  <SupplierMap 
                    suppliers={farmers} 
                    onSupplierClick={(id) => {
                      const farmer = farmers.find(f => f.id === id);
                      if (farmer) {
                        setSelectedSupplier(farmer.name);
                        setViewMode('grid');
                      }
                    }}
                  />
                </div>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 4].map(i => (
                  <div key={i} className="h-80 bg-white rounded-3xl animate-pulse border border-emerald-50" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProducts.map(product => (
                  <motion.div 
                    layout
                    key={product.id}
                    className="bg-white rounded-3xl overflow-hidden border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all group"
                  >
                    <div className="relative h-32 md:h-48 overflow-hidden">
                      <img 
                        src={product.image_url || EGG_PLACEHOLDER} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 md:top-4 md:left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm">
                          {product.category_name}
                        </span>
                      </div>
                      {product.stock < 10 && (
                        <div className="absolute top-2 right-2 md:top-4 md:right-4">
                          <span className="bg-orange-500 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full uppercase tracking-wider">
                            Low Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-emerald-900 text-base md:text-lg">{product.name}</h3>
                        <span className="text-emerald-600 font-bold text-sm md:text-base">₱{Number(product.price).toFixed(2)}</span>
                      </div>
                      
                      {product.egg_type && (
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                          Type: <span className="text-emerald-600">{product.egg_type}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.price_per_dozen && Number(product.price_per_dozen) > 0 && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
                            ₱{Number(product.price_per_dozen).toFixed(2)} / dozen
                          </span>
                        )}
                        {product.price_per_tray && Number(product.price_per_tray) > 0 && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
                            ₱{Number(product.price_per_tray).toFixed(2)} / tray
                          </span>
                        )}
                      </div>

                      <p className="text-emerald-500 text-xs md:text-sm mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-emerald-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] md:text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Supplier</span>
                          <div className="flex flex-col">
                            <button 
                              onClick={() => fetchFarmerReviews(product.farmer_id, product.farmer_name || '', product.farmer_address, product.farmer_purok)}
                              className="text-xs md:text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:underline transition-all text-left"
                            >
                              {product.farmer_name}
                            </button>
                            <p className="text-[9px] md:text-[10px] text-emerald-400">
                              {product.farmer_address} {product.farmer_purok ? `(Purok ${product.farmer_purok})` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                navigate('/auth');
                              } else {
                                navigate(`/messages?farmerId=${product.farmer_id}&farmerName=${encodeURIComponent(product.farmer_name || '')}`);
                              }
                            }}
                            className="p-2 md:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                            title="Message Farmer"
                          >
                            <MessageSquare size={18} />
                          </button>
                          
                          <div className="relative group/menu">
                            <button 
                              onClick={() => {
                                if (product.stock > 0) addToCart(product, 'unit');
                                else if ((product.stock_dozen || 0) > 0) addToCart(product, 'dozen');
                                else if ((product.stock_tray || 0) > 0) addToCart(product, 'tray');
                              }}
                              disabled={product.stock === 0 && (product.stock_tray || 0) === 0 && (product.stock_dozen || 0) === 0}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center gap-1.5 md:gap-2"
                            >
                              <Plus size={18} />
                              <span className="text-xs md:text-sm font-bold pr-1">Add</span>
                            </button>
                            
                            <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-2xl shadow-2xl border border-emerald-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                              <div className="p-2 bg-emerald-50 border-b border-emerald-100">
                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider text-center">Select Unit</p>
                              </div>
                              <div className="p-1">
                                {product.stock > 0 && (
                                  <button 
                                    onClick={() => addToCart(product, 'unit')}
                                    className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl flex justify-between items-center group/item"
                                  >
                                    <span>Per Unit</span>
                                    <span className="text-[10px] font-bold text-emerald-400 group-hover/item:text-emerald-600">₱{Number(product.price).toFixed(2)}</span>
                                  </button>
                                )}
                                {product.price_per_dozen && product.price_per_dozen > 0 && (product.stock_dozen || 0) > 0 && (
                                  <button 
                                    onClick={() => addToCart(product, 'dozen')}
                                    className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl flex justify-between items-center group/item"
                                  >
                                    <span>Per Dozen</span>
                                    <span className="text-[10px] font-bold text-emerald-400 group-hover/item:text-emerald-600">₱{Number(product.price_per_dozen).toFixed(2)}</span>
                                  </button>
                                )}
                                {product.price_per_tray && Number(product.price_per_tray) > 0 && (product.stock_tray || 0) > 0 && (
                                  <button 
                                    onClick={() => addToCart(product, 'tray')}
                                    className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl flex justify-between items-center group/item"
                                  >
                                    <span>Per Tray</span>
                                    <span className="text-[10px] font-bold text-emerald-400 group-hover/item:text-emerald-600">₱{Number(product.price_per_tray).toFixed(2)}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100">
                <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-400 mb-4">
                  <Search size={48} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">No products found</h3>
                <p className="text-emerald-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl sticky top-24 overflow-hidden">
              <div className="p-4 md:p-6 bg-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <h2 className="font-bold text-sm md:text-base">Your Cart</h2>
                </div>
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">{cart.length} items</span>
              </div>

              <div className="p-4 md:p-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-emerald-400 text-xs italic">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {cart.map(item => (
                      <div key={`${item.product.id}-${item.unit}`} className="flex gap-2 md:gap-3">
                        <img 
                          src={item.product.image_url || EGG_PLACEHOLDER} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-emerald-900 text-xs md:text-sm truncate">{item.product.name}</h4>
                          <div className="flex flex-col">
                            <span className="text-[9px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{item.product.farmer_name}</span>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              {item.product.egg_type && (
                                <span className="text-[9px] md:text-[10px] text-emerald-500 italic">{item.product.egg_type}</span>
                              )}
                              <select 
                                value={item.unit}
                                onChange={(e) => changeCartItemUnit(item.product.id, item.unit, e.target.value as any)}
                                className="bg-emerald-100 text-emerald-700 text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase outline-none border-none cursor-pointer hover:bg-emerald-200 transition-colors"
                              >
                                {item.product.stock > 0 && <option value="unit">Unit</option>}
                                {item.product.price_per_dozen && item.product.price_per_dozen > 0 && (item.product.stock_dozen || 0) > 0 && <option value="dozen">Dozen</option>}
                                {item.product.price_per_tray && item.product.price_per_tray > 0 && (item.product.stock_tray || 0) > 0 && <option value="tray">Tray</option>}
                              </select>
                            </div>
                          </div>
                          <p className="text-emerald-500 text-[10px] md:text-xs mt-0.5 md:mt-1">₱{getItemPrice(item).toFixed(2)} / {item.unit}</p>
                          <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                            <div className="flex items-center gap-1.5 md:gap-2 bg-emerald-50 rounded-lg px-1.5 py-0.5 md:px-2 md:py-1">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.unit, -1)}
                                className="text-emerald-600 hover:bg-emerald-100 rounded p-0.5"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-[10px] md:text-xs font-bold text-emerald-700 w-3 md:w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.unit, 1)}
                                className="text-emerald-600 hover:bg-emerald-100 rounded p-0.5"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button 
                              onClick={() => {
                                setProductToRemove({ id: item.product.id, unit: item.unit });
                                setShowRemoveConfirm(true);
                              }}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-all"
                              title="Remove from cart"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 bg-emerald-50 border-t border-emerald-100">
                <div className="flex justify-between items-center mb-3 md:mb-4">
                  <span className="text-emerald-600 font-medium text-sm">Total Amount</span>
                  <span className="text-xl md:text-2xl font-bold text-emerald-900">₱{totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-200 text-white font-bold py-3 md:py-4 rounded-xl md:rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 text-sm md:text-base"
                >
                  {user ? 'Checkout Now' : 'Login to Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-end lg:hidden">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full rounded-t-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-emerald-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Egg Type</label>
                  <select 
                    value={selectedEggType}
                    onChange={(e) => setSelectedEggType(e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">All Types</option>
                    {eggTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Supplier</label>
                  <select 
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">All Suppliers</option>
                    {suppliers.map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold"
              >
                Apply Filters
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Farmer Reviews Modal */}
      <AnimatePresence>
        {selectedFarmer && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-xl">{selectedFarmer.name}</h3>
                  {selectedFarmer.address && (
                    <p className="text-emerald-100 text-[10px] flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {selectedFarmer.purok && `Purok ${selectedFarmer.purok}, `}
                      {selectedFarmer.address}
                      <a 
                        href={selectedFarmer.latitude && selectedFarmer.longitude 
                          ? `https://www.google.com/maps/search/?api=1&query=${selectedFarmer.latitude},${selectedFarmer.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedFarmer.purok ? `Purok ${selectedFarmer.purok}, ` : ''}${selectedFarmer.address}`)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline font-bold"
                      >
                        Map
                      </a>
                    </p>
                  )}
                  <p className="text-emerald-100 text-[10px] mt-0.5">Customer Reviews & Ratings</p>
                </div>
                <button onClick={() => setSelectedFarmer(null)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {loadingReviews ? (
                  <div className="text-center py-12 text-emerald-400">Loading reviews...</div>
                ) : farmerReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200 mx-auto mb-4">
                      <Star size={32} />
                    </div>
                    <p className="text-emerald-500 font-medium">No reviews yet for this farmer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {farmerReviews.map(review => (
                      <div key={review.id} className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-emerald-900 text-sm">{review.customer_name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  size={10} 
                                  fill={review.rating >= star ? 'currentColor' : 'none'} 
                                  className={review.rating >= star ? 'text-orange-400' : 'text-emerald-200'}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-emerald-700 text-sm italic">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-emerald-50 border-t border-emerald-100 shrink-0">
                <button 
                  onClick={() => setSelectedFarmer(null)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

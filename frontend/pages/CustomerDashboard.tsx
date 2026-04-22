import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Order, OrderItem } from '../types';
import { 
  ClipboardList, 
  History, 
  User as UserIcon, 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Truck,
  ShoppingBag,
  MessageSquare,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import MessagingSystem from '../components/MessagingSystem';

import ConfirmationModal from '../components/ConfirmationModal';

/**
 * CustomerDashboard Component
 * Provides a dedicated space for customers to manage their activity.
 * Features:
 * - Active order tracking with live status updates
 * - Comprehensive purchase history
 * - Profile and delivery address management
 * - Direct messaging with farmers and support
 */
export default function CustomerDashboard() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  
  // Tab-based navigation state
  const [activeTab, setActiveTab] = useState('my-orders');
  
  // Data collection states
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State for the detail modal
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // Items associated with the selected order
  const [loading, setLoading] = useState(true);
  
  // Local form state for profile management
  const [profileData, setProfileData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    purok: '' 
  });
  
  // Cancellation workflow state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  /**
   * Sync local form state with global auth context
   */
  useEffect(() => {
    if (user) {
      fetchOrders();
      setProfileData({ 
        name: user.name, 
        email: user.email, 
        phone: user.phone || '', 
        address: user.address || '',
        purok: user.purok || ''
      });
    }
  }, [user]);

  const showNotify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    showToast(message, type);
  };

  /**
   * Fetches only orders belonging to the logged-in customer
   */
  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders/customer/${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Drills down into a specific order to retrieve product-level details
   */
  const fetchOrderItems = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/items`);
      if (!response.ok) throw new Error('Failed to fetch order items');
      const data = await response.json();
      setOrderItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching order items:', err);
    }
  };
  
  /**
   * Soft cancel logic: Only allowed for 'pending' orders
   */
  const handleCancelOrder = async (orderId: number) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
  };

  /**
   * Persists the cancellation to the server
   */
  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const response = await fetch(`/api/orders/${orderToCancel}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        setSelectedOrder(null);
        fetchOrders();
        showNotify('Order cancelled successfully', 'success');
      } else {
        const data = await response.json();
        showNotify(data.error || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      showNotify('An error occurred while cancelling the order', 'error');
    }
  };

  /**
   * Triggers the UI modal for viewing order specifics
   */
  const handleViewDetails = (order: Order) => {
    setOrderItems([]);
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  /**
   * Handles profile persistence
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (response.ok) {
        // Synchronize local auth state immediately
        updateUser(data);
        showNotify('Profile updated successfully!', 'success');
      } else {
        showNotify(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showNotify('An error occurred', 'error');
    }
  };

  const renderOrders = (filterType: 'active' | 'history') => {
    const filteredOrders = orders.filter(o => {
      if (filterType === 'active') {
        return o.status === 'pending' || o.status === 'processing' || o.status === 'on the way';
      } else {
        return o.status === 'delivered' || o.status === 'cancelled';
      }
    });

    return (
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <motion.div 
            layout
            key={order.id}
            className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleViewDetails(order)}
          >
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                  order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                  order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                  order.status === 'on the way' ? 'bg-purple-50 text-purple-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">Order #{order.id}</h3>
                  <p className="text-xs text-emerald-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Total</p>
                  <p className="font-bold text-emerald-900">₱{order.total_amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'on the way' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {order.status}
                  </span>
                  <ChevronRight size={20} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border border-emerald-100">
            <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-300 mb-4">
              <ShoppingBag size={48} />
            </div>
            <h3 className="text-xl font-bold text-emerald-900">No orders found</h3>
            <p className="text-emerald-500">You haven't placed any orders yet.</p>
            <button 
              onClick={() => window.location.href = '/marketplace'}
              className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
            >
              Go to Marketplace
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-emerald-900">
            {activeTab === 'my-orders' ? 'Active Orders' : 
             activeTab === 'history' ? 'Purchase History' : 'Profile Settings'}
          </h1>
        </div>

        {activeTab === 'my-orders' && (
          <>
            <div className="bg-emerald-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-100 mb-8">
              <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6">
                <div className="w-16 h-16 bg-emerald-800 rounded-3xl flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">Need help with an order?</h3>
                  <p className="text-emerald-300 text-sm">Our support team is here to assist you with any concerns.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/messages?role=admin')}
                className="w-full md:w-auto bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                Contact Support
              </button>
            </div>
            {renderOrders('active')}
          </>
        )}
        {activeTab === 'history' && renderOrders('history')}
        {activeTab === 'messages' && (
          <div className="h-[calc(100vh-12rem)]">
            <MessagingSystem />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 md:p-8 max-w-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
              <div className="w-24 h-24 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-4xl font-bold shrink-0">
                {user?.name?.[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">{user?.name}</h2>
                <p className="text-emerald-500">{user?.email}</p>
                <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email} 
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileData.phone} 
                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                    placeholder="09123456789"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Purok</label>
                  <input 
                    type="text" 
                    value={profileData.purok} 
                    onChange={e => setProfileData({ ...profileData, purok: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                    placeholder="Purok 1"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivery Address</label>
                <textarea 
                  rows={3}
                  value={profileData.address} 
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" 
                  placeholder="Street address, City, State, ZIP"
                />
              </div>
              <button 
                type="submit"
                className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
              >
                Update Profile
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
      />

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-xl">Order Details</h3>
                  <p className="text-emerald-100 text-xs">Order #{selectedOrder.id} • {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                {/* Status Timeline */}
                <div className="flex justify-between mb-12 relative px-2 md:px-4">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-100 -translate-y-1/2 z-0" />
                  {[
                    { id: 'pending', icon: Clock, label: 'Pending' },
                    { id: 'processing', icon: Package, label: 'Processing' },
                    { id: 'on the way', icon: Truck, label: 'On the Way' },
                    { id: 'delivered', icon: CheckCircle2, label: 'Delivered' }
                  ].map((step, i) => {
                    const isCompleted = orders.find(o => o.id === selectedOrder.id)?.status === step.id || 
                                      (step.id === 'pending' && selectedOrder.status !== 'cancelled') ||
                                      (step.id === 'processing' && (selectedOrder.status === 'on the way' || selectedOrder.status === 'delivered')) ||
                                      (step.id === 'on the way' && selectedOrder.status === 'delivered');
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 border-white shadow-sm ${
                          isCompleted ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-300'
                        }`}>
                          <step.icon size={14} className="md:w-[18px] md:h-[18px]" />
                        </div>
                        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-center ${
                          isCompleted ? 'text-emerald-700' : 'text-emerald-300'
                        }`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold text-emerald-900 border-b border-emerald-50 pb-2">Items Ordered</h4>
                  <div className="space-y-4">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4">
                          <img src={item.image_url} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-emerald-900 text-sm md:text-base">{item.name}</p>
                            <div className="flex flex-col">
                              {item.egg_type && (
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Type: {item.egg_type}</p>
                              )}
                              <p className="text-xs md:text-sm text-emerald-500">{item.quantity} {item.unit || 'unit'}(s) x ₱{Number(item.price).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-emerald-900 text-sm md:text-base">₱{(item.quantity * Number(item.price)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-emerald-50 flex justify-between items-center">
                    <span className="text-emerald-600 font-bold">Total Paid</span>
                    <span className="text-2xl md:text-3xl font-bold text-emerald-900">₱{Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>

                  {/* Supplier Info */}
                  <div className="pt-6 border-t border-emerald-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-emerald-900">Supplier Information</h4>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(null);
                          navigate(`/messages?role=farmer&userId=${selectedOrder.farmer_id}&userName=${encodeURIComponent(selectedOrder.farmer_name)}`);
                        }}
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                      >
                        <MessageSquare size={14} />
                        Contact Farmer
                      </button>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 space-y-2">
                      <p className="text-sm font-bold text-emerald-900">{selectedOrder.farmer_name}</p>
                      {selectedOrder.farmer_phone && (
                        <p className="text-xs text-emerald-600">Phone: {selectedOrder.farmer_phone}</p>
                      )}
                      {selectedOrder.farmer_address && (
                        <div className="mt-2">
                          <p className="text-xs text-emerald-600 flex items-center gap-1">
                            <MapPin size={12} />
                            Address: {selectedOrder.farmer_address} 
                            {selectedOrder.farmer_purok ? ` (Purok ${selectedOrder.farmer_purok})` : ''}
                          </p>
                          <a 
                            href={selectedOrder.farmer_latitude && selectedOrder.farmer_longitude 
                              ? `https://www.google.com/maps/search/?api=1&query=${selectedOrder.farmer_latitude},${selectedOrder.farmer_longitude}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedOrder.farmer_purok ? `Purok ${selectedOrder.farmer_purok}, ` : ''}${selectedOrder.farmer_address}`)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline font-bold mt-1 inline-block"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-emerald-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                  {selectedOrder.farmer_id && (
                    <button 
                      onClick={() => navigate(`/messages?farmerId=${selectedOrder.farmer_id}&farmerName=${encodeURIComponent(selectedOrder.farmer_name || '')}`)}
                      className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-all text-sm"
                    >
                      <MessageSquare size={18} />
                      <span>Message Farmer</span>
                    </button>
                  )}
                  {selectedOrder.status === 'pending' && (
                    <button 
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="flex items-center gap-2 text-red-600 font-bold hover:text-red-700 transition-all text-sm"
                    >
                      <XCircle size={18} />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { User, Order } from '../types';
import { User as UserIcon, MapPin, Phone, Mail, Package, Clock, ChevronRight, Save, Edit2, Home, X, Shield, Star, Truck, CheckCircle2, Eye, EyeOff, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom component to handle map click and update location
function LocationPickerMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    // Fly to new position when coordinates change (e.g. from GPS or initial load)
    if (position[0] && position[1]) {
      map.flyTo(position, map.getZoom());
    }
  }, [position[0], position[1]]);

  return (
    <Marker position={position} />
  );
}

/**
 * Profile Component
 * Provides a comprehensive interface for users to manage their profile, 
 * view order history, update security settings, and leave reviews.
 */
export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  
  // UI and loading states
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states for profile, security, and reviews
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    purok: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  /**
   * Synchronize local form data with authenticated user object on mount/change
   */
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        purok: user.purok || '',
        latitude: user.latitude,
        longitude: user.longitude
      });
      fetchOrders();
    }
  }, [user]);

  /**
   * Helper to display notifications using the central toast system
   */
  const showNotify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    showToast(message, type);
  };

  /**
   * Fetches the user's order history from the backend
   */
  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/customer/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      // Logic: Silent error allows profile info to still be visible if orders fail
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retrieves specific line items for an expanded order view
   */
  const fetchOrderItems = async (orderId: number) => {
    setOrderItems([]);
    try {
      const res = await fetch(`/api/orders/${orderId}/items`);
      if (res.ok) {
        const data = await res.json();
        setOrderItems(data);
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
    }
  };

  /**
   * Opens the order details modal and starts data fetch
   */
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  /**
   * Uses browser Geolocation API to capture current coordinates
   * Primarily used by farmers for map placement
   */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showNotify('Geolocation is not supported by your browser', 'error');
      return;
    }

    showNotify('Fetching location...', 'info');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        showNotify('Location captured successfully!', 'success');
      },
      (error) => {
        showNotify('Unable to retrieve your location. Please check browser permissions.', 'error');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  /**
   * Updates standard user profile fields in the database
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation matching backend requirements
    if (formData.phone && formData.phone.length !== 11) {
      showNotify('Phone number must be exactly 11 digits', 'error');
      return;
    }

    setSaveLoading(true);

    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUserData = await res.json();
        updateUser(updatedUserData); // Sync global auth context
        setIsEditing(false);
        showNotify('Profile updated successfully!', 'success');
      } else {
        const errorData = await res.json();
        showNotify(errorData.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showNotify('An error occurred.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  /**
   * Handles password reset logic, including current password verification
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      showNotify('New passwords do not match.', 'error');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch(`/api/users/${user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });

      if (res.ok) {
        showNotify('Password updated successfully!', 'success');
        setShowSecurityModal(false);
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await res.json();
        showNotify(errorData.error || 'Failed to update password.', 'error');
      }
    } catch (err) {
      showNotify('An error occurred.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  /**
   * Submits a farmer review for a completed order
   */
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !user) return;

    setSaveLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.id,
          farmer_id: (selectedOrder as any).farmer_id,
          order_id: selectedOrder.id,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      });

      if (res.ok) {
        showNotify('Review submitted successfully!', 'success');
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
        fetchOrders(); // Refresh status to disable future reviews for this order
      } else {
        const errorData = await res.json();
        showNotify(errorData.error || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      showNotify('An error occurred.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  /**
   * Helper: Map order status strings to Tailwind CSS color classes
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'on the way': return 'bg-purple-100 text-purple-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout activeTab="profile" setActiveTab={() => {}}>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-900">My Profile</h1>
            <p className="text-sm md:text-base text-emerald-600">Manage your account and delivery details</p>
          </div>
          {!isEditing && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 md:py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <Edit2 size={18} /> Edit Profile
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 md:p-8 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <UserIcon size={40} className="md:w-12 md:h-12" />
              </div>
              <h2 className="text-xl font-bold text-emerald-900">{user?.name}</h2>
              <p className="text-emerald-500 text-sm capitalize">{user?.role}</p>
              
              <div className="mt-6 md:mt-8 space-y-4 text-left">
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                    <Phone size={16} />
                  </div>
                  <span className="text-sm">{user?.phone || 'No phone added'}</span>
                </div>
                <div className="flex items-start gap-3 text-emerald-700">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mt-0.5 shrink-0">
                    <Home size={16} />
                  </div>
                  <span className="text-sm leading-relaxed">{user?.purok || 'No purok added'}</span>
                </div>
                <div className="flex items-start gap-3 text-emerald-700">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mt-0.5 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm leading-relaxed">{user?.address || 'No address added'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 md:p-8"
              >
                <h3 className="text-lg md:text-xl font-bold text-emerald-900 mb-6">Edit Account Details</h3>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 11) {
                            setFormData({ ...formData, phone: val });
                          }
                        }}
                        className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="09123456789"
                        maxLength={11}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Purok</label>
                      <input 
                        type="text" 
                        value={formData.purok}
                        onChange={e => setFormData({ ...formData, purok: e.target.value })}
                        className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Purok 1"
                      />
                    </div>
                    {/* Map Location for both Farmers and Customers */}
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                        <MapPin size={14} /> Map Location & Pin
                      </label>
                      
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm flex items-center gap-2">
                            <Navigation size={16} className="shrink-0" />
                            {formData.latitude && formData.longitude 
                              ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                              : 'No coordinates set'}
                          </div>
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                          >
                            <Navigation size={18} /> GPS Locate
                          </button>
                        </div>

                        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-emerald-100 shadow-inner z-0">
                          <MapContainer 
                            center={[formData.latitude || 14.5995, formData.longitude || 120.9842]} 
                            zoom={15} 
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              attribution='&copy; OpenStreetMap contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationPickerMarker 
                              position={[formData.latitude || 14.5995, formData.longitude || 120.9842]}
                              setPosition={(pos) => setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }))}
                            />
                          </MapContainer>
                        </div>
                        
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            <strong>How to use:</strong> You can click on the map to manually move the pin to your exact {user?.role === 'farmer' ? 'shop' : 'delivery'} location, or use the <strong>GPS Locate</strong> button to find your current position automatically.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivery Address</label>
                    <textarea 
                      rows={2}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button 
                      type="submit"
                      disabled={saveLoading}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
                    >
                      {saveLoading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto px-8 py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Order History Section */}
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-emerald-50 flex justify-between items-center">
                    <h3 className="text-lg md:text-xl font-bold text-emerald-900 flex items-center gap-2">
                      <Package className="text-emerald-500" /> Order History
                    </h3>
                    <span className="text-[10px] md:text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                      {orders.length} Orders
                    </span>
                  </div>
                  
                  {loading ? (
                    <div className="p-12 text-center text-emerald-400">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200 mx-auto mb-4">
                        <Package size={32} />
                      </div>
                      <p className="text-emerald-500 font-medium">No orders found yet.</p>
                      <button className="mt-4 text-emerald-600 font-bold hover:underline">Start Shopping</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-emerald-50">
                      {orders.map(order => (
                        <div 
                          key={order.id} 
                          className="p-5 md:p-6 hover:bg-emerald-50/30 transition-all group cursor-pointer"
                          onClick={() => handleViewDetails(order)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                                <Package size={20} className="md:w-6 md:h-6" />
                              </div>
                              <div>
                                <p className="font-bold text-emerald-900 text-sm md:text-base">Order #{order.id}</p>
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-emerald-500 font-medium">
                                  <Clock size={10} className="md:w-3 md:h-3" />
                                  {new Date(order.created_at).toLocaleDateString(undefined, { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto">
                              <p className="font-bold text-emerald-900 text-base md:text-lg">₱{Number(order.total_amount).toFixed(2)}</p>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-2">
                              {order.status === 'delivered' && !(order as any).is_reviewed && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                    setShowReviewModal(true);
                                  }}
                                  className="text-[10px] md:text-xs font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                                >
                                  Leave Review
                                </button>
                              )}
                              {(order as any).is_reviewed > 0 && (
                                <span className="text-[10px] md:text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                                  Reviewed
                                </span>
                              )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] md:text-xs font-bold text-emerald-600 flex items-center gap-1">
                                View Details <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Security Section */}
                <div className="bg-emerald-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-lg font-bold mb-1">Account Security</h4>
                    <p className="text-emerald-300 text-sm">Update your password or manage your account security.</p>
                  </div>
                  <button 
                    onClick={() => setShowSecurityModal(true)}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-2xl font-bold transition-all text-sm"
                  >
                    Manage Security
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && !showReviewModal && (
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
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-emerald-50 pb-4">
                    <div>
                      <h4 className="font-bold text-emerald-900">Status</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-emerald-900">Date</h4>
                      <p className="text-sm text-emerald-600">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-emerald-900">Items Ordered</h4>
                  <div className="space-y-4">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={item.image_url} className="w-16 h-16 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-emerald-900">{item.name}</p>
                            <div className="flex flex-col">
                              {item.egg_type && (
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Type: {item.egg_type}</p>
                              )}
                              <p className="text-sm text-emerald-500">{item.quantity} {item.unit || 'unit'}(s) x ₱{Number(item.price).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-emerald-900">₱{(item.quantity * Number(item.price)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-emerald-50 flex justify-between items-center">
                    <span className="text-emerald-600 font-bold">Total Amount</span>
                    <span className="text-3xl font-bold text-emerald-900">₱{Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>

                  {/* Supplier Info */}
                  <div className="pt-6 border-t border-emerald-50">
                    <h4 className="font-bold text-emerald-900 mb-2">Supplier Information</h4>
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

              <div className="p-6 bg-emerald-50 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {showSecurityModal && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Shield size={24} />
                  <h3 className="font-bold text-xl">Account Security</h3>
                </div>
                <button onClick={() => setShowSecurityModal(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handlePasswordChange} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      required
                      value={securityData.currentPassword}
                      onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      required
                      value={securityData.newPassword}
                      onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    required
                    value={securityData.confirmPassword}
                    onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={saveLoading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saveLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-xl">Review Farmer</h3>
                <button onClick={() => setShowReviewModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <p className="text-sm text-emerald-600">How was your experience with <strong>{(selectedOrder as any)?.farmer_name}</strong>?</p>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className={`p-2 rounded-lg transition-all ${
                          reviewData.rating >= star ? 'text-orange-400' : 'text-emerald-100'
                        }`}
                      >
                        <Star size={24} fill={reviewData.rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Comment</label>
                  <textarea 
                    rows={3}
                    required
                    value={reviewData.comment}
                    onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="Share your experience..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={saveLoading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saveLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

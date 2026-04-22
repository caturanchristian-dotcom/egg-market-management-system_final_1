import React, { useState } from 'react';
import { ShoppingCart, User as UserIcon, LogOut, Bell, Menu, X, Egg, Home, Clock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void; // Trigger for opening the mobile sidebar
  cartCount?: number;
}

/**
 * Navbar Component
 * The persistent top navigation bar across all authenticated views.
 * Features:
 * - Real-time notification center with unread count tracking
 * - Role-specific shopping cart entry for customers
 * - User profile quick-access menu
 * - Responsive trigger for the platform sidebar
 */
export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { cart, setIsCartOpen } = useCart();
  
  // Local state for UI popovers
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 md:h-16 items-center">
          {/* Brand and Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:gap-4">
            {onMenuClick && (
              <button 
                onClick={onMenuClick}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-1.5 text-emerald-700 font-bold text-lg md:text-xl">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-emerald-100 bg-white">
                <img 
                  src="https://img.freepik.com/premium-vector/chicken-eggs-farm-logo_59362-509.jpg" 
                  alt="Egg Market System Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="hidden sm:inline">Egg Market <span className="text-emerald-500">System</span></span>
            </Link>
          </div>

          {/* Action Icons: Cart, Notifications, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Cart available for customers only */}
            {user?.role === 'customer' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 rounded-full hover:bg-emerald-50 text-emerald-700 transition-colors"
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
            
            {/* Notification Center Popover */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-700 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Dark backdrop for mobile focus */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-40 md:hidden"
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10, x: window.innerWidth < 768 ? '-50%' : 0 }}
                      animate={{ opacity: 1, y: 0, x: window.innerWidth < 768 ? '-50%' : 0 }}
                      exit={{ opacity: 0, y: 10, x: window.innerWidth < 768 ? '-50%' : 0 }}
                      className="fixed md:absolute top-16 md:top-auto left-1/2 md:left-auto right-auto md:right-0 mt-2 w-[calc(100%-2rem)] md:w-80 bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50"
                    >
                      {/* Notification List Header */}
                      <div className="p-4 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/50">
                        <div className="flex items-center gap-2">
                          <Bell size={18} className="text-emerald-600" />
                          <h3 className="font-bold text-emerald-900">Notifications</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-xs text-emerald-600 font-bold hover:underline"
                            >
                              Mark all as read
                            </button>
                          )}
                          <button onClick={() => setShowNotifications(false)} className="md:hidden text-emerald-400">
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Dynamic Notification Feed */}
                      <div className="max-h-[60vh] md:max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-200 mx-auto">
                              <Bell size={24} />
                            </div>
                            <p className="text-emerald-400 italic text-sm">No notifications yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-emerald-50">
                            {notifications.map((n) => (
                              <div 
                                key={n.id} 
                                className={`p-4 hover:bg-emerald-50/50 transition-colors cursor-pointer ${!n.is_read ? 'bg-emerald-50/30' : ''}`}
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (window.innerWidth < 768) setShowNotifications(false);
                                }}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-emerald-500' : 'bg-transparent'}`} />
                                  <div className="flex-1">
                                    <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-emerald-900 font-semibold' : 'text-emerald-700'}`}>
                                      {n.message}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-medium">
                                      <Clock size={10} />
                                      {new Date(n.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 bg-emerald-50/30 border-t border-emerald-50 text-center">
                          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View all activity</button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Account Popover */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-emerald-50 border border-emerald-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {user?.name?.[0] || '?'}
                </div>
                <span className="hidden md:inline text-sm font-medium text-emerald-900 pr-2">{user?.name || 'Guest'}</span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-emerald-50 py-1 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-emerald-50">
                      <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">{user?.role}</p>
                      <p className="text-sm font-medium text-emerald-900 truncate">{user?.email}</p>
                    </div>
                    {/* Role-contextual shortcuts */}
                    <Link to="/" className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                      <Home size={16} /> Go to Home Page
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                    >
                      <UserIcon size={16} /> Profile Settings
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

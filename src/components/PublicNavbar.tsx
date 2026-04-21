import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Egg, Menu, X, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(user && (user.role === 'admin' || user.role === 'farmer') ? [] : [{ name: 'Marketplace', path: '/marketplace' }]),
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-emerald-700 font-bold text-2xl">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-100 bg-white shadow-lg shadow-emerald-100">
              <img 
                src="https://img.freepik.com/premium-vector/chicken-eggs-farm-logo_59362-509.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="tracking-tight">Egg Market <span className="text-emerald-500">System</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold transition-colors ${
                  isActive(link.path) ? 'text-emerald-600' : 'text-emerald-500 hover:text-emerald-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100 mr-2"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <Link 
                to={user.role === 'admin' ? '/admin' : user.role === 'farmer' ? '/farmer' : '/marketplace'}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                <UserIcon size={18} /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
                  Login
                </Link>
                <Link 
                  to="/auth?mode=register" 
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-emerald-50 text-emerald-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-emerald-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold ${
                    isActive(link.path) ? 'bg-emerald-50 text-emerald-700' : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-emerald-50 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold"
                >
                  <ShoppingCart size={20} />
                  Cart ({cart.length})
                </button>

                {user ? (
                  <Link 
                    to="/marketplace"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-center"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold text-center"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/auth?mode=register"
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Egg, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Phone, MapPin, Home, Eye, EyeOff, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';

// Helper component for map click selection
function RegistrationLocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} />;
}

/**
 * AuthPage Component
 * Handles user authentication including Login and Registration.
 */
export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Local state for UI toggles and processing status
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Custom auth hook for session management
  const { login, user, refreshUser } = useAuth();

  /**
   * Redirect authenticated users to their respective dashboards
   */
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'farmer') navigate('/farmer');
      else navigate('/marketplace');
    }
  }, [user, navigate]);

  /**
   * Handle 'mode' query parameter (e.g., ?mode=register) to toggle view on mount
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'register') {
      setIsLogin(false);
    }
  }, [location]);

  // Combined state object for all possible registration/login fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
    purok: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  /**
   * Main form submission handler (Login & Register)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    // Front-end validation: Phone must be 11 digits
    if (!isLogin && formData.phone.length !== 11) {
      setError('Phone number must be exactly 11 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Update client-side auth state
        login(data);
      } else {
        // Logic Failure: Show specific error from backend (e.g., "Email already exists")
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100"
        >
          <Home size={18} /> Back to Home Page
        </Link>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100"
      >
        <div className="bg-emerald-600 p-8 text-white text-center">
          <div className="inline-flex w-24 h-24 bg-white rounded-full mb-6 overflow-hidden shadow-2xl border-4 border-emerald-500/30">
            <img 
              src="https://img.freepik.com/premium-vector/chicken-eggs-farm-logo_59362-509.jpg" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold">Egg Market System</h1>
          <p className="text-emerald-100 mt-2">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Join our community of farmers and egg lovers.'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <div className="w-1 h-1 bg-red-600 rounded-full" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 11) {
                          setFormData({ ...formData, phone: val });
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="09123456789"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">Purok</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.purok}
                        onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Purok 1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Street, City"
                      />
                    </div>
                  </div>
                </div>

              </>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.role === 'customer' 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Customer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.role === 'farmer' 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Farmer
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <MapPin size={14} /> Map Location (Pin your address)
                </label>
                
                <div className="h-[200px] w-full rounded-xl overflow-hidden border border-emerald-100 z-0">
                  <MapContainer 
                    center={[formData.latitude || 14.5995, formData.longitude || 120.9842]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <RegistrationLocationMarker 
                      position={[formData.latitude || 14.5995, formData.longitude || 120.9842]}
                      setPosition={(pos) => setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }))}
                    />
                  </MapContainer>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-emerald-50 text-[10px] text-emerald-600 rounded-lg flex items-center gap-2 font-mono">
                    {formData.latitude ? `${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}` : 'No coordinates selected'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                        });
                      }
                    }}
                    className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-all flex items-center gap-1"
                  >
                    <Navigation size={12} /> GPS
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

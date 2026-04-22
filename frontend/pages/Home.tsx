import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { EGG_PLACEHOLDER } from '../constants';
import { 
  ArrowRight, 
  Egg, 
  ShieldCheck, 
  Truck, 
  Users, 
  Star, 
  ShoppingBag, 
  CheckCircle2, 
  MapPin,
  ChevronRight,
  Quote,
  Leaf,
  Heart,
  Award
} from 'lucide-react';
import { Product } from '../types';

/**
 * Home Component
 * The platform's primary marketing landing page.
 * Responsibilities:
 * - High-impact brand storytelling via visual hero sections
 * - Product discovery through 'Featured' item carousels
 * - Educational content about the farm-to-table process
 * - Conversion funnels for both Customers and prospective Farmers
 */
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  /**
   * Fetches a subset of the global catalog for social proof and engagement
   */
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => setFeaturedProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(err => console.error('Error fetching featured products:', err));
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section: The "Aha!" moment of the brand */}
      <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center pt-20 pb-16 lg:pt-0 lg:pb-0 overflow-hidden bg-white">
        {/* Visual accents for modern editorial feel */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/30 -z-10 hidden lg:block" />
        <div className="absolute -top-24 -left-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-100/20 rounded-full blur-[80px] md:blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-orange-50/30 rounded-full blur-[60px] md:blur-[80px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left">
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 md:gap-3 bg-emerald-50 text-emerald-700 px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm border border-emerald-100/50"
              >
                <Leaf size={12} className="text-emerald-500 md:w-3.5 md:h-3.5" />
                Fresh from local farms to your table
              </motion.div>
              
              {/* Primary Value Proposition */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold text-emerald-950 leading-[0.95] tracking-tight"
              >
                The Gold <br className="hidden sm:block" />
                Standard of <br className="hidden sm:block" />
                <span className="text-emerald-600 italic">Freshness.</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-base md:text-xl text-emerald-800/70 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
              >
                Connect directly with local farmers for eggs laid just hours ago. Experience superior taste, nutrition, and community impact in every bite.
              </motion.p>
              
              {/* Primary Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center lg:justify-start pt-2 md:pt-4"
              >
                <Link
                  to="/marketplace"
                  className="bg-emerald-900 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold hover:bg-emerald-950 transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center gap-3 group active:scale-95 text-base md:text-lg"
                >
                  Shop Marketplace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="bg-white text-emerald-900 border border-emerald-200 px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold hover:bg-emerald-50 transition-all text-center active:scale-95 text-base md:text-lg shadow-sm"
                >
                  Learn Our Story
                </Link>
              </motion.div>

              {/* Social Proof Context */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center lg:justify-start gap-10 pt-8 border-t border-emerald-100/50"
              >
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center overflow-hidden shadow-md">
                      <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-900 flex items-center justify-center text-xs font-bold text-white shadow-md">
                    +5k
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex text-orange-400 gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-sm font-bold text-emerald-950 mt-1">Trusted by 5,000+ happy families</p>
                </div>
              </motion.div>
            </div>

            {/* Immersive Visual Asset */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 relative"
            >
              <div className="relative z-10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(6,78,59,0.3)] border-[8px] md:border-[16px] border-white bg-white">
                <img
                  src="https://thumbs.dreamstime.com/b/white-eggs-carton-24687634.jpg"
                  alt="Fresh Eggs"
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" />
              </div>
              
              {/* Floating UI cards for depth and context */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 lg:-left-20 bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl z-20 border border-emerald-50 max-w-[180px] md:max-w-[240px]"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-700 shadow-inner">
                    <Truck size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-xs font-bold text-emerald-950 uppercase tracking-wider">Express</p>
                    <p className="text-xs md:text-sm font-black text-emerald-900">Same Day Delivery</p>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-600/80 leading-relaxed font-medium">Order before 10 AM and receive your eggs by dinner time.</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0], rotate: [12, 8, 12] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-orange-500 text-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl z-20 font-black text-center rotate-12 border-2 md:border-4 border-white"
              >
                <p className="text-[8px] md:text-xs uppercase tracking-[0.2em] opacity-80 mb-0.5 md:mb-1">Organic</p>
                <p className="text-xl md:text-3xl">100%</p>
                <p className="text-[8px] md:text-[10px] uppercase font-bold mt-0.5 md:mt-1">Certified</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-white border-y border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-emerald-400 uppercase tracking-[0.3em] mb-10">Recognized & Certified By</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-display font-bold text-2xl text-emerald-900"><Leaf className="text-emerald-600" /> ECO-CERT</div>
            <div className="flex items-center gap-2 font-display font-bold text-2xl text-emerald-900"><ShieldCheck className="text-emerald-600" /> SAFE-FOOD</div>
            <div className="flex items-center gap-2 font-display font-bold text-2xl text-emerald-900"><Users className="text-emerald-600" /> LOCAL-ALLIANCE</div>
            <div className="flex items-center gap-2 font-display font-bold text-2xl text-emerald-900"><Award className="text-emerald-600" /> QUALITY-FIRST</div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Bento Grid Style */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10 mb-16 md:mb-24">
            <div className="max-w-2xl">
              <h2 className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4 md:mb-6">The EggMarket Philosophy</h2>
              <h3 className="text-4xl md:text-6xl font-display font-bold text-emerald-950 leading-tight">Better for you, better for the planet.</h3>
            </div>
            <p className="text-emerald-700/60 text-base md:text-lg max-w-md lg:text-right font-medium">We've reimagined the supply chain to prioritize quality, transparency, and local community empowerment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                icon: <ShieldCheck size={32} className="md:w-9 md:h-9" />,
                title: "Unmatched Freshness",
                desc: "Our eggs are collected daily and delivered within 24-48 hours. You're getting eggs that were in the nest yesterday.",
                bg: "bg-emerald-50/50"
              },
              {
                icon: <MapPin size={32} className="md:w-9 md:h-9" />,
                title: "Hyper-Local Sourcing",
                desc: "Support farmers within 50 miles of your home. Reduce food miles and build a resilient local food economy.",
                bg: "bg-orange-50/50"
              },
              {
                icon: <Award size={32} className="md:w-9 md:h-9" />,
                title: "Premium Nutrition",
                desc: "Rich orange yolks and firm whites. Our eggs are packed with more Omega-3s and vitamins than industrial alternatives.",
                bg: "bg-blue-50/50"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group ${feature.bg} p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white shadow-sm hover:shadow-2xl hover:shadow-emerald-100/30 transition-all duration-500 flex flex-col items-start`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center text-emerald-700 mb-6 md:mb-10 shadow-sm group-hover:scale-110 group-hover:bg-emerald-900 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h4 className="text-2xl md:text-3xl font-display font-bold text-emerald-950 mb-4 md:mb-6">{feature.title}</h4>
                <p className="text-emerald-800/60 text-sm md:text-base leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Immersive Dark Layout */}
      <section className="py-20 md:py-32 bg-emerald-950 text-white overflow-hidden relative rounded-[2.5rem] md:rounded-[4rem] mx-4 lg:mx-8">
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-800 rounded-full blur-[100px] md:blur-[150px] -z-0 opacity-30" />
        <div className="absolute bottom-0 left-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-emerald-600 rounded-full blur-[80px] md:blur-[120px] -z-0 opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 space-y-10 md:space-y-12">
              <div>
                <h2 className="text-xs md:text-sm font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4 md:mb-6">Our Process</h2>
                <h3 className="text-4xl md:text-7xl font-display font-bold leading-[0.9] tracking-tighter">From the Nest to Your Table.</h3>
              </div>
              
              <div className="space-y-8 md:space-y-12">
                {[
                  { step: "01", title: "Discover Local Farms", desc: "Browse a curated selection of local farms, each with their own unique story and egg varieties." },
                  { step: "02", title: "Order with Ease", desc: "Select your preferred quantity and delivery frequency. No hidden fees, just honest pricing." },
                  { step: "03", title: "Direct Delivery", desc: "The farmer packs your order with care and delivers it directly to your doorstep." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 md:gap-10 items-start group">
                    <span className="text-4xl md:text-6xl font-display font-black text-emerald-900 group-hover:text-emerald-500 transition-colors duration-500 leading-none">{item.step}</span>
                    <div className="pt-1 md:pt-2">
                      <h4 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 tracking-tight">{item.title}</h4>
                      <p className="text-emerald-300/60 text-base md:text-lg leading-relaxed font-medium max-w-md">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 md:pt-8">
                <Link to="/marketplace" className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 text-base md:text-lg shadow-xl shadow-emerald-500/20">
                  Start Your Journey <ChevronRight size={18} className="md:w-5 md:h-5" />
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative w-full">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4 md:space-y-6 pt-12 md:pt-20">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=500" 
                    className="rounded-[2rem] md:rounded-[3rem] w-full aspect-square object-cover shadow-2xl border-2 md:border-4 border-emerald-900" 
                    alt="Fresh Eggs in Basket" referrerPolicy="no-referrer" 
                  />
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src="https://gofflepoultry.com/wp-content/uploads/2020/05/JumboWhiteTray.png" 
                    className="rounded-[2rem] md:rounded-[3rem] w-full aspect-[3/4] object-cover shadow-2xl border-2 md:border-4 border-emerald-900" 
                    alt="Organic Brown Eggs" referrerPolicy="no-referrer" 
                  />
                </div>
                <div className="space-y-4 md:space-y-6">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src="https://foto.wuestenigel.com/wp-content/uploads/api/white-eggs-in-is-container.jpeg" 
                    className="rounded-[2rem] md:rounded-[3rem] w-full aspect-[3/4] object-cover shadow-2xl border-2 md:border-4 border-emerald-900" 
                    alt="Egg Carton" referrerPolicy="no-referrer" 
                  />
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src="https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?auto=format&fit=crop&q=80&w=500" 
                    className="rounded-[2rem] md:rounded-[3rem] w-full aspect-square object-cover shadow-2xl border-2 md:border-4 border-emerald-900" 
                    alt="Delicious Egg Breakfast" referrerPolicy="no-referrer" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - High End Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 mb-16 md:mb-24">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-[0.4em]">Curated Selection</h2>
              <h3 className="text-4xl md:text-6xl font-display font-bold text-emerald-950">This Week's Best.</h3>
            </div>
            <Link to="/marketplace" className="group flex items-center gap-3 bg-emerald-50 text-emerald-900 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm text-base md:text-lg">
              Explore All Products <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -15 }}
                className="bg-white rounded-[2rem] md:rounded-[3rem] border border-emerald-100 shadow-sm overflow-hidden group hover:shadow-[0_40px_80px_-20px_rgba(6,78,59,0.15)] transition-all duration-700"
              >
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={product.image_url || EGG_PLACEHOLDER}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <div className="bg-white/90 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl text-emerald-600 shadow-lg border border-white">
                      <Star size={16} className="md:w-5 md:h-5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 md:p-8">
                    <Link to="/marketplace" className="w-full bg-white text-emerald-950 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm shadow-2xl active:scale-95 transition-all text-center">
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-[8px] md:text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">{product.category_name}</p>
                    <h4 className="font-display font-bold text-emerald-950 text-xl md:text-2xl group-hover:text-emerald-700 transition-colors">{product.name}</h4>
                  </div>
                  <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-emerald-50">
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Starting at</span>
                      <span className="text-2xl md:text-3xl font-display font-black text-emerald-950">₱{Number(product.price).toFixed(2)}</span>
                    </div>
                    <Link to="/marketplace" className="w-12 h-12 md:w-14 md:h-14 bg-emerald-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all duration-500 shadow-xl shadow-emerald-900/20">
                      <ShoppingBag size={20} className="md:w-6 md:h-6" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-[2rem] md:rounded-[3rem] border border-emerald-100 h-[400px] md:h-[500px] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials - Elegant Editorial Style */}
      <section className="py-20 md:py-32 bg-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-[0.4em] mb-4 md:mb-6">Community Voices</h2>
            <h3 className="text-4xl md:text-6xl font-display font-bold text-emerald-950">Real People. Real Freshness.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { name: "Maria Santos", role: "Local Resident", text: "The difference is night and day. Grocery store eggs feel like plastic compared to these. The yolks are so rich and vibrant." },
              { name: "Juan Dela Cruz", role: "Professional Baker", text: "My cakes have never been fluffier. Quality eggs are the foundation of great baking, and EggMarket provides the best." },
              { name: "Elena Ramos", role: "Health Enthusiast", text: "I love knowing exactly which farm my eggs come from. It's about more than just food; it's about connection and trust." }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-emerald-100 shadow-sm relative flex flex-col items-center text-center"
              >
                <Quote className="text-emerald-100 mb-6 md:mb-10 w-12 h-12 md:w-16 md:h-16" />
                <div className="flex text-orange-400 mb-6 md:mb-8 gap-1">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="md:w-[18px] md:h-[18px]" fill="currentColor" />)}
                </div>
                <p className="text-emerald-900 text-lg md:text-xl font-medium italic mb-8 md:mb-12 leading-relaxed">"{t.text}"</p>
                <div className="mt-auto pt-6 md:pt-10 border-t border-emerald-50 w-full">
                  <h4 className="font-display font-bold text-emerald-950 text-lg md:text-xl">{t.name}</h4>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - High Impact split */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-900 rounded-[3rem] md:rounded-[5rem] overflow-hidden flex flex-col lg:flex-row items-stretch shadow-[0_60px_120px_-30px_rgba(6,78,59,0.4)]">
            <div className="flex-1 p-10 md:p-16 lg:p-24 space-y-10 md:space-y-12">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-xs md:text-sm font-bold text-emerald-400 uppercase tracking-[0.5em]">Join Us</h2>
                <h3 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white leading-[0.9] tracking-tighter">
                  Start Your Fresh Egg <span className="text-emerald-400">Revolution.</span>
                </h3>
                <p className="text-emerald-200/70 text-lg md:text-xl leading-relaxed font-medium max-w-xl">
                  Experience the superior taste and nutrition of farm-fresh eggs while building a stronger, more sustainable local food system.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-2 md:pt-4">
                <Link
                  to="/auth?mode=register"
                  className="bg-white text-emerald-950 px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl font-bold hover:bg-emerald-50 transition-all shadow-2xl shadow-black/20 active:scale-95 text-lg md:text-xl text-center"
                >
                  Create Account
                </Link>
                <Link
                  to="/marketplace"
                  className="bg-emerald-600 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl font-bold hover:bg-emerald-500 transition-all active:scale-95 text-lg md:text-xl text-center border border-emerald-500/50"
                >
                  Browse Marketplace
                </Link>
              </div>
              
              <div className="pt-8 md:pt-12 flex flex-wrap gap-6 md:gap-10 text-emerald-400/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 size={16} className="md:w-5 md:h-5" /> No Subscription
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 size={16} className="md:w-5 md:h-5" /> Support Local
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle2 size={16} className="md:w-5 md:h-5" /> 100% Organic
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3 relative min-h-[300px] md:min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&q=80&w=800" 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Fresh Eggs" referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-emerald-900/20" />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}


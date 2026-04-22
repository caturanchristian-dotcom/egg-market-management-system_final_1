import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { motion } from 'motion/react';
import { Heart, Target, Users, Mail, Phone, MapPin, Egg } from 'lucide-react';

export default function About() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-20 pb-24 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold"
          >
            <Egg size={16} /> Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold text-emerald-900"
          >
            Empowering Farmers, <br /><span className="text-emerald-600">Delighting Customers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-emerald-600 max-w-2xl mx-auto leading-relaxed"
          >
            Egg Market System was born from a simple idea: that everyone deserves access to fresh, high-quality eggs while farmers deserve a fair platform to reach their community.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Target size={28} />
                </div>
                <h2 className="text-3xl font-bold text-emerald-900">Our Mission</h2>
                <p className="text-emerald-600 leading-relaxed text-lg">
                  To bridge the gap between local egg producers and consumers through a transparent, efficient, and community-driven marketplace. We aim to promote sustainable agriculture and ensure that fresh, nutritious eggs are accessible to every household.
                </p>
              </div>
              <div className="space-y-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Heart size={28} />
                </div>
                <h2 className="text-3xl font-bold text-emerald-900">Our Vision</h2>
                <p className="text-emerald-600 leading-relaxed text-lg">
                  To become the leading platform for local agricultural trade, starting with eggs. We envision a world where local food systems are robust, farmers are thriving, and consumers are deeply connected to the source of their food.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-[48px] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=800"
                  alt="Farm Life"
                  className="w-full aspect-square object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-8 -right-8 bg-white p-8 rounded-3xl shadow-xl border border-emerald-50 hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-900">100+</p>
                    <p className="text-sm text-emerald-500 font-medium">Local Farmers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-24 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Get in Touch</h2>
            <p className="text-emerald-300">Have questions? We're here to help.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold">Email Us</h3>
              <p className="text-emerald-300">caturanchristian@gmail.com</p>
              <p className="text-emerald-300 text-sm">We'll respond within 24 hours.</p>
            </div>
            <div className="text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold">Call Us</h3>
              <p className="text-emerald-300">09350347461</p>
              <p className="text-emerald-300 text-sm">Mon-Fri from 8am to 5pm.</p>
            </div>
            <div className="text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold">Visit Us</h3>
              <p className="text-emerald-300">canipaan hinunangan Egg Valley</p>
              <p className="text-emerald-300 text-sm">Come see where the magic happens.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

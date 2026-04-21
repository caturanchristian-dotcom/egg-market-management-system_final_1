import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PublicLayout>
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-bold text-emerald-900"
            >
              Contact <span className="text-emerald-600">Our Team</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-emerald-600"
            >
              Have a question about our products, delivery, or becoming a farmer partner? We'd love to hear from you.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100 space-y-8">
                <h3 className="text-2xl font-bold text-emerald-900">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Email Address</p>
                      <p className="text-emerald-600">caturanchristian@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Phone Number</p>
                      <p className="text-emerald-600">09350347461</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Our Office</p>
                      <p className="text-emerald-600">canipaan hinunangan Egg Valley</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-emerald-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Business Hours</p>
                      <p className="text-emerald-600">Mon - Fri: 8am - 5pm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-900 p-8 rounded-[32px] text-white space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
                <h4 className="text-xl font-bold">Live Chat Support</h4>
                <p className="text-emerald-300 text-sm leading-relaxed">
                  Need immediate help? Our support team is available for live chat during business hours.
                </p>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold transition-all mt-4">
                  Start Chat
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[40px] border border-emerald-100 shadow-xl p-8 lg:p-12">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 space-y-6"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                      <Send size={40} />
                    </div>
                    <h3 className="text-3xl font-bold text-emerald-900">Message Sent!</h3>
                    <p className="text-emerald-600 max-w-md mx-auto">
                      Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-900">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-900">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-emerald-900">Subject</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-emerald-900">Your Message</label>
                      <textarea
                        rows={6}
                        required
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-6 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                    >
                      <Send size={20} /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

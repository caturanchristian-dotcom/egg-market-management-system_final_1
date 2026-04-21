import React, { useState, useEffect } from 'react';
import PublicNavbar from './PublicNavbar';
import { Link } from 'react-router-dom';
import { Egg, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [settings, setSettings] = useState<any>({
    contact_address: 'canipaan hinunangan Egg Valley',
    contact_phone: '09350347461',
    contact_email: 'caturanchristian@gmail.com',
    site_name: 'Egg Market System',
    site_description: 'Connecting local farmers with fresh egg lovers. Our mission is to provide the freshest eggs while supporting local agriculture.'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings(data);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-white font-bold text-2xl">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-700 bg-white shadow-sm">
                  <img 
                    src="https://img.freepik.com/premium-vector/chicken-eggs-farm-logo_59362-509.jpg" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span>{settings.site_name}</span>
              </div>
              <p className="text-emerald-200 text-sm leading-relaxed">
                {settings.site_description}
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all">
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4 text-emerald-200 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Categories</h4>
              <ul className="space-y-4 text-emerald-200 text-sm">
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Chicken Eggs</Link></li>
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Duck Eggs</Link></li>
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Quail Eggs</Link></li>
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Organic Eggs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4 text-emerald-200 text-sm">
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-emerald-500" />
                  <span>{settings.contact_address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-emerald-500" />
                  <span>{settings.contact_phone}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-emerald-500" />
                  <span>{settings.contact_email}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-emerald-400 text-xs font-medium">
            <p>© 2026 {settings.site_name} Connect. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

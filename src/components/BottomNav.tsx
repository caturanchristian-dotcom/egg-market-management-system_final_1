import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  ClipboardList, 
  MessageSquare, 
  User as UserIcon,
  Home as HomeIcon,
  Users,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * BottomNav Component
 * Provides a mobile-first navigation bar positioned at the bottom of the viewport.
 * Optimized for thumb-reachability and core action prioritization based on user role.
 */
export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Mobile-Specific Link Prioritization
   * Curates the top 4 most essential actions for each role to fit within limited horizontal space.
   */
  const links = user?.role === 'admin' ? [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/admin' },
    { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
  ] : 
                user?.role === 'farmer' ? [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/farmer' },
    { id: 'manage-products', label: 'Products', icon: Package, path: '/farmer' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/farmer' },
    { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
  ] : 
                [
    { id: 'marketplace', label: 'Shop', icon: ShoppingBag, path: '/marketplace' },
    { id: 'messages', label: 'Chat', icon: MessageSquare, path: '/messages' },
    { id: 'my-orders', label: 'Orders', icon: ClipboardList, path: '/customer' },
    { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  /**
   * Handles tactile interactions
   * Triggering both navigation and visual state updates.
   */
  const handleLinkClick = (link: any) => {
    if (link.path && !location.pathname.startsWith(link.path)) {
      navigate(link.path);
    }
    setActiveTab(link.id);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 px-6 py-3 z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {links.map((link) => (
        <button
          key={link.id}
          onClick={() => handleLinkClick(link)}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === link.id 
              ? 'text-emerald-600' 
              : 'text-emerald-300 hover:text-emerald-500'
          }`}
        >
          {/* Dynamic stroke width provides extra visual weight to the active icon */}
          <link.icon size={20} strokeWidth={activeTab === link.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
        </button>
      ))}
    </nav>
  );
}

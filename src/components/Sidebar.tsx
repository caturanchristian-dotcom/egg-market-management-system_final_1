import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  UserCheck,
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings,
  X,
  PlusCircle,
  History,
  Tags,
  MessageSquare,
  User as UserIcon,
  Home as HomeIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  onClose?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * Sidebar Component
 * Provides a vertical navigation menu tailored to the current user's role.
 * Includes unique navigation sets for Admins, Farmers, and Customers.
 */
export default function Sidebar({ onClose, activeTab, setActiveTab }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigation Definitions
   * Link sets are partitioned by user role to ensure access control and UX relevance.
   */
  const adminLinks = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Customer Management', icon: Users },
    { id: 'farmers', label: 'Farmer Management', icon: UserCheck },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'products', label: 'Product Monitoring', icon: Package },
    { id: 'orders', label: 'Order Monitoring', icon: ClipboardList },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon, path: '/profile' },
  ];

  const farmerLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manage-products', label: 'My Products', icon: Package },
    { id: 'orders', label: 'Customer Orders', icon: ClipboardList },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'inventory', label: 'Inventory Status', icon: ClipboardList },
    { id: 'sales', label: 'Sales Reports', icon: BarChart3 },
    { id: 'site-settings', label: 'Site Settings', icon: Settings },
    { id: 'profile', label: 'Profile Settings', icon: UserIcon, path: '/profile' },
  ];

  const customerLinks = [
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
    { id: 'my-orders', label: 'My Orders', icon: ClipboardList, path: '/customer' },
    { id: 'history', label: 'Purchase History', icon: History, path: '/customer' },
    { id: 'profile', label: 'Profile Settings', icon: Settings, path: '/profile' },
  ];

  // Dynamic link selection based on session user role
  const links = user?.role === 'admin' ? adminLinks : 
                user?.role === 'farmer' ? farmerLinks : 
                customerLinks;

  /**
   * Universal navigation handler
   * Manages both route transitions and internal dashboard tab state.
   */
  const handleLinkClick = (link: any) => {
    // If the link targets a different base route, navigate first
    if (link.path && !location.pathname.startsWith(link.path)) {
      navigate(link.path);
    }
    setActiveTab(link.id); // Update internal dashboard state
    onClose?.(); // Close mobile overlay if active
  };

  return (
    <div className="h-full flex flex-col bg-emerald-900 text-emerald-100">
      {/* Mobile-only Header */}
      <div className="p-4 flex justify-between items-center lg:hidden">
        <span className="font-bold text-lg">Menu</span>
        <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-0.5">
          {/* Quick exit to landing page */}
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:bg-emerald-800/50 text-emerald-300 mb-2 border border-emerald-800/50"
          >
            <HomeIcon size={18} />
            <span className="font-medium text-sm">Back to Home Page</span>
          </button>
          
          {/* Main navigation list */}
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === link.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'hover:bg-emerald-800/50 text-emerald-300'
              }`}
            >
              <link.icon size={18} />
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Persistent user summary at bottom */}
      <div className="p-3 border-t border-emerald-800/50">
        <div className="bg-emerald-800/30 rounded-lg p-3">
          <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">Logged in as</p>
          <p className="text-xs font-medium text-white truncate">{user?.name}</p>
          <p className="text-[9px] text-emerald-500 truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}

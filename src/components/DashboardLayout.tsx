import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * DashboardLayout Component
 * Serves as the primary structural wrapper for all dashboard-related pages.
 * Handles responsive layout logic:
 * - Persistent Navbar at the top
 * - Sidebar on desktop (left side)
 * - Slide-out menu on mobile
 * - Sticky Bottom Navigation for mobile users
 */
export default function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col pb-20 lg:pb-0">
      {/* Navigation Header */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex-1 flex">
        {/* Desktop Sidebar (Hidden on small screens) */}
        <aside className="hidden lg:block w-72 border-r border-emerald-100 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>

        {/* Mobile Sidebar Overlay & Animation Logic */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Dark backdrop for accessibility and focus */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-40 lg:hidden"
              />
              {/* Side drawer navigation */}
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-emerald-900 z-50 lg:hidden shadow-2xl"
              >
                <Sidebar 
                  onClose={() => setIsSidebarOpen(false)} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Routed Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile-only Persistent Bottom Link Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

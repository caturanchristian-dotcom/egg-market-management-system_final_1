import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MessagingSystem from '../components/MessagingSystem';
import { useLocation } from 'react-router-dom';

/**
 * Messages Page Component
 * Serves as a full-page wrapper for the real-time MessagingSystem.
 * Handles deep-linking into specific conversations via URL query parameters.
 */
export default function Messages() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  // Extract potential initial conversation targets from valid query params
  // e.g., /messages?farmerId=123&farmerName=Local%20Farm
  const userId = params.get('farmerId') || params.get('userId');
  const userName = params.get('farmerName') || params.get('userName');
  const role = params.get('role');

  return (
    <DashboardLayout activeTab="messages" setActiveTab={() => {}}>
      {/* Calculate height to fit between Header and Footer/Tabs */}
      <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
        <MessagingSystem 
          initialUserId={userId}
          initialUserName={userName}
          initialChatRole={role}
        />
      </div>
    </DashboardLayout>
  );
}

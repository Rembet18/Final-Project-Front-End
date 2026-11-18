import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { NotificationPanel } from '../components/NotificationPanel';
import initialNotifications from '../data/notifications.json';
import { getStoredItem, setStoredItem } from '../utils/storage';

const STORAGE_KEY_NOTIFS = 'unisphere_notifications_db';

export const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    return getStoredItem(STORAGE_KEY_NOTIFS, initialNotifications);
  });

  useEffect(() => {
    setStoredItem(STORAGE_KEY_NOTIFS, notifications);
  }, [notifications]);

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative isolate min-h-screen bg-[radial-gradient(ellipse_at_8%_0%,rgba(196,181,253,0.34),transparent_36%),radial-gradient(ellipse_at_96%_72%,rgba(165,180,252,0.3),transparent_42%),linear-gradient(135deg,#faf9ff,#f0f3ff)] flex">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl animate-ambient-float" />
        <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-indigo-300/20 blur-3xl animate-ambient-float-reverse" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.08)_1px,transparent_0)] [background-size:30px_30px]" />
      </div>

      {/* Left Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenNotifications={() => setNotificationPanelOpen(true)}
          unreadCount={unreadCount}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Route Pages */}
        <main className="app-main-content flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};

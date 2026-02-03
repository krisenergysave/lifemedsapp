import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import entitiesApi from '@/api/entitiesApi';
import { BellRing, Bell, LogOut, User, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_LOGO = '🏥';
const DEFAULT_APP_NAME = 'Life-Meds';

export default function DashboardHeader({ 
  user, 
  pendingNotifications = 0, 
  onNotificationsClick 
}) {
  const [projectConfig, setProjectConfig] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch app settings
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const settings = await entitiesApi.list('AppSettings');
        if (settings && settings.length > 0) {
          setProjectConfig(settings[0]);
        }
      } catch (error) {
        console.warn('Failed to fetch app settings:', error);
      }
    };
    fetchAppSettings();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const logoUrl = projectConfig?.logo_url;
  const appName = projectConfig?.app_name || DEFAULT_APP_NAME;

  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = createPageUrl('Home');
    }
  };

  // Get user avatar - initial or uploaded photo
  const getAvatarContent = () => {
    if (user?.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={user.full_name}
          className="w-full h-full object-cover"
        />
      );
    }
    // Show initial avatar
    const initial = user?.full_name?.charAt(0)?.toUpperCase() || 'U';
    return (
      <span className="text-white font-semibold text-sm">{initial}</span>
    );
  };

  const avatarBgColor = user?.avatar_color || '#00BCD4';

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Branding */}
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={appName}
                onError={() => setLogoError(true)}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-8 sm:w-10 h-8 sm:h-10 gradient-cyan rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg font-bold text-white">
                {DEFAULT_LOGO}
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 hidden sm:block">{appName}</h1>
          </Link>

          {/* Right: User Hub */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button
              onClick={onNotificationsClick}
              className="relative p-2 text-slate-600 hover:text-sky-600 transition-colors"
              aria-label="Notifications"
            >
              {pendingNotifications > 0 ? (
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <BellRing className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
              ) : (
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
              {pendingNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {pendingNotifications}
                </motion.span>
              )}
            </button>

            {/* User Greeting & Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {/* Welcome Text (Hidden on Mobile) */}
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-medium text-slate-900">
                    Welcome, {user?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>

                {/* Avatar Circle */}
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm overflow-hidden border-2 border-sky-200"
                  style={{ backgroundColor: avatarBgColor }}
                >
                  {getAvatarContent()}
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-teal-50 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-600">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <nav className="py-2">
                      <Link
                        to={createPageUrl('ProfileSettings')}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-sky-600" />
                        <span>Manage Profile</span>
                      </Link>

                      <Link
                        to={createPageUrl('Subscription')}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Billing & Subscription</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
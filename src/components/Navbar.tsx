import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Menu, X, Sprout, User, LogOut, Settings, Bell,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMenu, setUserMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const notifications = [
    { id: 1, message: 'Weather alert: Heavy rain expected tomorrow', time: '2h ago' },
    { id: 2, message: 'New market price update for Paddy', time: '5h ago' },
    { id: 3, message: 'Your crop suggestion is ready', time: '1d ago' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-800 dark:text-white hidden sm:block">
              CropAdvisory
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors ring-1 ring-slate-200 dark:ring-slate-700"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserMenu(false); }}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors ring-1 ring-slate-200 dark:ring-slate-700 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                        {notifications.length} new
                      </span>
                    </div>
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 shrink-0" />
                          <div>
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="mt-3 w-full text-xs text-center text-primary-600 dark:text-primary-400 hover:underline font-medium py-1"
                    >
                      Mark all as read
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setUserMenu(!userMenu); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ring-1 ring-slate-200 dark:ring-slate-700"
            >
              {profile?.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                {profile?.full_name?.split(' ')[0] || 'Farmer'}
              </span>
            </button>
            <AnimatePresence>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 mb-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {profile?.full_name || 'Farmer'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {profile?.role === 'admin' ? 'Administrator' : 'Farmer'}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <Settings className="w-4 h-4" /> Admin Tools
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

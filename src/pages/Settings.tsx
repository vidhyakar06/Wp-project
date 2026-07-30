import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Globe, Lock, Bell, Mail, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { session } = useAuth();
  const { showToast } = useToast();
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordForm.new.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
      if (error) throw error;
      showToast('Password updated successfully', 'success');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" icon={<SettingsIcon className="w-6 h-6" />} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Display</h3>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Light/Dark Mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Language</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${language === 'en' ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500' : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent'}`}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">English</span>
                {language === 'en' && <span className="w-5 h-5 rounded-full bg-primary-600" />}
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${language === 'ta' ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500' : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent'}`}
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">தமிழ் (Tamil)</span>
                {language === 'ta' && <span className="w-5 h-5 rounded-full bg-primary-600" />}
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Notifications</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">App Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Weather alerts and crop suggestions</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${notifications ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Alerts
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Market price updates</p>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${emailAlerts ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Change Password</h3>
            </div>
            <div className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
              <Button onClick={handleChangePassword} disabled={savingPassword} icon={<Save className="w-4 h-4" />}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Account Info */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Account Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
            <p className="text-xs text-slate-500">Email</p>
            <p className="font-medium text-slate-800 dark:text-white">{session?.user?.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
            <p className="text-xs text-slate-500">Account Number</p>
            <p className="font-medium text-slate-800 dark:text-white truncate">{session?.user?.id}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

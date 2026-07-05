import React, { useState } from 'react';
import { LogOut, Monitor, Moon, Sun, Shield, Bell, Key, Download, Activity, FileText, User } from 'lucide-react';
import { useTheme } from '../App';
import { useNavigate } from 'react-router-dom';

export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("praojas_auth");
      window.location.href = '/';
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] p-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings & Preferences</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account preferences, security, and application settings.</p>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors">
          {/* Profile Section */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                DR
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Dr. Sarah Jenkins</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chief Intensivist, Medical ICU</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-md flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin Access
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">ID: PRJ-98234</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 font-semibold rounded-lg transition-colors border border-red-200 dark:border-red-500/20 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
            {/* Preferences Section */}
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-indigo-500" />
                  Application Preferences
                </h3>
                
                <div className="space-y-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme Preference</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your preferred color scheme.</div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                      {(
                        [
                          { id: 'light', icon: Sun, label: 'Light' },
                          { id: 'dark', icon: Moon, label: 'Dark' },
                          { id: 'system', icon: Monitor, label: 'System' }
                        ] as const
                      ).map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          onClick={() => setTheme(id as "light" | "dark" | "system")}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            theme === id 
                              ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' 
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-700" />

                  {/* Notification Toggles */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                         Real-time Critical Alerts
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive sound notifications when a patient hits critical status.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">AI Weekly Digest</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive an email summarizing AI agent actions and patient outcomes.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Data Section */}
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-500" />
                  Security & Access
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Currently configured via SMS.</div>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">Manage</button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">Change Password</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Last changed 45 days ago.</div>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">Update</button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  Data & Privacy
                </h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">Export Audit Logs</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Download your action history as CSV.</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">HIPAA Compliance Report</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">View recent access logs and privacy notices.</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          PraOjas AI Clinical Engine Version 3.1.4 <br />
          Compliance: HIPAA, GDPR Ready
        </div>
      </div>
    </div>
  );
}

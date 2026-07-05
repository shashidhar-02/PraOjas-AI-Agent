import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, FileText, Settings, HeartPulse } from 'lucide-react';
import { useTheme } from '../App';

export default function Sidebar() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-screen bg-slate-50 dark:bg-[#0B1120] border-r border-slate-200 dark:border-[#1e293b] transition-colors">
      {/* Logo Area */}
      <div className="px-6 py-8 flex items-center gap-3">
        {/* Premium Medical AI Logo */}
        <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="url(#bg)" />
            <path d="M50 82 L26 58 C12 44 16 24 30 18 C39 14 47 20 50 28 C53 20 61 14 70 18 C84 24 88 44 74 58 Z" fill="url(#heartGrad)" />
            <text x="50" y="52" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="900" fontSize="26" fill="#ffffff" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">PO</text>
          </svg>
        </div>
        <span className="font-semibold text-lg text-slate-900 dark:text-white tracking-wide">PraOjas AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-slate-800/50 text-indigo-600 dark:text-[#06b6d4]' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30'
              }`}
            >
              {/* Cyan active indicator on the left edge */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#06b6d4] rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-[#06b6d4]' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

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
              <linearGradient id="gradP" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="gradO" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="-2" dy="4" stdDeviation="3" floodOpacity="0.35" floodColor="#020617"/>
              </filter>
            </defs>
            
            {/* P Stem */}
            <rect x="25" y="15" width="20" height="70" rx="10" fill="url(#gradP)" />

            {/* P Loop (overlapping ribbon) */}
            <path d="M 45 15 
                     A 30 30 0 1 1 45 75 
                     L 45 57 
                     A 12 12 0 1 0 45 33 
                     Z" fill="url(#gradO)" filter="url(#shadow)" />
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

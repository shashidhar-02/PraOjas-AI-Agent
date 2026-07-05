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
          <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Hexagon Base */}
            <path d="M20 3 L36 12 L36 28 L20 37 L4 28 L4 12 Z" fill="url(#hex_grad)" fillOpacity="0.15" stroke="url(#hex_grad)" strokeWidth="1.5" />
            
            {/* Central Pulse / AI Cross */}
            <path d="M11 20 L15 20 L19 12 L24 28 L28 20 L32 20" stroke="url(#pulse_grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="20" r="1.5" fill="#06b6d4" />
            <circle cx="32" cy="20" r="1.5" fill="#6366f1" />

            <defs>
              <linearGradient id="hex_grad" x1="4" y1="3" x2="36" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4"/>
                <stop offset="1" stopColor="#6366f1"/>
              </linearGradient>
              <linearGradient id="pulse_grad" x1="12" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4"/>
                <stop offset="1" stopColor="#818cf8"/>
              </linearGradient>
            </defs>
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

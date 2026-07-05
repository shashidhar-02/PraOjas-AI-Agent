import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, HeartPulse } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface AlertData {
  id: string;
  patientName: string;
  patientId: string;
  message: string;
  timestamp: Date;
}

export default function GlobalAlerts() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  useEffect(() => {
    // Simulate real-time alerts
    const timer = setInterval(() => {
      // Randomly trigger an alert 15% of the time every 10 seconds
      if (Math.random() > 0.85) {
        const newAlert: AlertData = {
          id: Math.random().toString(36).substring(7),
          patientName: ['John Doe', 'Sarah Chen', 'Emma Wilson', 'Michael Torres'][Math.floor(Math.random() * 4)],
          patientId: `P-10${Math.floor(Math.random() * 500)}`,
          message: ['Lactate level critically high (4.2 mmol/L)', 'Sepsis Risk Score exceeded 80%', 'Heart rate dropping below 40 bpm'][Math.floor(Math.random() * 3)],
          timestamp: new Date(),
        };
        
        // Play sound
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {}

        setAlerts(prev => [...prev, newAlert]);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
        }, 8000);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-[#1E293B] border border-red-200 dark:border-red-500/30 shadow-lg rounded-xl overflow-hidden pointer-events-auto flex"
          >
            <div className="w-1.5 bg-red-500 flex-shrink-0" />
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 animate-pulse" />
                  CRITICAL ALERT
                </div>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {alert.patientName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {alert.patientId}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {alert.message}
              </p>
              
              <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                {alert.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Bell, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertData {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  patientId: string;
  patientName: string;
  time: string;
  description: string;
  action: string;
}

export default function AlertsView() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/alerts/stream');
    
    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
          setAlerts(prev => [data.payload, ...prev].slice(0, 50)); // keep last 50
        } else if (data.type === 'ping') {
          // just a keepalive ping
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      // Simple reconnect logic can go here if needed, but EventSource auto-reconnects
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] p-8 transition-colors">
      {/* Header section */}
      <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-yellow-500 dark:text-yellow-400">🔔</span> Live Monitoring Alerts
        </h1>
        <div className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 flex items-center gap-2">
          <span>MonitoringAgent — Checking continuously</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1">
            SSE Connected {connected ? <span className="text-emerald-500">✅</span> : <span className="text-red-500">❌ (Reconnecting...)</span>}
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4 max-w-5xl">
        <AnimatePresence>
          {alerts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center">
              <Activity className="w-12 h-12 mb-3 opacity-20" />
              <p>No alerts received yet. The monitoring agent is watching.</p>
            </motion.div>
          )}
          {alerts.map(alert => {
            const isCritical = alert.level === 'CRITICAL';
            const indicatorColor = isCritical ? 'bg-red-500' : 'bg-orange-500';
            const textColor = isCritical ? 'text-red-600 dark:text-red-500' : 'text-orange-600 dark:text-orange-500';
            
            return (
              <motion.div 
                key={alert.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative bg-white dark:bg-[#1E293B] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 p-4 pl-6 shadow-sm dark:shadow-lg transition-colors"
              >
                {/* Left Color Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${indicatorColor}`} />
                
                <div className="flex items-center gap-2 mb-2">
                  {/* Dot indicator */}
                  <div className={`w-3 h-3 rounded-full ${indicatorColor}`} style={{ boxShadow: `0 0 10px ${isCritical ? '#ef4444' : '#f97316'}` }} />
                  
                  <span className={`font-bold text-sm ${textColor}`}>
                    {alert.level}
                  </span>
                  <span className="text-slate-300 dark:text-slate-400 text-sm">—</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Patient: {alert.patientName} ({alert.patientId})</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm ml-1">| {alert.time}</span>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-1">
                  {alert.description}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Action:</strong> {alert.action}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}



import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Users, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const sepsisData = [
  { time: '00:00', risk: 12 },
  { time: '04:00', risk: 15 },
  { time: '08:00', risk: 25 },
  { time: '12:00', risk: 38 },
  { time: '16:00', risk: 32 },
  { time: '20:00', risk: 28 },
  { time: '24:00', risk: 20 },
];

const patientStatus = [
  { name: 'Stable', count: 24, fill: '#10b981' },
  { name: 'Observation', count: 12, fill: '#3b82f6' },
  { name: 'Critical', count: 4, fill: '#ef4444' },
];

export default function DashboardView() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] p-8 text-slate-900 dark:text-white transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ICU Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">High-level analytics and AI model performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold">40</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total ICU Beds Active</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold">4</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Critical Patients</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold">142</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Interventions Today</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-bold">94.2%</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">AI Model Accuracy</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Average Sepsis Risk Trend (24h)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sepsisData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shadow-sm p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Current Patient Status</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientStatus} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

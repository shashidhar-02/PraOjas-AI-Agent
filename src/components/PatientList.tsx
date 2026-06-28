import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { Activity, AlertTriangle, CheckCircle2, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
  onNewPatient: () => void;
}

export default function PatientList({ patients, selectedPatientId, onSelectPatient, onNewPatient }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'risk'>('default');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Stable' | 'Warning' | 'Critical'>('All');

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        p => 
          p.name.toLowerCase().includes(lowerQuery) || 
          p.id.toLowerCase().includes(lowerQuery)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (sortBy === 'risk') {
      const riskScores: Record<string, number> = {
        'Critical': 3,
        'Warning': 2,
        'Stable': 1
      };
      result.sort((a, b) => {
        const scoreA = riskScores[a.status] || 0;
        const scoreB = riskScores[b.status] || 0;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [patients, searchQuery, sortBy, statusFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col h-full">
      <div className="flex flex-col gap-3 mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Active ICU Roster
          </h3>
          <button
            onClick={onNewPatient}
            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
            title="Manual Patient Entry"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="default">Default Sort</option>
            <option value="risk">Risk Level</option>
          </select>
        </div>

        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Critical', 'Warning', 'Stable'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-colors ${
                statusFilter === status 
                  ? 'bg-slate-800 text-slate-200' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence>
        {filteredAndSortedPatients.map(patient => {
          const isSelected = patient.id === selectedPatientId;
          
          let StatusIcon = CheckCircle2;
          let statusColor = 'text-emerald-500';
          let statusBg = 'bg-emerald-500/10 border-emerald-500/20';
          
          if (patient.status === 'Critical') {
            StatusIcon = AlertTriangle;
            statusColor = 'text-rose-500';
            statusBg = 'bg-rose-500/10 border-rose-500/20';
          } else if (patient.status === 'Warning') {
            StatusIcon = Activity;
            statusColor = 'text-amber-500';
            statusBg = 'bg-amber-500/10 border-amber-500/20';
          }

          return (
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between card-3d-hover ${
                isSelected 
                ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/10' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-100 font-sans">{patient.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-900/50">{patient.id}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-sans">
                    {patient.age}y {patient.gender} • {patient.department}
                  </div>
                </div>
                
                <motion.div 
                  key={`${patient.id}-${patient.status}`}
                  initial={patient.status !== 'Stable' ? { scale: 1.5, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`p-2 rounded-xl border relative flex items-center justify-center overflow-visible ${statusBg}`}
                >
                  {patient.status === 'Critical' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-rose-500/20 blur-sm"
                      animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  {patient.status === 'Warning' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-amber-500/20 blur-sm"
                      animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <StatusIcon className={`w-4 h-4 relative z-10 ${statusColor}`} />
                </motion.div>
              </div>
            </motion.button>
          )
        })}
        </AnimatePresence>
      </div>
    </div>
  );
}

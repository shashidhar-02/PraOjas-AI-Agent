import React from 'react';
import { Patient } from '../types';
import { Activity, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
  onNewPatient: () => void;
}

export default function PatientList({ patients, selectedPatientId, onSelectPatient, onNewPatient }: PatientListProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
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
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {patients.map(patient => {
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
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                isSelected 
                ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/10' 
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-100 font-sans">{patient.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{patient.id}</span>
                </div>
                <div className="text-xs text-slate-400 font-sans">
                  {patient.age}y {patient.gender} • {patient.department}
                </div>
              </div>
              <div className={`p-2 rounded-xl border ${statusBg}`}>
                <StatusIcon className={`w-4 h-4 ${statusColor}`} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}

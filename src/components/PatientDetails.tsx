import React from 'react';
import { Patient } from '../types';
import { Activity, Droplet, Heart, Wind, Stethoscope, Thermometer } from 'lucide-react';

interface PatientDetailsProps {
  patient: Patient | null;
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  if (!patient) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex items-center justify-center text-slate-500 text-sm">
        Select a patient to view clinical details.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight mb-1">
            {patient.name}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            ID: <span className="font-mono text-slate-300">{patient.id}</span> • {patient.age}y {patient.gender} • Admitted: {new Date(patient.admissionDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
          </p>
        </div>
        <div className="text-right">
           <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
             {patient.department}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Vitals */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Latest Vitals
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-rose-400" /> Heart Rate
              </span>
              <span className="text-lg font-bold font-mono text-slate-200">{patient.vitals.hr} <span className="text-[10px] text-slate-500">bpm</span></span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-blue-400" /> Blood Pressure
              </span>
              <span className="text-lg font-bold font-mono text-slate-200">{patient.vitals.bp} <span className="text-[10px] text-slate-500">mmHg</span></span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                <Wind className="w-3 h-3 text-emerald-400" /> SpO2
              </span>
              <span className="text-lg font-bold font-mono text-slate-200">{patient.vitals.spo2} <span className="text-[10px] text-slate-500">%</span></span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 mb-1">
                <Thermometer className="w-3 h-3 text-amber-400" /> Temp
              </span>
              <span className="text-lg font-bold font-mono text-slate-200">{patient.vitals.temp} <span className="text-[10px] text-slate-500">°C</span></span>
            </div>
          </div>
        </div>

        {/* Labs & History */}
        <div className="space-y-6">
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5" />
              Recent Labs
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3 font-mono text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">Lactate</span>
                 <span className={`font-bold ${patient.labs.lactate > 2 ? 'text-rose-400' : 'text-slate-200'}`}>{patient.labs.lactate} mmol/L</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">WBC Count</span>
                 <span className={`font-bold ${patient.labs.wbc > 12 ? 'text-rose-400' : 'text-slate-200'}`}>{patient.labs.wbc} 10^9/L</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-400">Creatinine</span>
                 <span className="font-bold text-slate-200">{patient.labs.creatinine} mg/dL</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical Notes
            </h4>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic">
              "{patient.clinicalNotes}"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

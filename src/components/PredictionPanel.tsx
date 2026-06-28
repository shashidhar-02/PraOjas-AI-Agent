import React from 'react';
import { PredictionResult } from '../types';
import { BrainCircuit, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface PredictionPanelProps {
  prediction: PredictionResult | null;
  loading: boolean;
  onRunPrediction: () => void;
  patientSelected: boolean;
}

export default function PredictionPanel({ prediction, loading, onRunPrediction, patientSelected }: PredictionPanelProps) {
  
  if (!patientSelected) {
     return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center">
        <BrainCircuit className="w-10 h-10 text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">Select a patient to run the self-supervised multimodal transformer model.</p>
      </div>
    );
  }

  const renderGauge = (value: number, label: string, color: string) => {
    const data = [{ name: label, value: value * 100, fill: color }];
    return (
      <div className="flex flex-col items-center relative h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="65%" 
            innerRadius="70%" outerRadius="100%" 
            barSize={12} 
            data={data} 
            startAngle={180} endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: '#1e293b' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="block text-2xl font-bold font-mono text-slate-100">{(value * 100).toFixed(0)}%</span>
        </div>
        <span className="text-xs font-bold text-slate-400 mt-2">{label}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          AI Prediction Agent
        </h3>
        <button
          onClick={onRunPrediction}
          disabled={loading}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
             <span className="flex items-center gap-2">
               <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
               Processing...
             </span>
          ) : (
            'Run Inference'
          )}
        </button>
      </div>

      {!prediction && !loading && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
           Click 'Run Inference' to generate sepsis and mortality risk scores.
        </div>
      )}

      {prediction && (
        <div className="flex-1 flex flex-col justify-center space-y-6 animate-in fade-in zoom-in duration-500">
           <div className="grid grid-cols-2 gap-4">
              {renderGauge(
                prediction.sepsisProbability, 
                'Sepsis Risk', 
                prediction.sepsisProbability > 0.5 ? '#f43f5e' : '#10b981'
              )}
              {renderGauge(
                prediction.mortalityProbability, 
                'Mortality Risk', 
                prediction.mortalityProbability > 0.3 ? '#f59e0b' : '#3b82f6'
              )}
           </div>
           
           <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Inference Engine</span>
                  <div className="text-xs font-bold text-slate-300">
                    {prediction.modelMetadata?.name || 'SSL Transformer'}
                  </div>
                </div>
                <div className="text-right">
                   <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Confidence</span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 justify-end">
                    <ShieldCheck className="w-4 h-4" />
                    {(prediction.confidenceScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                 <div>Sepsis AUROC: <span className="text-slate-200">{prediction.modelMetadata?.sepsisAuroc}</span></div>
                 <div>Mortality AUROC: <span className="text-slate-200">{prediction.modelMetadata?.mortalityAuroc}</span></div>
                 <div>Sepsis ECE: <span className="text-slate-200">{prediction.modelMetadata?.sepsisEce}</span></div>
                 <div>Mortality ECE: <span className="text-slate-200">{prediction.modelMetadata?.mortalityEce}</span></div>
              </div>
           </div>

           {prediction.sepsisProbability > 0.5 && (
             <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex flex-col gap-2">
                <div className="flex items-start gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>CRITICAL: High Sepsis Risk Detected</span>
                </div>
                <div className="pl-6 space-y-1.5 text-[11px] text-rose-300/80">
                  <p className="font-semibold text-rose-300">Suggested Preemptive Interventions:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Initiate 1-hour sepsis bundle protocol.</li>
                    <li>Obtain blood cultures before antibiotic administration.</li>
                    <li>Administer broad-spectrum antibiotics.</li>
                    <li>Prepare for rapid fluid resuscitation (30mL/kg crystalloid) if hypotensive.</li>
                  </ul>
                </div>
             </div>
           )}

           {prediction.sepsisProbability > 0.3 && prediction.sepsisProbability <= 0.5 && (
             <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex flex-col gap-2">
                <div className="flex items-start gap-2 text-amber-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>WARNING: Elevated Sepsis Risk</span>
                </div>
                <div className="pl-6 space-y-1.5 text-[11px] text-amber-300/80">
                  <p className="font-semibold text-amber-300">Suggested Nursing Actions:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Increase frequency of vitals monitoring (q1-2 hrs).</li>
                    <li>Monitor urine output and fluid balance closely.</li>
                    <li>Assess for new signs of infection or mental status changes.</li>
                  </ul>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

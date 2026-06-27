import React, { useState, useEffect } from 'react';
import { Patient, PredictionResult, ExplainabilityResult } from './types';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import PredictionPanel from './components/PredictionPanel';
import ExplainabilityPanel from './components/ExplainabilityPanel';
import PatientEntryForm from './components/PatientEntryForm';
import AgentWorkflowDialog from './components/AgentWorkflowDialog';
import { Activity, ShieldCheck, HeartPulse, User, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [explainability, setExplainability] = useState<ExplainabilityResult | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [showWorkflow, setShowWorkflow] = useState(false);
  const [isNewPatientMode, setIsNewPatientMode] = useState(false);
  const [loadingNewPatient, setLoadingNewPatient] = useState(false);

  useEffect(() => {
    // Fetch initial patient list
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data.patients);
        setLoadingPatients(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingPatients(false);
      });
  }, []);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setIsNewPatientMode(false);
    setPrediction(null);
    setExplainability(null);
  };

  const handleNewPatientStart = () => {
    setIsNewPatientMode(true);
    setSelectedPatientId(null);
    setPrediction(null);
    setExplainability(null);
  };

  const handleNewPatientSubmit = async (data: any) => {
    setLoadingNewPatient(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const newPatient = await res.json();
      setPatients(prev => [...prev, newPatient]);
      setSelectedPatientId(newPatient.id);
      setIsNewPatientMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNewPatient(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  const handleRunPrediction = async () => {
    if (!selectedPatientId) return;
    setLoadingPrediction(true);
    setExplainability(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: selectedPatientId })
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleGenerateExplanation = async () => {
    if (!selectedPatient || !prediction) return;
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient: selectedPatient, prediction })
      });
      const data = await res.json();
      setExplainability(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-sans tracking-tight">
                PraOjas AI
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Clinical Decision Support System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowWorkflow(true)}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 text-xs font-sans font-bold transition-colors"
             >
               <Network className="w-4 h-4" />
               View Agent Architecture
             </button>
             <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-sans font-semibold">
               <ShieldCheck className="w-4 h-4 text-emerald-400" />
               Secure Enclave
             </span>
             <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-sans font-semibold">
               <User className="w-4 h-4 text-indigo-400" />
               Dr. Smith
             </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Patient List */}
        <div className="lg:col-span-3">
          {loadingPatients ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 h-full flex items-center justify-center text-slate-500">
               Loading ICU Roster...
            </div>
          ) : (
            <PatientList 
              patients={patients} 
              selectedPatientId={selectedPatientId} 
              onSelectPatient={handleSelectPatient} 
              onNewPatient={handleNewPatientStart}
            />
          )}
        </div>

        {/* Center/Right Columns: Clinical Data & AI Agents */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {isNewPatientMode ? (
            <PatientEntryForm 
              onSubmit={handleNewPatientSubmit} 
              onCancel={() => setIsNewPatientMode(false)}
              loading={loadingNewPatient}
            />
          ) : (
            <>
              {/* Top Row: Patient Details */}
              <div className="h-64 shrink-0">
                 <PatientDetails patient={selectedPatient} />
              </div>

              {/* Bottom Row: AI Agents (Split 50/50) */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[350px]">
                 <PredictionPanel 
                    prediction={prediction} 
                    loading={loadingPrediction} 
                    onRunPrediction={handleRunPrediction} 
                    patientSelected={!!selectedPatient}
                 />
                 
                 <ExplainabilityPanel 
                    explainability={explainability} 
                    loading={loadingExplanation} 
                    onGenerateExplanation={handleGenerateExplanation} 
                    predictionAvailable={!!prediction}
                 />
              </div>
            </>
          )}
        </div>

      </main>

      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-5 text-center text-xs text-slate-500 font-sans">
        <p className="max-w-7xl mx-auto">
          PraOjas AI • Developed for Kaggle AI Agents Capstone • For demonstration purposes only. Not for actual clinical diagnosis.
        </p>
      </footer>
      
      <AnimatePresence>
        {showWorkflow && (
          <AgentWorkflowDialog onClose={() => setShowWorkflow(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

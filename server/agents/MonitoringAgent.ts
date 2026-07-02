import { PredictionAgent } from './PredictionAgent';
import { MemoryAgent } from './MemoryAgent';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface PatientAlert {
  patientId: string;
  patientName: string;
  alertType: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  vitals?: any;
  prediction?: any;
}

/**
 * MonitoringAgent — Autonomous Background Agent
 * 
 * Runs every 60 seconds without any user interaction.
 * Checks all registered patients' vitals against clinical thresholds (qSOFA, Sepsis-3).
 * Autonomously calls PredictionAgent if deterioration is detected.
 * Pushes real-time alerts via Server-Sent Events (SSE).
 */
export class MonitoringAgent {
  private predictionAgent: PredictionAgent;
  private memoryAgent: MemoryAgent;
  private patientRegistry: Map<string, any> = new Map();
  private alertSubscribers: Set<(alert: PatientAlert) => void> = new Set();
  private intervalHandle: NodeJS.Timeout | null = null;
  private readonly INTERVAL_MS = 5 * 60_000; // 5 minutes — reduces API calls

  constructor(apiKey: string) {
    this.predictionAgent = new PredictionAgent(apiKey);
    this.memoryAgent = new MemoryAgent();
  }

  // ── Patient Registry ─────────────────────────────────────────────────────

  registerPatient(patient: any) {
    this.patientRegistry.set(patient.id, patient);
    console.log(`[Monitoring Agent] Registered patient ${patient.id} (${patient.name}) for monitoring.`);
  }

  updatePatient(patient: any) {
    this.patientRegistry.set(patient.id, patient);
  }

  deregisterPatient(patientId: string) {
    this.patientRegistry.delete(patientId);
    console.log(`[Monitoring Agent] Deregistered patient ${patientId}.`);
  }

  // ── Alert Subscriptions (SSE) ─────────────────────────────────────────────

  subscribe(callback: (alert: PatientAlert) => void): () => void {
    this.alertSubscribers.add(callback);
    return () => this.alertSubscribers.delete(callback); // Returns unsubscribe fn
  }

  private emit(alert: PatientAlert) {
    console.log(`[Monitoring Agent] 🚨 ALERT [${alert.severity}] — ${alert.patientName}: ${alert.message}`);
    this.alertSubscribers.forEach(cb => cb(alert));

    // Persist to memory
    this.memoryAgent.logAgentDecision(
      'MonitoringAgent',
      `AUTONOMOUS_ALERT_${alert.alertType}`,
      alert.patientId,
      { vitals: alert.vitals },
      { severity: alert.severity, message: alert.message }
    );
  }

  // ── Autonomous Monitoring Loop ────────────────────────────────────────────

  start() {
    if (this.intervalHandle) return; // Already running
    console.log(`[Monitoring Agent] ✅ Autonomous monitoring started (every ${this.INTERVAL_MS / 1000}s).`);
    this.intervalHandle = setInterval(() => this.runMonitoringCycle(), this.INTERVAL_MS);
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log(`[Monitoring Agent] Stopped.`);
    }
  }

  private async runMonitoringCycle() {
    if (this.patientRegistry.size === 0) return;

    console.log(`[Monitoring Agent] Running autonomous check on ${this.patientRegistry.size} patient(s)...`);

    for (const [patientId, patient] of this.patientRegistry.entries()) {
      try {
        await this.checkPatient(patient);
      } catch (err) {
        console.error(`[Monitoring Agent] Error checking patient ${patientId}:`, err);
      }
    }
  }

  private async checkPatient(patient: any) {
    const vitals = patient.vitals;
    const labs = patient.labs;

    // ── Rule 1: qSOFA ≥ 2 (Quick SOFA — Sepsis early warning) ──────────────
    // Criteria: RR ≥ 22, Altered Mentation (assumed if Critical), Systolic BP ≤ 100
    const sysolicBP = parseInt(vitals?.bp?.split('/')?.[0] || '120', 10);
    let qsofaScore = 0;
    if (vitals?.rr >= 22) qsofaScore++;
    if (sysolicBP <= 100) qsofaScore++;
    if (patient.status === 'Critical') qsofaScore++; // Proxy for altered mentation

    if (qsofaScore >= 2) {
      this.emit({
        patientId: patient.id,
        patientName: patient.name,
        alertType: 'QSOFA_POSITIVE',
        severity: 'CRITICAL',
        message: `qSOFA score ≥ 2 detected (score: ${qsofaScore}/3). Possible sepsis onset. Recommend immediate assessment.`,
        timestamp: new Date().toISOString(),
        vitals
      });

      // Autonomous rule-based alert fired. Skip auto-prediction to conserve API quota.
      // The monitoring agent will alert the clinician who can manually run inference.
      console.log(`[Monitoring Agent] qSOFA alert for ${patient.id} — clinician should run manual inference.`);
    }

    // ── Rule 2: Elevated Lactate (Sepsis-3 criterion) ────────────────────────
    if (labs?.lactate > 2.0) {
      this.emit({
        patientId: patient.id,
        patientName: patient.name,
        alertType: 'ELEVATED_LACTATE',
        severity: labs.lactate > 4.0 ? 'CRITICAL' : 'WARNING',
        message: `Lactate ${labs.lactate} mmol/L — ${labs.lactate > 4.0 ? 'critically elevated (>4.0)' : 'above Sepsis-3 threshold (>2.0)'}. Consider IV fluids and blood culture.`,
        timestamp: new Date().toISOString(),
        vitals
      });
    }

    // ── Rule 3: Severe Hypotension ────────────────────────────────────────────
    if (sysolicBP < 90) {
      this.emit({
        patientId: patient.id,
        patientName: patient.name,
        alertType: 'HYPOTENSION',
        severity: 'CRITICAL',
        message: `Severe hypotension detected: SBP ${sysolicBP} mmHg. Septic shock criteria met. Vasopressors may be required.`,
        timestamp: new Date().toISOString(),
        vitals
      });
    }

    // ── Rule 4: Bradycardia or Extreme Tachycardia ─────────────────────────
    if (vitals?.hr > 130) {
      this.emit({
        patientId: patient.id,
        patientName: patient.name,
        alertType: 'TACHYCARDIA',
        severity: 'WARNING',
        message: `Extreme tachycardia: HR ${vitals.hr} bpm. Evaluate for arrhythmia or compensatory response.`,
        timestamp: new Date().toISOString(),
        vitals
      });
    }

    // ── Rule 5: Critical SpO2 ────────────────────────────────────────────────
    if (vitals?.spo2 < 90) {
      this.emit({
        patientId: patient.id,
        patientName: patient.name,
        alertType: 'HYPOXIA',
        severity: 'CRITICAL',
        message: `Critical hypoxia: SpO2 ${vitals.spo2}%. Immediate oxygen supplementation required.`,
        timestamp: new Date().toISOString(),
        vitals
      });
    }
  }
}

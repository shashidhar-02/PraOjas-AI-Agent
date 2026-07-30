import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import express from 'express';
import request from 'supertest';
import { createRouter } from '../../server/routes';

type CallRecorder<T> = {
  calls: T[];
  call: (value: T) => void;
};

function createRecorder<T>(): CallRecorder<T> {
  const calls: T[] = [];
  return {
    calls,
    call: (value: T) => {
      calls.push(value);
    },
  };
}

function buildTestApp() {
  const predictionCalls = createRecorder<Record<string, unknown>>();
  const explanationCalls = createRecorder<{ patient: unknown; prediction: unknown }>();
  const vitalsCalls = createRecorder<Record<string, unknown>>();
  const registrationCalls = createRecorder<Record<string, unknown>>();

  const coordinatorAgent = {
    handlePredictionRequest: async (patient: unknown) => {
      predictionCalls.call(patient as Record<string, unknown>);
      return {
        sepsisProbability: 0.84,
        mortalityProbability: 0.31,
        confidenceScore: 0.93,
        timestamp: new Date().toISOString(),
        modelMetadata: { name: 'api-smoke' },
      };
    },
    handleExplanationRequest: async (patient: unknown, prediction: unknown) => {
      explanationCalls.call({ patient, prediction });
      return {
        explanation: 'Elevated lactate is the primary driver.',
        featureImportance: [{ feature: 'Lactate', importance: 0.85 }],
        nlpEntities: { diagnoses: ['Sepsis'], medications: [], symptoms: ['Fever'] },
        report: { summary: 'High sepsis risk.', recommendedActions: ['Start antibiotics.'] },
      };
    },
    handleSmartVitalsRequest: async (patient: unknown) => {
      vitalsCalls.call(patient as Record<string, unknown>);
      return {
        hr: 110,
        bp: '90/55',
        temp: 39.2,
        rr: 23,
        spo2: 92,
      };
    },
    handleDocumentUpload: async () => ({
      name: 'Jane Smith',
      age: 55,
      gender: 'Female',
      vitals: { hr: 98, bp: '118/78', temp: 37.8, rr: 18, spo2: 96 },
      labs: { wbc: 11.2, lactate: 1.8 },
      clinicalNotes: 'Admitted for pneumonia.',
      _validationWarnings: [],
    }),
    getMemoryAgent: () => ({
      getPredictionHistory: async () => [{ patientId: 'P-001', sepsisProbability: 0.6 }],
    }),
  };

  const monitoringAgent = {
    registerPatient: (patient: Record<string, unknown>) => registrationCalls.call(patient),
    updatePatient: () => undefined,
    deregisterPatient: () => undefined,
  };

  const app = express();
  app.use(express.json());
  app.use('/api', createRouter(coordinatorAgent as any, monitoringAgent as any, new Set()));

  return {
    app,
    calls: {
      predictionCalls,
      explanationCalls,
      vitalsCalls,
      registrationCalls,
    },
  };
}

export async function runApiSmoke() {
  const { app, calls } = buildTestApp();
  const patient = {
    id: 'P-TEST-001',
    name: 'Test Patient',
    age: 68,
    gender: 'Male',
    vitals: { hr: 105, bp: '95/60', temp: 38.9, rr: 22, spo2: 94 },
    labs: { wbc: 14.2, lactate: 3.1 },
    clinicalNotes: 'Fever, hypotension, tachycardia.',
  };

  const predictionResponse = await request(app)
    .post('/api/predict')
    .send({ patient })
    .expect(200);

  assert.equal(predictionResponse.body.sepsisProbability, 0.84);
  assert.equal(predictionResponse.body.mortalityProbability, 0.31);
  assert.equal(calls.predictionCalls.calls.length, 1);

  await request(app)
    .post('/api/predict')
    .send({})
    .expect(400)
    .expect(response => {
      assert.match(String(response.body.error), /required/i);
    });

  const memoryResponse = await request(app)
    .post('/api/memory')
    .send({ patientId: patient.id })
    .expect(200);

  assert.equal(memoryResponse.body.patientId, patient.id);
  assert.equal(Array.isArray(memoryResponse.body.history), true);
  assert.equal(memoryResponse.body.history.length, 1);

  const explainResponse = await request(app)
    .post('/api/explain')
    .send({ patient, prediction: predictionResponse.body })
    .expect(200);

  assert.equal(explainResponse.body.report.summary, 'High sepsis risk.');
  assert.equal(calls.explanationCalls.calls.length, 1);

  const vitalsResponse = await request(app)
    .post('/api/smart-vitals')
    .send({ patient })
    .expect(200);

  assert.equal(vitalsResponse.body.hr, 110);
  assert.equal(calls.vitalsCalls.calls.length, 1);

  const registerResponse = await request(app)
    .post('/api/patients/register')
    .send({ patient })
    .expect(200);

  assert.equal(registerResponse.body.registered, true);
  assert.equal(registerResponse.body.patientId, patient.id);
  assert.equal(calls.registrationCalls.calls.length, 1);

  console.log('API smoke test passed');
}

if (pathToFileURL(process.argv[1] || '').href === import.meta.url) {
  runApiSmoke().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
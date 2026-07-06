import dotenv from 'dotenv';
dotenv.config();

import { ClinicalReportAgent } from '../server/agents/ClinicalReportAgent.js';

async function test() {
  const agent = new ClinicalReportAgent(process.env.GEMINI_API_KEY || '');
  const patientData = {
    id: "P-10497",
    age: 45,
    gender: "M",
    vitals: { hr: 90, bp: "120/80", rr: 18, temp: 37.0, spo2: 98 },
    labs: {},
    clinicalNotes: "Patient is stable."
  };
  const prediction = { sepsisProbability: 0.1, mortalityProbability: 0.05, confidenceScore: 0.8 };
  const explanation = "The patient is generally stable with normal vitals.";
  const nlpEntities = {};

  try {
    const result = await agent.generateReport(patientData, prediction, explanation, nlpEntities);
    console.log("SUCCESS", result);
  } catch (e) {
    console.error("FAILED", e);
  }
}

test();

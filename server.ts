import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
const pdfParse = require('pdf-parse');
import { CoordinatorAgent } from './server/agents/CoordinatorAgent';

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());


// Init Coordinator Agent
const coordinatorAgent = new CoordinatorAgent(process.env.GEMINI_API_KEY || '');

// Mock Database of Patients
const mockPatients = [
  {
    id: "P-10495",
    name: "John Doe",
    age: 68,
    gender: "Male",
    admissionDate: "2023-10-12T08:30:00Z",
    department: "Medical ICU",
    vitals: { hr: 112, bp: "90/58", temp: 38.9, rr: 24, spo2: 92 },
    labs: { wbc: 18.4, lactate: 4.2, creatinine: 1.8 },
    clinicalNotes: "Patient has a history of Type 2 Diabetes and Hypertension. Recently admitted for worsening shortness of breath and suspected COPD exacerbation.",
    status: "Critical"
  },
  {
    id: "P-10496",
    name: "Jane Smith",
    age: 54,
    gender: "Female",
    admissionDate: "2023-10-14T14:15:00Z",
    department: "Surgical ICU",
    vitals: { hr: 88, bp: "110/70", temp: 37.2, rr: 16, spo2: 98 },
    labs: { wbc: 9.1, lactate: 1.2, creatinine: 0.9 },
    clinicalNotes: "Patient recovering from a recent appendectomy. Currently stable and alert, no signs of acute distress.",
    status: "Stable"
  },
  {
    id: "P-10497",
    name: "Robert Chen",
    age: 72,
    gender: "Male",
    admissionDate: "2023-10-15T02:45:00Z",
    department: "Cardiac ICU",
    vitals: { hr: 95, bp: "105/65", temp: 37.8, rr: 20, spo2: 95 },
    labs: { wbc: 12.5, lactate: 2.1, creatinine: 1.4 },
    clinicalNotes: "Patient admitted with acute heart failure and atrial fibrillation. Requires close monitoring of fluid balance.",
    status: "Warning"
  }
];

// Coordinator Agent APIs
app.get('/api/patients', (req, res) => {
  res.json({ patients: mockPatients });
});

app.get('/api/patients/:id', (req, res) => {
  const p = mockPatients.find(x => x.id === req.params.id);
  if (p) res.json(p);
  else res.status(404).json({ error: 'Patient not found' });
});

app.post('/api/patients', (req, res) => {
  const newPatient = {
    ...req.body,
    id: `P-${10500 + mockPatients.length}`,
    admissionDate: new Date().toISOString(),
    status: 'Stable' // Will be evaluated by model
  };
  
  // Basic status heuristic for new entries to demonstrate reactivity
  if (newPatient.vitals.hr > 100 || newPatient.labs.lactate > 2.0) {
    newPatient.status = 'Warning';
  }
  if (newPatient.vitals.hr > 120 && newPatient.labs.lactate > 4.0) {
    newPatient.status = 'Critical';
  }

  mockPatients.push(newPatient);
  res.status(201).json(newPatient);
});
app.post('/api/predict', async (req, res) => {
  const { patientId } = req.body;
  const p = mockPatients.find(x => x.id === patientId);
  if (!p) return res.status(404).json({ error: 'Patient not found' });

  try {
    const prediction = await coordinatorAgent.handlePredictionRequest(p);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run prediction.' });
  }
});

// Explainability API (Delegates to Coordinator Agent)
app.post('/api/explain', async (req, res) => {
  const { patient, prediction } = req.body;
  
  try {
    const explanationData = await coordinatorAgent.handleExplanationRequest(patient, prediction);
    res.json(explanationData);
  } catch (error: any) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

// Document Upload API
app.post('/api/parse-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let documentText = '';
    const fileMimeType = req.file.mimetype;
    
    if (fileMimeType === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      documentText = data.text;
    } else {
      documentText = req.file.buffer.toString('utf-8');
    }

    const structuredData = await coordinatorAgent.handleDocumentUpload(documentText);
    res.json(structuredData);
  } catch (error: any) {
    console.error('Error parsing document:', error);
    res.status(500).json({ error: 'Failed to parse document.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PraOjas AI Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

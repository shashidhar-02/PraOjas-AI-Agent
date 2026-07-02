# Frontend

> **This is a microservice placeholder directory.**
>
> The actual React frontend lives in [`../src/`](../src/) and is served by the main Node.js/Express application ([`../server.ts`](../server.ts)).
> This `frontend/` directory is reserved for a future **decoupled frontend microservice** deployment scenario.

---

## Current Frontend: `src/`

The live frontend is a **React 19 + Vite + TypeScript** single-page application located in `src/`:

```
src/
├── App.tsx              # Root component — layout, routing, and state management
├── main.tsx             # React entry point (renders into index.html #root)
├── index.css            # Global styles — Tailwind CSS v4 + custom animations
├── types.ts             # TypeScript interfaces (Patient, Vitals, Labs, Prediction...)
├── data.ts              # Mock ICU patient data for demonstration
│
├── components/
│   ├── PatientList.tsx          # Left sidebar — ICU roster list
│   ├── PatientDetails.tsx       # Patient header card with vitals snapshot
│   ├── PredictionPanel.tsx      # Sepsis & mortality risk panel (calls /api/predict)
│   ├── ExplainabilityPanel.tsx  # Feature importance & explanation panel (/api/explain)
│   ├── PatientEntryForm.tsx     # Manual patient data entry form
│   ├── PopulationHealthPanel.tsx # Population-level analytics dashboard
│   ├── AlertsDrawer.tsx         # Real-time alerts sidebar for critical patients
│   ├── AgentWorkflowDialog.tsx  # Visual diagram of the MAS architecture
│   ├── VitalsHistoryChart.tsx   # Line chart of vitals over time
│   ├── VitalsHeatmap.tsx        # Heatmap of vitals by hour
│   ├── VitalsSummaryDashboard.tsx # Summary statistics for vitals
│   ├── MedicationTimeline.tsx   # Medication administration timeline
│   ├── PatientHistoryTimeline.tsx # Event timeline for a patient
│   ├── DecisionLogTimeline.tsx  # Audit log of AI decisions for a patient
│   ├── HandoffSummaryModal.tsx  # Clinical handoff summary modal + PDF export
│   ├── PatientComparisonView.tsx # Side-by-side patient comparison
│   ├── FeatureImportanceChart.tsx # Bar chart of SHAP-style feature importance
│   ├── ClinicalNotesEditor.tsx  # Editable clinical notes with NLP analysis
│   ├── ThemeProvider.tsx        # Dark/light theme context provider
│   └── ThemeSwitcher.tsx        # Theme toggle button
│
├── db/
│   ├── index.ts         # Drizzle ORM connection (lazy — safe to import without DB)
│   ├── schema.ts        # patient_history PostgreSQL table schema
│   └── drizzle.config.ts  # Drizzle Kit CLI configuration (for migrations)
│
└── utils/
    └── pdfGenerator.ts  # Client-side PDF report generation (jsPDF + html2canvas)
```

---

## Running the Frontend

The frontend is bundled and served together with the Express backend:

```bash
# Install dependencies (from project root)
npm install

# Start development server with live reload
npm run dev
# → Opens at http://localhost:3000

# Build for production
npm run build
# → Outputs to dist/
```

---

## Future: Decoupled Frontend Microservice

In a production microservice architecture, this `frontend/` directory would contain a standalone Vite/Next.js application that:
- Is deployed independently (e.g., Vercel, Netlify, or a separate Cloud Run service)
- Communicates with the Express API server at a configurable `VITE_API_URL`
- Has its own `package.json`, `Dockerfile`, and CI/CD pipeline

# PraOjas AI - Clinical Decision Support System

PraOjas AI is a next-generation, multi-agent Clinical Decision Support System (CDSS) tailored for the Intensive Care Unit (ICU). It continuously monitors patients' vitals, labs, and clinical notes to predict critical events such as Sepsis and Mortality, leveraging an orchestrated ensemble of AI agents.

## Architecture

The system is split into two primary layers:

1. **Frontend (Vite + React)**:
   - Built with React, Tailwind CSS, and Framer Motion.
   - Provides a real-time, responsive dashboard for clinicians.
   - Features dynamic risk gauges, handoff summaries, and explainable AI panels.

2. **Backend (Express + Node.js)**:
   - **Routes**: Located in `server/routes.ts`, providing secure API endpoints.
   - **Security**: Hardened with `helmet` for HTTP headers, `express-rate-limit` to prevent brute force attacks, and a simulated authentication middleware (`server/middleware/auth.ts`).
   - **Observability**: Uses `pino` for structured JSON logging (`server/utils/logger.ts`), which is essential for professional log aggregation (e.g., Datadog, Splunk).
   - **Agents**: A multi-agent system orchestrating specialized tasks:
     - `MonitoringAgent`: Continuously scans vitals for autonomous alerts.
     - `CoordinatorAgent`: Orchestrates sub-agents and handles retry logic.
     - `PredictionAgent`: Runs the LLM-based sepsis/mortality models.
     - `DocumentUnderstandingAgent`: Parses PDFs and free-text notes.
     - `MedicalKnowledgeAgent`: Cross-references clinical guidelines (e.g., Sepsis-3).

## Setup & Execution

### Prerequisites
- Node.js (v18 or higher)
- NPM or PNPM
- A valid Gemini API Key (`GEMINI_API_KEY`)

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
GEMINI_API_KEY=your_api_key_here
LOG_LEVEL=info
NODE_ENV=development
```

### Installation
```bash
npm install
```

### Running the Application
```bash
# Start the development server (runs both frontend and backend concurrently via TSX and Vite middleware)
npm run dev
```

### Testing
This project uses `vitest` for both frontend and backend unit testing.
```bash
# Run the test suite
npm run test
```

## Engineering Health

- **Code Quality**: Linting enforced via TypeScript (`npm run lint`).
- **Security**: API endpoints are secured with rate limiting, helmet, and mock JWT authentication.
- **Testing**: Configured with `vitest`, `@testing-library/react`, and `supertest`.
- **Complexity**: The monolithic `App.tsx` has been partially refactored to support a scalable `src/components/` and `src/pages/` architecture for enterprise use.

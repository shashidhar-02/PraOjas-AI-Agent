# PraOjas AI - Multi-Agent Clinical Decision Support

**An AI Multi-Agent Clinical Decision Support System for Early Sepsis and Mortality Prediction.**

Developed for the **Kaggle AI Agents: Intensive Vibe Coding Capstone** (Track: Agents for Good).

This project bridges **existing PyTorch research** into a production-grade **Multi-Agent System (MAS)**. It takes a Self-Supervised Multimodal Transformer (which fuses clinical text via Bio_ClinicalBERT and time-series vitals via a Temporal Transformer) and wraps it in a Google Agent Development Kit (ADK) inspired architecture.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![React](https://img.shields.io/badge/React-19-cyan)
![Google Gemini](https://img.shields.io/badge/AI-Gemini%202.5-orange)
![MIMIC--IV](https://img.shields.io/badge/Data-MIMIC--IV-lightgrey)

## 🧠 Core Concept & Value

In ICU settings, early deterioration signs are spread across unstructured clinical notes and noisy time-series vitals. The **PraOjas Multimodal Transformer** solves this by pretraining on MIMIC-IV data to achieve:
- **Sepsis AUROC:** 0.799 (ECE: 0.059)
- **Mortality AUROC:** 0.819 (ECE: 0.136)

This repository takes those research artifacts and builds an **AI Agent ecosystem** to make these predictions actionable, explainable, and secure for clinical staff at the point of care.

## 🤖 Multi-Agent Architecture

The system utilizes an Express.js Model Context Protocol (MCP) layer orchestrating several specialized agents:

1. **Coordinator Agent:** Orchestrates the workflow, routes physician requests, and delegates tasks to sub-agents.
2. **Document Understanding Agent:** Parses uploaded PDFs, CSVs, and text to extract structured clinical data.
3. **Validation Agent:** Validates extracted vitals and labs for anomalous or missing values.
4. **Clinical NLP Agent:** Extracts medical entities (diagnoses, medications, symptoms) from unstructured clinical notes.
5. **Prediction Agent:** Ingests structured clinical data to run the multimodal Transformer model. (The LLM never generates predictions; it strictly calls the existing PyTorch model).
6. **Medical Knowledge / Explainability Agent:** Uses Gemini 2.5 to cross-reference predictions with standard Sepsis Bundles and generates natural language clinical explanations mimicking SHAP / Integrated Gradients.
7. **Clinical Report Agent:** Generates the final clinician-friendly PDF/JSON risk summary and recommended next steps.

## 🏗️ Enterprise Repository Structure

```
/
├── server/
│   ├── agents/      # MAS Logic (Coordinator, Prediction, Explainability, NLP, etc.)
│   └── mcp/         # Model Context Protocol servers (BigQuery, Drive, PDF)
├── src/             # Frontend Dashboard (React 19, Vite, Tailwind, Recharts)
├── frontend/        # Microservice placeholder for decoupled frontend
├── backend/         # Microservice placeholder for decoupled API
├── models/          # Wrapper for the PraOjas PyTorch Transformer inference endpoint
├── services/        # Third-party integrations (GCP Logging, Secret Manager)
├── architecture/    # System design diagrams and workflows
├── deployment/      # Dockerfiles, Cloud Run, Terraform configs
├── docs/            # API specs, Kaggle writeups
└── tests/           # Unit and Integration test suites
```

## 🛠️ Technology Stack (Google Ecosystem)

- **AI Models:** Google Gemini 2.5 Flash SDK (`@google/genai`) for knowledge and explainability.
- **Backend / MCP Server:** Node.js/Express acting as the API gateway and agent orchestrator.
- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, Framer Motion.
- **Security:** API keys isolated in the Node server environment (no browser exposure). Secure enclave pattern.

## 🚀 How to Run

1. Create a `.env` file from `.env.example` and supply your `GEMINI_API_KEY`.
2. Install dependencies: `npm install`
3. Start the Multi-Agent full-stack application: `npm run dev` (Runs Vite + Express concurrently on port 3000).

## 📊 Features & Kaggle Evaluation Criteria

* **Technical Implementation:** Demonstrates dynamic document parsing, validation, and multi-agent coordination.
* **Explainability:** Replaces opaque ML outputs with transparent, actionable natural language reasoning.
* **Security & Privacy:** Enforces a "Secure Enclave" pattern. The frontend handles no AI credentials.

*Original Research Artifacts: The raw PyTorch training notebooks, bio_clinical_ssl_trained checkpoints, and evaluation results are maintained in the core ML repository.*

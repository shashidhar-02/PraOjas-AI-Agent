# MCP Servers — Model Context Protocol

This directory is reserved for **Model Context Protocol (MCP)** server definitions used by PraOjas AI.

MCP servers expose tools that agents can call to retrieve data from external systems — a key component of the Google Agent Development Kit (ADK) architecture pattern.

---

## Planned MCP Servers

### `BigQueryMCP`

**Purpose:** Hospital database retrieval via Google BigQuery.

Exposes tools for agents to query patient records, historical ICU admissions, and population-level clinical data from a BigQuery dataset (e.g., MIMIC-IV on BigQuery).

**Planned Tools:**
| Tool | Description |
|------|-------------|
| `query_patient_history` | Retrieve a patient's historical admission records |
| `get_population_stats` | Aggregate vitals/labs statistics for a cohort |
| `search_similar_cases` | Find historical cases matching a patient's presentation |

---

### `GoogleDriveMCP`

**Purpose:** Fetching patient documents from Google Drive.

Allows agents to retrieve PDFs, lab reports, and imaging summaries stored in a clinical Google Drive folder.

**Planned Tools:**
| Tool | Description |
|------|-------------|
| `list_patient_documents` | List all documents for a given patient ID |
| `fetch_document` | Download and return the raw content of a document |

---

### `FHIRMCP`

**Purpose:** Standards-based health record communication.

Implements the [FHIR R4](https://hl7.org/fhir/R4/) standard for interoperability with EHR systems (e.g., Epic, Cerner). Allows agents to read and write clinical resources in FHIR format.

**Planned Tools:**
| Tool | Description |
|------|-------------|
| `get_patient` | Retrieve a FHIR Patient resource |
| `get_observations` | Fetch vitals and lab observations for a patient |
| `create_risk_assessment` | Write a FHIR RiskAssessment resource with the AI prediction |
| `get_medication_requests` | Retrieve active medication orders |

---

## MCP Architecture

In the current implementation, the agent tools (prediction, explainability, document parsing) are implemented directly as TypeScript methods inside each agent class in [`../server/agents/`](../server/agents/).

The MCP layer is the **next phase** of the architecture — it will expose these capabilities as standardized protocol servers that can be:
- Registered with Google Agent Development Kit (ADK)
- Discovered and called dynamically by the Coordinator Agent
- Shared across multiple agent frameworks

```
CoordinatorAgent
    │
    ├── Direct Agent Calls (current)
    │       ├── PredictionAgent.predict()
    │       └── MedicalKnowledgeAgent.generateExplanation()
    │
    └── MCP Tool Calls (planned)
            ├── BigQueryMCP.query_patient_history()
            ├── GoogleDriveMCP.fetch_document()
            └── FHIRMCP.get_observations()
```

---

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [MIMIC-IV on BigQuery](https://physionet.org/content/mimiciv/2.2/)

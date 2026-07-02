# Deployment

This directory contains configuration files for deploying PraOjas AI to various environments.

---

## Quick Start — Docker Compose (Local)

The `docker-compose.yml` in the project root provides a local PostgreSQL database for development:

```bash
# Start only the database (recommended for local dev with npm run dev)
docker-compose up db -d

# Start the full stack (DB + Python backend microservice)
docker-compose up
```

### Services Defined

| Service | Port | Description |
|---------|------|-------------|
| `db` | `5432` | PostgreSQL 15 (Alpine) — patient history persistence |
| `backend` | `8000` | Python/FastAPI microservice (optional) |

---

## Environment Variables for Docker

Set these in the project root `.env` file before running Docker Compose:

```env
GEMINI_API_KEY=your-gemini-api-key
```

The `docker-compose.yml` passes `GEMINI_API_KEY` from your `.env` into the backend container automatically.

---

## Production Deployment — Google Cloud Run

The original project is designed to deploy to **Google Cloud Run** via Google AI Studio.

### Manual Cloud Run Deploy

```bash
# Build and push Docker image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/praojas-ai

# Deploy to Cloud Run
gcloud run deploy praojas-ai \
  --image gcr.io/YOUR_PROJECT_ID/praojas-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your-key
```

### Dockerfile (Node.js App)

A production Dockerfile for the Node.js fullstack app would look like:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

### Python Backend Dockerfile

See [`../backend/Dockerfile`](../backend/Dockerfile) for the Python/FastAPI service container.

---

## Scaling & Production Notes

- **Secrets**: Use Google Cloud Secret Manager for `GEMINI_API_KEY` and database credentials in production.
- **Database**: Use Google Cloud SQL (PostgreSQL) instead of the local Docker container.
- **CORS**: Update `allow_origins` in `backend/main.py` from `["*"]` to your actual domain in production.
- **JWT Secret**: Change `SECRET_KEY` in `backend/core/config.py` to a strong random secret.
- **HMR**: Set `DISABLE_HMR=true` when deploying to Cloud Run to prevent unnecessary file watching.

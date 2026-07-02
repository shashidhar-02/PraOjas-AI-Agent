import { BigQuery } from '@google-cloud/bigquery';
import * as fs from 'fs';
import * as path from 'path';

// AI Studio requires JSONL with this exact structure for chat models:
// {"messages": [{"role": "user", "content": "..."}, {"role": "model", "content": "..."}]}

const KEY_PATH = path.resolve(process.cwd(), 'service-account-key.json');
const OUTPUT_FILE = path.resolve(process.cwd(), 'gemini-tuning-dataset.jsonl');

const bq = new BigQuery({
  keyFilename: KEY_PATH,
});

/**
 * Calculates a mock risk score based on vitals to use as training labels,
 * since the 'vitals' table doesn't contain actual clinical outcomes.
 * In a real scenario, you'd JOIN with MIMIC-IV 'patients' or 'diagnoses_icd' tables.
 */
function calculateMockLabels(row: any) {
  let sepsisRisk = 10;
  let mortalityRisk = 5;

  if (row.hr > 110) { sepsisRisk += 20; mortalityRisk += 10; }
  if (row.resp > 22) { sepsisRisk += 15; mortalityRisk += 10; }
  if (row.temp > 38.3 || row.temp < 36.0) { sepsisRisk += 25; }
  if (row.spo2 < 92) { mortalityRisk += 25; sepsisRisk += 10; }
  
  // Basic BP parsing (e.g. "120/80")
  if (row.bp) {
    const [sys] = row.bp.split('/').map(Number);
    if (sys < 90) { sepsisRisk += 30; mortalityRisk += 20; }
  }

  return {
    sepsisProbability: Math.min(sepsisRisk / 100, 0.99),
    mortalityProbability: Math.min(mortalityRisk / 100, 0.99),
    confidenceScore: 0.85 + (Math.random() * 0.1)
  };
}

async function exportData() {
  console.log(`[BigQuery] Connecting to project via ${KEY_PATH}...`);
  
  // We query the mimic_extract.vitals table from the user's project
  const query = `
    SELECT patient_id, hr, bp, resp as rr, temp, spo2 
    FROM \`alien-craft-468804-c6.mimic_extract.vitals\`
    LIMIT 500
  `;

  console.log('[BigQuery] Fetching MIMIC-IV data...');
  const [rows] = await bq.query(query);
  console.log(`[BigQuery] Extracted ${rows.length} patient records.`);

  const stream = fs.createWriteStream(OUTPUT_FILE);

  let successCount = 0;
  for (const row of rows) {
    if (!row.hr || !row.bp) continue;

    // 1. Format the User Input (What the model will see)
    const userInput = `Patient Vitals: HR ${row.hr}, BP ${row.bp}, Temp ${row.temp}°C, RR ${row.rr}, SpO2 ${row.spo2}%`;

    // 2. Generate the Model Output (What the model should predict)
    const labels = calculateMockLabels(row);
    const modelOutput = JSON.stringify({
      sepsisProbability: labels.sepsisProbability,
      mortalityProbability: labels.mortalityProbability,
      confidenceScore: labels.confidenceScore,
      modelMetadata: { name: "PraOjas-Tuned-v1" }
    });

    // 3. Construct AI Studio JSONL format
    const jsonlRow = {
      messages: [
        { role: "user", content: userInput },
        { role: "model", content: modelOutput }
      ]
    };

    stream.write(JSON.stringify(jsonlRow) + '\n');
    successCount++;
  }

  stream.end();
  console.log(`[Success] Wrote ${successCount} training examples to ${OUTPUT_FILE}`);
  console.log(`\nNext Steps:`);
  console.log(`1. Go to https://aistudio.google.com/tuning`);
  console.log(`2. Upload 'gemini-tuning-dataset.jsonl'`);
  console.log(`3. Once tuning is complete, paste the model name into .env GEMINI_TUNED_MODEL_NAME`);
}

exportData().catch(console.error);

import { GoogleGenAI, Type, Tool } from '@google/genai';
import { ModelRouter } from './ModelRouter.js';

export class MedicalKnowledgeAgent {
  private router: ModelRouter;

  constructor(apiKey: string) {
    this.router = new ModelRouter(apiKey);
  }

  /**
   * Purpose: Cross-references predictions with clinical guidelines (Surviving Sepsis Campaign 2024).
   * Acts as the Explainability Agent using native Gemini function calling.
   */
  async generateExplanation(patientData: any, prediction: any, errorFeedback?: string) {
    console.log(`[Medical Knowledge Agent] Generating clinical explanation...`);

    const correctionNote = errorFeedback
      ? `\nSELF-CORRECTION: A previous attempt failed: "${errorFeedback}". Re-evaluate and correct.`
      : '';

    const explainTool: Tool = {
      functionDeclarations: [
        {
          name: 'generate_clinical_explanation',
          description: 'Generates a structured clinical explanation with feature importance scores.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: 'Concise clinical explanation of why the model produced these risk scores, referencing specific vitals and lab values. Max 3 paragraphs.'
              },
              featureImportance: {
                type: Type.ARRAY,
                description: 'Feature importance list mimicking SHAP values.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    feature: { type: Type.STRING, description: 'Clinical feature name (e.g. Lactate, HR)' },
                    importance: { type: Type.NUMBER, description: 'Float between -1.0 and 1.0. Positive increases risk, negative decreases risk.' }
                  },
                  required: ['feature', 'importance']
                }
              }
            },
            required: ['explanation', 'featureImportance']
          }
        }
      ]
    };

    try {
      const response = await this.router.generateContent({
        contents: `You are the PraOjas AI Medical Knowledge & Explainability Agent.
You are an expert clinical AI trained on the Surviving Sepsis Campaign 2024 guidelines and MIMIC-IV data.
Cross-reference the prediction below with clinical guidelines and explain the reasoning.

Patient:
- Age/Gender: ${patientData.age} ${patientData.gender}
- Vitals: HR ${patientData.vitals?.hr}, BP ${patientData.vitals?.bp}, Temp ${patientData.vitals?.temp}°C, RR ${patientData.vitals?.rr}, SpO2 ${patientData.vitals?.spo2}%
- Labs: WBC ${patientData.labs?.wbc} × 10⁹/L, Lactate ${patientData.labs?.lactate} mmol/L, Creatinine ${patientData.labs?.creatinine} mg/dL
- Clinical Notes: ${patientData.clinicalNotes || 'None'}

Prediction:
- Sepsis Probability: ${(prediction.sepsisProbability * 100).toFixed(1)}%
- Mortality Probability: ${(prediction.mortalityProbability * 100).toFixed(1)}%
- Confidence: ${(prediction.confidenceScore * 100).toFixed(0)}%
${correctionNote}

Call the generate_clinical_explanation tool with your findings.
The explanation MUST reference specific values (e.g. "Lactate at 4.2 mmol/L far exceeds the Sepsis-3 threshold of 2.0").
Always add a disclaimer at the end that this is decision support, not a final diagnosis.
Include 4-6 feature importance entries covering the key clinical parameters.`,
        config: { temperature: 0.2, tools: [explainTool] }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        return response.functionCalls[0].args as {
          explanation: string;
          featureImportance: { feature: string; importance: number }[];
        };
      }

      // Fallback
      return { explanation: 'Clinical explanation could not be generated.', featureImportance: [] };
    } catch (error) {
      console.error('[Medical Knowledge Agent] Error generating explanation:', error);
      throw error;
    }
  }

  /**
   * Suggests the next plausible vitals reading using native function calling.
   */
  async suggestSmartVitals(patientData: any) {
    console.log(`[Medical Knowledge Agent] Generating smart vitals suggestion...`);

    const vitalsTool: Tool = {
      functionDeclarations: [
        {
          name: 'suggest_vitals_progression',
          description: 'Suggests the next realistic vitals reading based on clinical status and current values.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              hr:   { type: Type.NUMBER, description: 'Heart rate in bpm' },
              bp:   { type: Type.STRING, description: 'Blood pressure in format SYS/DIA' },
              temp: { type: Type.NUMBER, description: 'Temperature in Celsius' },
              rr:   { type: Type.NUMBER, description: 'Respiratory rate breaths/min' },
              spo2: { type: Type.NUMBER, description: 'SpO2 percentage' }
            },
            required: ['hr', 'bp', 'temp', 'rr', 'spo2']
          }
        }
      ]
    };

    try {
      const response = await this.router.generateContent({
        contents: `You are a clinical AI simulating realistic patient vitals progression.
Patient: ${patientData.age}y ${patientData.gender}, Status: ${patientData.status}
Current Vitals: HR ${patientData.vitals?.hr}, BP ${patientData.vitals?.bp}, Temp ${patientData.vitals?.temp}°C, RR ${patientData.vitals?.rr}, SpO2 ${patientData.vitals?.spo2}%
Suggest the next realistic reading. Call suggest_vitals_progression.`,
        config: { temperature: 0.3, tools: [vitalsTool] }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        return response.functionCalls[0].args;
      }
      return patientData.vitals;
    } catch (error) {
      console.error('[Medical Knowledge Agent] Error suggesting vitals:', error);
      return patientData.vitals;
    }
  }
}

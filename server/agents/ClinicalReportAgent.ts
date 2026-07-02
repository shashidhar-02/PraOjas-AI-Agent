import { GoogleGenAI, Type, Tool } from '@google/genai';
import { ModelRouter } from './ModelRouter.js';

export class ClinicalReportAgent {
  private router: ModelRouter;

  constructor(apiKey: string) {
    this.router = new ModelRouter(apiKey);
  }

  /**
   * Purpose: Generates a final clinician-ready summary using native function calling.
   */
  async generateReport(patientData: any, prediction: any, explanation: string, nlpEntities: any, errorFeedback?: string) {
    console.log(`[Clinical Report Agent] Generating final summary report...`);

    const correctionNote = errorFeedback
      ? `\nSELF-CORRECTION: A previous attempt failed: "${errorFeedback}". Re-evaluate.`
      : '';

    const reportTool: Tool = {
      functionDeclarations: [
        {
          name: 'generate_clinical_report',
          description: 'Generates the final clinical decision support summary report.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: '2-3 sentence high-level summary of patient status and key risk factors for the attending physician.'
              },
              keyRiskFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Bullet list of the top 3-5 specific clinical risk factors (e.g. "Lactate 4.2 mmol/L — 2x above Sepsis-3 threshold")'
              },
              recommendedNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable clinical steps based on Surviving Sepsis Campaign 2024 bundles (e.g. "Obtain blood cultures × 2 before antibiotics")'
              }
            },
            required: ['executiveSummary', 'keyRiskFactors', 'recommendedNextSteps']
          }
        }
      ]
    };

    try {
      const response = await this.router.generateContent({
        contents: `You are the PraOjas AI Clinical Report Agent.
Generate a concise, actionable Clinical Decision Support Report for the attending physician.

Patient: ${patientData.name || 'Unknown'}, ${patientData.age}y ${patientData.gender}
Department: ${patientData.department || 'ICU'}
Diagnoses: ${nlpEntities?.diagnoses?.join(', ') || 'None noted'}
Medications: ${nlpEntities?.medications?.join(', ') || 'None noted'}
Vitals: HR ${patientData.vitals?.hr}, BP ${patientData.vitals?.bp}, Temp ${patientData.vitals?.temp}°C, RR ${patientData.vitals?.rr}, SpO2 ${patientData.vitals?.spo2}%
Labs: WBC ${patientData.labs?.wbc}, Lactate ${patientData.labs?.lactate} mmol/L, Creatinine ${patientData.labs?.creatinine} mg/dL

AI Prediction:
- Sepsis Risk: ${(prediction.sepsisProbability * 100).toFixed(1)}%
- Mortality Risk: ${(prediction.mortalityProbability * 100).toFixed(1)}%
- Confidence: ${(prediction.confidenceScore * 100).toFixed(0)}%

Clinical Explanation:
${explanation}
${correctionNote}

Call the generate_clinical_report tool with your final report.
Be specific — cite actual numeric values in risk factors and SSC bundle steps in recommendations.`,
        config: { temperature: 0.2, tools: [reportTool] }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        return response.functionCalls[0].args as {
          executiveSummary: string;
          keyRiskFactors: string[];
          recommendedNextSteps: string[];
        };
      }

      return {
        executiveSummary: 'Report generation returned no structured output.',
        keyRiskFactors: [],
        recommendedNextSteps: ['Review raw clinical data manually.']
      };
    } catch (error) {
      console.error('[Clinical Report Agent] Error:', error);
      throw error;
    }
  }
}

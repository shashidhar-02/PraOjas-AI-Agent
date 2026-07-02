import { GoogleGenAI, Type, Tool } from '@google/genai';
import { ModelRouter } from './ModelRouter.js';

export class ValidationAgent {
  private router: ModelRouter;

  constructor(apiKey: string) {
    this.router = new ModelRouter(apiKey);
  }

  /**
   * Purpose: Validates extracted clinical data for missing/anomalous values
   * using native Gemini function calling for reliable structured output.
   */
  async validateData(patientData: any, errorFeedback?: string) {
    console.log(`[Validation Agent] Validating data for ${patientData.name || 'Unknown Patient'}...`);
    
    const correctionNote = errorFeedback 
      ? `\nSELF-CORRECTION: A previous validation attempt failed: "${errorFeedback}". Re-evaluate carefully.`
      : '';

    const validateTool: Tool = {
      functionDeclarations: [
        {
          name: 'validate_patient_data',
          description: 'Returns the validation result for the clinical patient data.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              isValid: {
                type: Type.BOOLEAN,
                description: 'False only if critical data (HR, BP, Lactate) is missing or absurdly out of range (HR > 300)'
              },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of warnings about missing non-critical data or mildly out-of-range values'
              },
              correctedData: {
                type: Type.OBJECT,
                description: 'The original data with any obvious formatting errors fixed (e.g. negative age). If no corrections needed, return original data.'
              }
            },
            required: ['isValid', 'warnings', 'correctedData']
          }
        }
      ]
    };

    try {
      const response = await this.router.generateContent({
        contents: `You are the PraOjas AI Validation Agent. Review the following extracted clinical data for missing, anomalous, or critically out-of-range values.
        
Patient Data:
${JSON.stringify(patientData, null, 2)}
${correctionNote}

Call the validate_patient_data tool with your assessment.`,
        config: { temperature: 0.1, tools: [validateTool] }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        return response.functionCalls[0].args as { isValid: boolean; warnings: string[]; correctedData: any };
      }
      
      // Fallback: if no function call, return safe default
      return { isValid: true, warnings: ['Validation ran but returned no structured output.'], correctedData: patientData };
    } catch (error) {
      console.error('[Validation Agent] Error:', error);
      return { isValid: true, warnings: ['Validation agent failed to run.'], correctedData: patientData };
    }
  }
}

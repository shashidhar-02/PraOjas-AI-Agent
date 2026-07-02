import { GoogleGenAI, Type, Tool } from '@google/genai';
import { ModelRouter } from './ModelRouter.js';

export class ClinicalNLPAgent {
  private router: ModelRouter;

  constructor(apiKey: string) {
    this.router = new ModelRouter(apiKey);
  }

  /**
   * Purpose: Extracts structured medical entities (diagnoses, medications, symptoms, procedures)
   * from unstructured clinical notes using native Gemini function calling.
   */
  async extractEntities(clinicalNotes: string, errorFeedback?: string) {
    console.log(`[Clinical NLP Agent] Extracting entities from clinical notes...`);
    
    if (!clinicalNotes || clinicalNotes.trim() === '') {
      return { diagnoses: [], medications: [], symptoms: [], procedures: [] };
    }

    const correctionNote = errorFeedback
      ? `\nSELF-CORRECTION: A previous extraction attempt failed: "${errorFeedback}". Re-evaluate carefully.`
      : '';

    const extractTool: Tool = {
      functionDeclarations: [
        {
          name: 'extract_medical_entities',
          description: 'Extracts structured clinical entities from unstructured medical notes.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              diagnoses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of diagnoses or comorbidities'
              },
              medications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of medications mentioned'
              },
              symptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of symptoms'
              },
              procedures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of procedures or surgeries'
              }
            },
            required: ['diagnoses', 'medications', 'symptoms', 'procedures']
          }
        }
      ]
    };

    try {
      const response = await this.router.generateContent({
        contents: `You are the PraOjas AI Clinical NLP Agent. Analyze the following unstructured clinical notes and extract all relevant medical entities.

Clinical Notes:
${clinicalNotes}
${correctionNote}

Call the extract_medical_entities tool with your findings. If a category has no items, return an empty array.`,
        config: { temperature: 0.1, tools: [extractTool] }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        return response.functionCalls[0].args as {
          diagnoses: string[];
          medications: string[];
          symptoms: string[];
          procedures: string[];
        };
      }

      return { diagnoses: [], medications: [], symptoms: [], procedures: [] };
    } catch (error) {
      console.error('[Clinical NLP Agent] Error:', error);
      return { diagnoses: [], medications: [], symptoms: [], procedures: [] };
    }
  }
}

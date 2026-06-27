import logging
import json
from google import genai
from google.genai import types
from backend.core.config import settings
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ExplainabilityAgent:
    """
    Generates natural language explanations mimicking SHAP/Integrated Gradients
    based on the prediction results.
    """
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None

    def generate_explanation(self, patient_data: Dict, prediction: Dict) -> Dict[str, Any]:
        if not self.client:
            logger.warning("GEMINI_API_KEY not set. Skipping explainability.")
            return {
                "explanation": "Gemini API key missing. Unable to generate explanation.",
                "feature_importance": [],
                "recommendations": []
            }
            
        prompt = f"""
        You are the PraOjas AI Medical Knowledge Agent.
        The PraOjas Multimodal Transformer model has output the following predictions based on the patient's data:
        Patient Data: {json.dumps(patient_data)}
        Prediction: {json.dumps(prediction)}
        
        Provide a JSON response (no markdown) with:
        1. "explanation": A natural language clinical explanation mimicking SHAP/Integrated Gradients feature importance.
        2. "feature_importance": Array of objects like {{"feature": "Lactate", "importance": 0.85}} (Importance between -1.0 and 1.0).
        3. "recommendations": Array of 3 string recommendations based on Sepsis Bundles (e.g., "Initiate broad-spectrum antibiotics within 1 hr").
        """
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Error generating explanation: {e}")
            return {
                "explanation": "Explainability generation failed.",
                "feature_importance": [],
                "recommendations": []
            }

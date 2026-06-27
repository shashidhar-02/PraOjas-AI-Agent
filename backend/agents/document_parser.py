import json
import logging
from google import genai
from google.genai import types
from backend.core.config import settings

logger = logging.getLogger(__name__)

class DocumentParserAgent:
    """
    Agent responsible for extracting structured clinical data from uploaded documents.
    """
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None

    def parse_document(self, document_text: str) -> dict:
        if not self.client:
            logger.warning("GEMINI_API_KEY not set, using mock extraction.")
            return {"vitals": {"hr": 85}, "labs": {"lactate": 2.1}, "clinical_notes": document_text}
            
        logger.info("Extracting entities via Gemini...")
        prompt = f"""
        Extract clinical information from the following text and return ONLY valid JSON matching this schema:
        {{
            "name": "Patient Name",
            "age": 45,
            "gender": "Male/Female/Other",
            "department": "ICU",
            "vitals": {{"hr": 85, "bp": "120/80", "temp": 37.2, "rr": 16, "spo2": 98}},
            "labs": {{"wbc": 12.0, "lactate": 2.1, "creatinine": 1.1}},
            "clinical_notes": "Summary of diagnoses and notes"
        }}
        
        Text: {document_text}
        """
        
        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1
                )
            )
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Error extracting data: {e}")
            raise

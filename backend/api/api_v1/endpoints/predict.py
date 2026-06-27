from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
import json

from backend.schemas.schemas import PatientPredictionRequest, PredictionResponse
from backend.db.database import get_db
from backend.db.models import PredictionHistory, Admission, Patient
from backend.agents.coordinator import coordinator

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_risk(request: PatientPredictionRequest, db: Session = Depends(get_db)):
    """
    Orchestrates the prediction workflow using the pre-trained Transformer model and Gemini Explainability Agent.
    Stores the results in the PostgreSQL database.
    """
    try:
        # Pass to Coordinator Agent
        patient_data_dict = request.model_dump()
        result = coordinator.process_prediction_request(patient_data_dict)
        
        # Combine into response schema
        response = PredictionResponse(
            sepsis_probability=result["sepsis_probability"],
            mortality_probability=result["mortality_probability"],
            confidence_score=result["confidence_score"],
            explainability=result["explainability"],
            feature_importance=result["feature_importance"],
            recommendations=result["recommendations"],
            timestamp=datetime.utcnow()
        )
        
        # Persist to database (Skipping actual ORM persistence if patient/admission missing to avoid foreign key errors in demo, but simulating it)
        # In a real system, you would lookup/create patient and admission here
        # db.add(PredictionHistory(...))
        # db.commit()
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a clinical document (PDF/TXT/CSV) for automated parsing.
    """
    try:
        content = await file.read()
        text_content = content.decode("utf-8") # Basic text decoding; use pdf-parse/pymupdf for PDF in production
        
        structured_data = coordinator.process_uploaded_document(text_content)
        return {"status": "success", "data": structured_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process document: {str(e)}")

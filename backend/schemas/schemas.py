from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# --- Clinical Data Schemas ---
class VitalsInput(BaseModel):
    hr: Optional[float] = None
    bp: Optional[str] = None
    temp: Optional[float] = None
    rr: Optional[float] = None
    spo2: Optional[float] = None

class LabsInput(BaseModel):
    wbc: Optional[float] = None
    lactate: Optional[float] = None
    creatinine: Optional[float] = None

class PatientPredictionRequest(BaseModel):
    patient_id: str
    vitals: VitalsInput
    labs: LabsInput
    clinical_notes: Optional[str] = ""

# --- Prediction Output Schemas ---
class FeatureImportanceSchema(BaseModel):
    feature: str
    importance: float

class PredictionResponse(BaseModel):
    sepsis_probability: float
    mortality_probability: float
    confidence_score: float
    explainability: str
    feature_importance: List[FeatureImportanceSchema]
    recommendations: List[str]
    timestamp: datetime

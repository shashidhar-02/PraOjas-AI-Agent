from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="doctor")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, index=True) # E.g., hospital MRN
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    admissions = relationship("Admission", back_populates="patient")

class Admission(Base):
    __tablename__ = "admissions"
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    department = Column(String, nullable=True)
    admission_time = Column(DateTime(timezone=True), server_default=func.now())
    
    patient = relationship("Patient", back_populates="admissions")
    predictions = relationship("PredictionHistory", back_populates="admission")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(String, ForeignKey("admissions.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    
    # Inputs
    raw_vitals = Column(JSON, nullable=True)
    raw_labs = Column(JSON, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    
    # Outputs
    sepsis_probability = Column(Float, nullable=False)
    mortality_probability = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    # Explainability & Reports
    explainability_summary = Column(Text, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    admission = relationship("Admission", back_populates="predictions")
    doctor = relationship("User")

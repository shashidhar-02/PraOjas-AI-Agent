import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_predict_endpoint_mock():
    # Tests the predict endpoint structure
    payload = {
        "patient_id": "P12345",
        "vitals": {"hr": 95, "bp": "110/70", "temp": 38.1},
        "labs": {"wbc": 14.5, "lactate": 2.8},
        "clinical_notes": "Patient presents with fever and tachycardia."
    }
    response = client.post("/api/v1/clinical/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "sepsis_probability" in data
    assert "recommendations" in data

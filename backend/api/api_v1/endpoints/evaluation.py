from fastapi import APIRouter, Depends
from backend.services.evaluation_service import evaluation_service
from backend.api.deps import get_current_active_user

router = APIRouter()

@router.get("/calibration")
def get_calibration_metrics(current_user = Depends(get_current_active_user)):
    """Retrieve model calibration metrics from CSV."""
    return {"status": "success", "data": evaluation_service.get_calibration_metrics()}

@router.get("/feature-importance")
def get_feature_importance(current_user = Depends(get_current_active_user)):
    """Retrieve combined feature importance from CSV."""
    return {"status": "success", "data": evaluation_service.get_feature_importance()}

@router.get("/kfold")
def get_kfold_results(current_user = Depends(get_current_active_user)):
    """Retrieve k-fold validation results from CSV."""
    return {"status": "success", "data": evaluation_service.get_kfold_results()}

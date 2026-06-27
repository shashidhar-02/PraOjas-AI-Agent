from fastapi import APIRouter
from backend.api.api_v1.endpoints import predict, evaluation, auth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(predict.router, prefix="/clinical", tags=["clinical"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["evaluation"])

# backend/app/api/__init__.py

from app.api.model import router as model_router

__all__ = [
    "model_router",
]

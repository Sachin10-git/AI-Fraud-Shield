# backend/app/main.py
# Clean FastAPI entry point – Prediction ONLY (No DB, No History)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import ONLY the model router
from app.api.model import router as model_router

# -------------------------
# FastAPI App
# -------------------------
app = FastAPI(
    title="Fraud Shield",
    description="Stateless ML Anomaly Detection API",
    version="1.0.0",
)

# -------------------------
# CORS (Frontend Access)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Routers
# -------------------------
app.include_router(model_router)

# -------------------------
# Health Check
# -------------------------
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Fraud Shield Backend",
        "mode": "prediction-only",
    }

# -------------------------
# Local run
# -------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

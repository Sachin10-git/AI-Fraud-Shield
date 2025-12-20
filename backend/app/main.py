from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import ONLY the model router
from app.api.model import router as model_router


app = FastAPI(
    title="Fraud Shield",
    description="Stateless ML Anomaly Detection API",
    version="1.0.0",
)


# ✅ CORS FIX (ALLOW FRONTEND FROM ANY DOMAIN)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # ← THIS FIXES VERCEL
    allow_credentials=False,    # must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(model_router)


# Health Check
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Fraud Shield Backend",
        "mode": "prediction-only",
    }



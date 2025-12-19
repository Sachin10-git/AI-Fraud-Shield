from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import joblib
import numpy as np
from pathlib import Path

router = APIRouter(prefix="/api/model", tags=["model"])

# Paths to ML artifacts

HERE = Path(__file__).resolve().parent
ML_DIR = (HERE / ".." / "ml").resolve()

MODEL_PATH = str(ML_DIR / "model_if.pkl")
SCALER_PATH = str(ML_DIR / "scaler.pkl")
TYPE_ENCODER_PATH = str(ML_DIR / "type_encoder.pkl")


# Safe loader

def safe_load(path: str):
    return joblib.load(path) if os.path.exists(path) else None

_model = safe_load(MODEL_PATH)
_scaler = safe_load(SCALER_PATH)
_type_encoder = safe_load(TYPE_ENCODER_PATH)


# Schemas

class ModelPredictIn(BaseModel):
    txn_id: Optional[str]
    step: Optional[float] = None
    type: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrg: float
    oldbalanceDest: float
    newbalanceDest: float
    origin: Optional[str] = None
    destination: Optional[str] = None

class ModelPredictOut(BaseModel):
    txn_id: Optional[str]
    anomaly_score: float
    predicted_anomaly: int
    model_version: Optional[str]
    details: Optional[Dict[str, Any]] = None

class ModelInfoOut(BaseModel):
    model_loaded: bool
    scaler_loaded: bool
    type_encoder_loaded: bool
    model_version: Optional[str]


# Constants

ANOMALY_THRESHOLD = 0.0  

FEATURE_ORDER = [
    "amount",
    "oldbalanceOrg",
    "newbalanceOrg",
    "oldbalanceDest",
    "newbalanceDest",
    "step",
    "type_code",
    "balance_delta_org",
    "balance_delta_dest",
]


# Helpers

def get_model_version():
    try:
        return Path(MODEL_PATH).name + "@" + str(int(os.path.getmtime(MODEL_PATH)))
    except Exception:
        return None

def preprocess_record(rec: ModelPredictIn):
    try:
        type_code = int(_type_encoder.transform([rec.type])[0]) if _type_encoder else 0
    except Exception:
        type_code = 0

    bal_org = rec.newbalanceOrg - rec.oldbalanceOrg
    bal_dest = rec.newbalanceDest - rec.oldbalanceDest

    features = [
        rec.amount,
        rec.oldbalanceOrg,
        rec.newbalanceOrg,
        rec.oldbalanceDest,
        rec.newbalanceDest,
        rec.step or 0.0,
        type_code,
        bal_org,
        bal_dest,
    ]

    X = np.array(features, dtype=float).reshape(1, -1)

    if _scaler is None:
        raise RuntimeError("Scaler not loaded")

    return _scaler.transform(X), features


# Endpoints

@router.get("/info", response_model=ModelInfoOut)
def model_info():
    return ModelInfoOut(
        model_loaded=_model is not None,
        scaler_loaded=_scaler is not None,
        type_encoder_loaded=_type_encoder is not None,
        model_version=get_model_version(),
    )

@router.post("/predict", response_model=ModelPredictOut)
def predict(item: ModelPredictIn):
    if _model is None or _scaler is None:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded")

    # Preprocess
    Xs, _ = preprocess_record(item)

    # Isolation Forest score
    raw_decision = float(_model.decision_function(Xs)[0])
    anomaly_score = -raw_decision  # higher = more suspicious

    # Score-based classification
    predicted_anomaly = 1 if anomaly_score > ANOMALY_THRESHOLD else 0

    return ModelPredictOut(
        txn_id=item.txn_id,
        anomaly_score=anomaly_score,
        predicted_anomaly=predicted_anomaly,
        model_version=get_model_version(),
        details={
            "threshold": ANOMALY_THRESHOLD,
            "rule": "anomaly_score > 0 → Suspicious",
        },
    )

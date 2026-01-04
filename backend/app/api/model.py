from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import joblib
import numpy as np
from pathlib import Path

router = APIRouter(prefix="/api/model", tags=["model"])

# Paths

HERE = Path(__file__).resolve().parent
ML_DIR = (HERE / ".." / "ml").resolve()

MODEL_PATH = str(ML_DIR / "model_if.pkl")
SCALER_PATH = str(ML_DIR / "scaler.pkl")
TYPE_ENCODER_PATH = str(ML_DIR / "type_encoder.pkl")

# Load 

def safe_load(path: str):
    return joblib.load(path) if os.path.exists(path) else None

_model = safe_load(MODEL_PATH)
_scaler = safe_load(SCALER_PATH)
_type_encoder = safe_load(TYPE_ENCODER_PATH)

# Schemas 

class ModelPredictIn(BaseModel):
    txn_id: Optional[str]
    step: Optional[float]
    type: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrg: float
    oldbalanceDest: float
    newbalanceDest: float
    origin: Optional[str]
    destination: Optional[str]

class ModelPredictOut(BaseModel):
    txn_id: Optional[str]
    anomaly_score: float
    predicted_anomaly: int
    model_version: str
    details: Dict[str, Any]

# Constants

ANOMALY_THRESHOLD = 0.6  # FINAL threshold

# Preprocessing

def preprocess(txn: ModelPredictIn):
    try:
        type_code = int(_type_encoder.transform([txn.type])[0]) if _type_encoder else 0
    except:
        type_code = 0

    bal_org_delta = txn.newbalanceOrg - txn.oldbalanceOrg
    bal_dest_delta = txn.newbalanceDest - txn.oldbalanceDest

    X = np.array([[  
        txn.amount,
        txn.oldbalanceOrg,
        txn.newbalanceOrg,
        txn.oldbalanceDest,
        txn.newbalanceDest,
        txn.step or 0.0,
        type_code,
        bal_org_delta,
        bal_dest_delta
    ]])

    if _scaler is None:
        raise RuntimeError("Scaler not loaded")

    return _scaler.transform(X)

def based_anomaly(txn: ModelPredictIn) -> Dict[str, bool]:
    sender_expected = txn.oldbalanceOrg - txn.amount
    receiver_expected = txn.oldbalanceDest + txn.amount

    sender_mismatch = not np.isclose(txn.newbalanceOrg, sender_expected)
    receiver_mismatch = not np.isclose(txn.newbalanceDest, receiver_expected)

    negative_balance = txn.newbalanceOrg < 0 or txn.newbalanceDest < 0

    money_flow_mismatch = abs(
        (txn.oldbalanceOrg - txn.newbalanceOrg) -
        (txn.newbalanceDest - txn.oldbalanceDest)
    ) > 1e-6

    return {
        "sender_balance_mismatch": sender_mismatch,
        "receiver_balance_mismatch": receiver_mismatch,
        "negative_balance": negative_balance,
        "money_flow_mismatch": money_flow_mismatch,
    }

# Endpoint

@router.post("/predict", response_model=ModelPredictOut)
def predict(txn: ModelPredictIn):
    if _model is None or _scaler is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # ML SCORE
    Xs = preprocess(txn)
    raw_score = float(_model.decision_function(Xs)[0])
    ml_score = -raw_score  # higher = more anomalous

    # SCORE
    semantic = based_anomaly(txn)

    r_score = 0.0
    R_WEIGHT = 0.7

    for triggered in semantic.values():
        if triggered:
            r_score += R_WEIGHT

    # FINAL SCORE
    anomaly_score = ml_score + r_score

    predicted_anomaly = 1 if anomaly_score >= ANOMALY_THRESHOLD else 0

    return ModelPredictOut(
        txn_id=txn.txn_id,
        anomaly_score=round(anomaly_score, 4),
        predicted_anomaly=predicted_anomaly,
        model_version="hybrid-rule-ml-v1",
        details={
            "ml_score": round(ml_score, 4),
            "r_score": round(r_score, 4),
            "rules_triggered": semantic,
            "threshold": ANOMALY_THRESHOLD
        }
    )

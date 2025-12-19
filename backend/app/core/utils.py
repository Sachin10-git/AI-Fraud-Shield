# backend/app/core/utils.py
"""
Core utility helpers used across the Fraud Shield backend.

Includes:
- ML model loading (cached)
- Transaction preprocessing
- Feature extraction helpers
- Safe JSON conversion utilities
- Model version helper
"""

import os
import joblib
import numpy as np
from datetime import datetime
from functools import lru_cache

from app.core.config import get_settings

settings = get_settings()

# Feature order expected by the ML model
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

# --------------------------------------------------------
# ML Artifact Loading
# --------------------------------------------------------

def load_artifact(path: str):
    """Load a single ML artifact with error handling."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Artifact not found: {path}")
    return joblib.load(path)


@lru_cache()
def load_model():
    """Load ML model once and cache it."""
    return load_artifact(settings.MODEL_PATH)


@lru_cache()
def load_scaler():
    """Load scaler once and cache it."""
    return load_artifact(settings.SCALER_PATH)


@lru_cache()
def load_type_encoder():
    """Load type encoder once and cache it."""
    return load_artifact(settings.TYPE_ENCODER_PATH)


# --------------------------------------------------------
# Feature Engineering
# --------------------------------------------------------

def extract_features(txn: dict):
    """
    Extract raw feature list for a transaction before scaling.
    Input should be dict-like (e.g., Pydantic model .dict()).
    """
    type_encoder = load_type_encoder()

    try:
        type_code = int(type_encoder.transform([txn["type"]])[0])
    except Exception:
        type_code = 0  # fallback for unseen category

    balance_delta_org = txn["newbalanceOrg"] - txn["oldbalanceOrg"]
    balance_delta_dest = txn["newbalanceDest"] - txn["oldbalanceDest"]

    feat = [
        txn["amount"],
        txn["oldbalanceOrg"],
        txn["newbalanceOrg"],
        txn["oldbalanceDest"],
        txn["newbalanceDest"],
        txn.get("step", 0.0),
        type_code,
        balance_delta_org,
        balance_delta_dest,
    ]

    return feat


def preprocess_transaction(txn_dict):
    """
    Convert transaction dict → feature vector → scaled model input.
    Returns: (X_scaled, raw_feature_list)
    """
    feat = extract_features(txn_dict)
    scaler = load_scaler()

    X = np.array(feat, dtype=float).reshape(1, -1)
    X_scaled = scaler.transform(X)

    return X_scaled, feat


# --------------------------------------------------------
# Model Version Helper
# --------------------------------------------------------

def get_model_version():
    """Return model version based on file modification timestamp."""
    try:
        mtime = os.path.getmtime(settings.MODEL_PATH)
        return datetime.utcfromtimestamp(mtime).isoformat() + "Z"
    except Exception:
        return "unknown"


# --------------------------------------------------------
# JSON Utility
# --------------------------------------------------------

def json_safe_features(raw_features):
    """
    Convert raw features list into a JSON-friendly dict {feature_name: value}.
    """
    return {k: float(v) for k, v in zip(FEATURE_ORDER, raw_features)}

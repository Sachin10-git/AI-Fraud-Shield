def predict_transaction(payload: dict):
    
    amount = payload.get("amount", 0)
    tx_type = payload.get("type", "")

    # Simple heuristic-based score (acts like ML)
    anomaly_score = 0.0
    predicted_anomaly = 0

    if tx_type in ["TRANSFER", "CASH_OUT"]:
        if amount > 25000:
            anomaly_score = 0.85
            predicted_anomaly = 1
        elif amount > 15000:
            anomaly_score = 0.55
            predicted_anomaly = 0
        else:
            anomaly_score = 0.2
    else:
        anomaly_score = 0.1

    return anomaly_score, predicted_anomaly

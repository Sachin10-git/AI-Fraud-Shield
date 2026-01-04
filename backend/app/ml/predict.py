def predict_transaction(payload: dict):

    amount = payload.get("amount", 0)
    tx_type = payload.get("type", "")

    old_org = payload.get("oldbalanceOrg", 0)
    new_org = payload.get("newbalanceOrg", 0)
    old_dest = payload.get("oldbalanceDest", 0)
    new_dest = payload.get("newbalanceDest", 0)

    anomaly_score = 0.0
    predicted_anomaly = 0
    reasons = []

    # -----------------------------
    # 1️⃣ Balance consistency rules
    # -----------------------------

    expected_new_org = old_org - amount
    expected_new_dest = old_dest + amount

    if new_org != expected_new_org:
        reasons.append("Sender balance mismatch")
        anomaly_score += 0.5

    if new_dest != expected_new_dest:
        reasons.append("Receiver balance mismatch")
        anomaly_score += 0.5

    if new_org < 0 or new_dest < 0:
        reasons.append("Negative balance detected")
        anomaly_score += 0.7

    money_mismatch = abs(
        (old_org - new_org) - (new_dest - old_dest)
    )

    if money_mismatch > 0:
        reasons.append("Money creation/loss detected")
        anomaly_score += 0.9

    # -----------------------------
    # 2️⃣ Amount-based heuristic
    # -----------------------------

    if tx_type in ["TRANSFER", "CASH_OUT"]:
        if amount > 25000:
            anomaly_score += 0.85
        elif amount > 15000:
            anomaly_score += 0.55
        else:
            anomaly_score += 0.2
    else:
        anomaly_score += 0.1

    # -----------------------------
    # 3️⃣ Final decision
    # -----------------------------

    if anomaly_score >= 1.0:
        predicted_anomaly = 1

    return anomaly_score, predicted_anomaly, reasons

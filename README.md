## 👨‍💻 Author 
## Sachin S

# 🛡️ FraudShield — Real-Time Transaction Anomaly Detection

FraudShield is a **full-stack fraud detection web application** that analyzes financial transactions in real time using **machine learning (Isolation Forest)** to identify **suspicious and abnormal behavior**.

The system provides:
- Live anomaly scoring
- Clear classification of **Normal vs Suspicious** transactions
- Transaction tracking & visualization
- Persistent transaction history (client-side)
- Clean, intuitive dashboard UI

---

## 🚀 Features

### 🔍 Transaction Analysis
- Supports transaction types:
  - `TRANSFER`
  - `PAYMENT`
  - `CASH_OUT`
  - `CASH_IN`
- Automatically computes balance changes
- Assigns an **anomaly score** to each transaction

### ⚠️ Anomaly Detection
- Uses **Isolation Forest** (unsupervised ML)
- Anomaly score logic:
  - `score > 0` → **Suspicious**
  - `score ≤ 0` → **Normal**
- Higher score = higher risk

### 📊 Fraud Tracking Dashboard
- Bar chart comparing **Normal vs Suspicious transactions**
- Grouped by transaction type
- Live updates from transaction history

### 📜 Transaction History
- All analyzed transactions stored locally (browser `localStorage`)
- Clean tabular display with status indicators

### 🏠 Home Dashboard
- Total **affected amount** 
- Count of suspicious transactions
- Quick navigation to:
  - Transaction Analysis
  - Fraud Tracking
  - Transaction History

---

## 🧠 Tech Stack

### Backend
- **FastAPI**
- **Uvicorn** (ASGI server)
- **Scikit-learn**
- **Isolation Forest**
- **StandardScaler**
- **Joblib** (model persistence)

### Frontend
- **React (Vite)**
- **Chart.js**
- **Tailwind CSS**
- **LocalStorage** (no database dependency)

---

## 🗂️ Project Structure
```
backend/
├── app/
│ ├── api/
│ │ └── model.py # ML prediction endpoint
│ ├── ml/
│ │ ├── model_if.pkl # Isolation Forest model
│ │ ├── scaler.pkl
│ │ └── type_encoder.pkl
│ ├── core/
│ │ └── config.py
│ └── main.py # FastAPI entry point
├── requirements.txt
└── README.md
data/
├── notebooks
  └── training.ipynb
frontend/
├── src/
│ ├── pages/
│ │ ├── Home.jsx
│ │ ├── Transfer.jsx
│ │ ├── Track.jsx
│ │ └── History.jsx
│ ├── services/
│ │ └── api.js
│ └── components/
└── package.json
```
## ⚙️ Setup Instructions

### 🔧 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

backend runs at:
http://127.0.0.1:8000
```
### 🔧 Frontend Setup

```bash
cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:5173
```

## 🔮 Future Improvements
- Use of Blockchain & advanced ML models.
- Authentication & roles
- Fraud confirmation workflow
- Explainable AI
- Public Deployment
  

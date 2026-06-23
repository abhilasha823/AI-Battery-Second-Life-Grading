# 🔋 SecondLife EV
### AI-Powered Battery Second-Life Grading, Risk Assessment & Digital Battery Passport

An AI-driven platform that predicts EV battery State of Health (SOH), grades batteries for second-life applications, and recommends reuse, refurbishment, or recycling pathways to support a circular automotive economy.

Built for **ET AutoTech Hackathon 2026**.

---

## Problem Statement

Electric Vehicle batteries lose capacity over time and eventually become unsuitable for vehicle use. However, many retired batteries still retain significant usable life for secondary applications.

Current challenges include:

- Lack of standardized battery health assessment
- Difficulty identifying reuse candidates
- Limited transparency in battery lifecycle tracking
- Inefficient recycling and refurbishment decisions

SecondLife EV addresses these challenges through AI-powered battery health prediction and intelligent second-life routing.

---

## Key Features

### 🔹 AI-Based SOH Prediction
Predicts battery State of Health using machine learning.

### 🔹 Battery Grading Engine
Automatically classifies batteries:

| Grade | SOH Range | Recommendation |
|-------|---------|-----------|
| A     | ≥ 80%   | Reuse     |
| B     | 60–79%  | Refurbish |
| C     | < 60%   | Recycle   |

### 🔹 Risk Assessment
Provides battery risk categorization:

- Low Risk
- Medium Risk
- High Risk

### 🔹 Digital Battery Passport
Generates a digital identity for every battery containing:

- Battery Health
- SOH
- Risk Level
- Remaining Useful Life
- Residual Value
- Sustainability Impact

### 🔹 QR Code Access
Each battery passport includes a QR code for instant access.

### 🔹 AI Explainability
Shows key drivers behind battery health predictions.

### 🔹 Feature Importance Visualization
Displays how different battery parameters influence SOH predictions.

### 🔹 Sustainability Metrics
Calculates:

- Estimated CO₂ Savings
- Remaining Useful Life (RUL)
- Residual Battery Value

---

## Machine Learning

### Model

Random Forest Regressor

### Target

State of Health (SOH)

### Features

- Voltage
- Current
- Temperature
- Cycle Count
- Capacity

### Training Dataset

NASA PCoE Battery Aging Dataset

Source:

https://www.kaggle.com/datasets/patrickfleith/nasa-battery-dataset

### Model Performance

| Metric   | Value  |
|----------|--------|
| MAE      | 1.53   |
| R² Score | 0.984  |

---

## Architecture

```text
Frontend (React + Vite)
        │
        ▼
FastAPI Backend
        │
        ▼
Random Forest Model
        │
        ▼
SQLite Database
        │
        ▼
Battery Passport + Analytics
```

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- React Router

### Backend

- FastAPI
- SQLAlchemy
- SQLite

### Machine Learning

- Scikit-learn
- Random Forest Regressor
- NumPy
- Pandas
- Joblib

---

## 📂 Project Structure

```text
SOH/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── ml.py
│   │   ├── grading.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── train_model.py
│   │   └── soh_model.pkl
│   │
│   └── requirements.txt
│
├── archive/
│   └── cleaned_dataset/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>

cd SOH
```

---

### Backend Setup

```bash
cd backend

pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend Setup

```bash
cd frontend

npm install
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Input CSV Format

Upload CSV files with:

```csv
battery_id,voltage,current,temperature,cycle_count,capacity
BAT-001,3.8,1.2,28,500,1.85
BAT-002,3.5,1.8,35,1200,1.40
```

---

## Workflow

### Step 1

Upload battery telemetry CSV.

### Step 2

AI model predicts battery SOH.

### Step 3

Battery is graded:

- Grade A
- Grade B
- Grade C

### Step 4

Platform recommends:

- Reuse
- Refurbish
- Recycle

### Step 5

Digital Battery Passport is generated.

### Step 6

Sustainability metrics are calculated.

---

## ♻️ Sustainability Impact

The platform supports:

- Circular economy adoption
- Battery life extension
- Resource recovery optimization
- Carbon footprint reduction

---

## Future Scope

- SHAP-based explainability
- Real-time battery telemetry ingestion
- Battery chemistry-specific models
- Fleet-scale analytics
- Blockchain-enabled battery passports
- OEM integration APIs

---

## 🔧 Environment Requirements

- Python 3.11+
- Node.js 20+
- npm 10+
- SQLite (included)

Tested on:

- Windows 11
- Python 3.11
- Node.js 20

## 📦 Key Dependencies

Backend:
- FastAPI
- Uvicorn
- SQLAlchemy
- Scikit-learn
- Pandas
- NumPy
- Joblib

Frontend:
- React
- Vite
- Tailwind CSS
- Recharts
- React Router

All dependencies can be installed using:

Backend:
pip install -r requirements.txt

Frontend:
npm install

## 📁 Sample Data

A sample dataset is provided in:

sample_data/sample_battery_data.csv

This file can be used to test the complete workflow.

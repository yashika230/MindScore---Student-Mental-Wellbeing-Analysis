# 🧠 MindScore — Student Mental Wellbeing Predictor

MindScore is an end-to-end machine learning web application that predicts a student's **mental wellbeing score (0–10)** based on lifestyle, study habits, digital behavior, sleep, physical activity, and stress levels.

The project combines a **Scikit-learn machine learning pipeline**, **FastAPI backend**, and a lightweight **HTML/CSS/JavaScript frontend**.

<p align="center">
  <img src="assets/screenshot-hero.png" alt="MindScore prediction interface" width="850">
</p>

---

## 📌 Overview

The goal of MindScore is to explore how student lifestyle and digital habits relate to mental wellbeing and build a regression model capable of predicting a wellbeing score.

The project follows a complete machine learning workflow:

**Data Cleaning → EDA → Feature Engineering → Model Training → Evaluation → API Deployment → Web Interface**

The dataset contains **5,000 student records**, with **4,998 records remaining after removing duplicates**.

---

## 🔎 Dataset

The dataset contains information about:

- **Demographics:** Age, Gender, Country, Academic Level
- **Digital Behavior:** Social media platform, purpose of use, daily usage hours, phone unlocks
- **Lifestyle:** Study hours, physical activity, sleep duration
- **Wellbeing:** Stress level
- **Target:** Mental Health Score

### Preprocessing

- Removed duplicate records
- Handled an invalid negative value in physical activity
- Grouped low-frequency countries into an `"Other"` category
- Applied log transformation to `Study_Hours`
- Standard-scaled numerical features
- Ordinal-encoded `Stress_Level`
- One-hot encoded categorical features

All preprocessing steps are implemented within a **Scikit-learn Pipeline and ColumnTransformer**.

---

## 🤖 Machine Learning

Two regression models were trained and compared:

- Linear Regression
- Random Forest Regressor

Hyperparameter optimization was also performed using **RandomizedSearchCV with 5-fold cross-validation**.

### Model Performance

| Model | Test R² | MAE | RMSE |
|---|---:|---:|---:|
| Linear Regression | 0.743 | 0.534 | 0.678 |
| **Random Forest** | **0.890** | **0.327** | **0.444** |
| Tuned Random Forest | 0.876 | 0.353 | 0.471 |

### Best Model

The **Random Forest Regressor** achieved the best test performance:

- **R²:** 0.890
- **MAE:** 0.327
- **RMSE:** 0.444

The trained model was exported using **Joblib** and integrated into the FastAPI application for prediction.

> **Note:** R² is a regression metric and should not be interpreted as classification accuracy.

---

## 🖥️ Application

The application provides a simple interface where users can enter information about:

- Personal details
- Social media usage
- Study habits
- Sleep
- Physical activity
- Stress level

The frontend sends the input data to the FastAPI backend, which processes the data through the trained ML pipeline and returns the predicted wellbeing score.

<p align="center">
  <img src="assets/screenshot-form.png" alt="MindScore input form" width="750">
</p>

<p align="center">
  <img src="assets/screenshot-result-healthy.png" alt="MindScore prediction result" width="400">
  <img src="assets/screenshot-result-moderate.png" alt="MindScore moderate prediction result" width="400">
</p>

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Programming** | Python |
| **Data Analysis** | Pandas, NumPy |
| **Visualization** | Matplotlib, Seaborn |
| **Machine Learning** | Scikit-learn |
| **Model Persistence** | Joblib |
| **Backend** | FastAPI, Pydantic, Uvicorn |
| **Frontend** | HTML, CSS, JavaScript |

---

## 📁 Project Structure

```text
MindScore---Student-Mental-Wellbeing-Analysis/
│
├── Frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── MindScore.ipynb
├── MindScore_compressed.pkl
├── Student Social Media And Mental Health Impact.csv
├── main.py
├── LICENSE
└── README.md

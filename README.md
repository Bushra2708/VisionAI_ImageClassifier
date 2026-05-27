# VisionAI Classifier

An AI-powered Image Classification Web Application built using Deep Learning, Flask, HTML, CSS, and JavaScript.

The application uses a MobileNetV2 Transfer Learning model trained on the CIFAR-10 dataset to classify uploaded images into multiple categories with confidence analysis.

---

# Features

- Deep Learning Image Classification
- MobileNetV2 Transfer Learning Model
- Flask Backend
- Luxurious Modern UI
- Glassmorphism Design
- Image Upload Preview
- Confidence Score Visualization
- Responsive Design
- Render Deployment Ready
- Real-Time Prediction System

---

# Technologies Used

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Flask
- Flask-CORS

## Deep Learning
- TensorFlow
- Keras
- MobileNetV2
- NumPy

## Deployment
- Render

---

# Dataset Used

CIFAR-10 Dataset

Classes:
- Airplane
- Automobile
- Bird
- Cat
- Deer
- Dog
- Frog
- Horse
- Ship
- Truck

---

# Folder Structure

```bash
VisionAI-Classifier/
│
├── saved_model/
│   └── visionai_mobilenetv2_final.h5
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── script.js
│   │
│   ├── uploads/
│   │
│   └── assets/
│
├── templates/
│   └── index.html
│
├── app.py
├── requirements.txt
├── render.yaml
├── .gitignore
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Bushra2708/VisionAI_ImageClassifier
```

---

## Navigate Into Project

```bash
cd VisionAI-Classifier
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
```

### Mac/Linux

```bash
python3 -m venv venv
```

---

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Run Application

```bash
python app.py
```

Open browser:

```bash
http://127.0.0.1:5000
```

---

# Model Training

The model was trained using:
- MobileNetV2
- Transfer Learning
- TensorFlow/Keras
- CIFAR-10 Dataset

Training was performed in Google Colab using GPU acceleration.

---

# Deployment

This project is deployed on Render.

---

# requirements.txt

```txt
flask
flask-cors
tensorflow-cpu
numpy
pillow
gunicorn
h5py

---

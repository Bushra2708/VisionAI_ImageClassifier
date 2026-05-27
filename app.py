from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

from flask_cors import CORS

import tensorflow as tf

from tensorflow.keras.models import load_model

from tensorflow.keras.preprocessing import image

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

import numpy as np

from PIL import Image

# ==========================================
# FLASK SETUP
# ==========================================

app = Flask(__name__)

CORS(app)

# ==========================================
# LOAD MODEL
# ==========================================

MODEL_PATH = "saved_model/visionai_mobilenetv2_final.h5"

model = load_model(MODEL_PATH)

print("Model Loaded Successfully!")

# ==========================================
# CLASS LABELS
# ==========================================

class_names = [
    'Airplane',
    'Automobile',
    'Bird',
    'Cat',
    'Deer',
    'Dog',
    'Frog',
    'Horse',
    'Ship',
    'Truck'
]

# ==========================================
# HOME PAGE
# ==========================================

@app.route("/")
def home():

    return render_template("index.html")

# ==========================================
# PREDICTION ROUTE
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        if "file" not in request.files:

            return jsonify({
                "error":"No file uploaded"
            })

        file = request.files["file"]

        # ==========================
        # OPEN IMAGE
        # ==========================

        img = Image.open(file).convert("RGB")

        img = img.resize((96,96))

        img_array = image.img_to_array(img)

        img_array = np.expand_dims(img_array, axis=0)

        img_array = preprocess_input(img_array)

        # ==========================
        # MODEL PREDICTION
        # ==========================

        prediction = model.predict(img_array)

        predicted_class = np.argmax(prediction)

        confidence = float(
            np.max(prediction) * 100
        )

        # ==========================
        # RETURN RESULT
        # ==========================

        return jsonify({

            "prediction":
            class_names[predicted_class],

            "confidence":
            round(confidence, 2),

            "all_predictions":{

                class_names[i]:
                round(float(prediction[0][i] * 100),2)

                for i in range(len(class_names))
            }
        })

    except Exception as e:

        return jsonify({
            "error":str(e)
        })

# ==========================================
# RUN APP
# ==========================================

if __name__ == "__main__":

    app.run(debug=True)
    
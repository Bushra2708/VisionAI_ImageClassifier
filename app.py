from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

from flask_cors import CORS

import numpy as np

from PIL import Image

# Import TFLite interpreter with fallbacks to avoid full TensorFlow on Render
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    try:
        import tensorflow.lite as tflite
    except ImportError:
        import tensorflow as tf
        tflite = tf.lite

# ==========================================
# FLASK SETUP
# ==========================================

app = Flask(__name__)

CORS(app)

# ==========================================
# LOAD MODEL (TFLite)
# ==========================================

MODEL_PATH = "saved_model/visionai_mobilenetv2_final.tflite"

interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("TFLite Model Loaded Successfully!")

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

        # Convert to numpy array and preprocess for MobileNetV2: scale to [-1, 1]
        img_array = np.array(img, dtype=np.float32)
        img_array = (img_array / 127.5) - 1.0
        img_array = np.expand_dims(img_array, axis=0)

        # ==========================
        # MODEL PREDICTION (TFLite Inference)
        # ==========================

        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        prediction = interpreter.get_tensor(output_details[0]['index'])

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

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
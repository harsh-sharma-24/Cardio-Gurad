import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your Random Forest model
model = joblib.load(r'C:/Users/hs298/Desktop/HAP/heart-risk-app/backend/V4.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Incoming request data:", data)  # Debugging line

        # Check if all necessary fields are present
        required_fields = [
            'Age', 'Cholesterol', 'Heart_Rate', 'Diabetes', 
            'Family_History', 'Smoking', 'Obesity', 'Alcohol_Consumption',
            'Exercise_Hours_Per_Week', 'Previous_Heart_Problems', 
            'Stress_Level', 'Sedentary_Hours_Per_Day', 'BMI', 
            'Triglycerides', 'Physical_Activity_Days_Per_Week', 
            'Sleep_Hours_Per_Day'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise ValueError(f"Missing fields: {missing_fields}")

        # Convert input data to model's feature format
        features = [
            float(data['Age']),
            float(data['Cholesterol']),
            float(data['Heart_Rate']),
            int(data['Diabetes'] == 'Yes'),
            int(data['Family_History'] == 'Yes'),
            int(data['Smoking'] == 'Yes'),
            int(data['Obesity'] == 'Yes'),
            int(data['Alcohol_Consumption'] == 'Yes'),
            float(data['Exercise_Hours_Per_Week']),
            int(data['Previous_Heart_Problems'] == 'Yes'),
            float(data['Stress_Level']),
            float(data['Sedentary_Hours_Per_Day']),
            float(data['BMI']),
            float(data['Triglycerides']),
            float(data['Physical_Activity_Days_Per_Week']),
            float(data['Sleep_Hours_Per_Day'])
        ]

        print("Features for model:", features)  # Debugging line
        
        # Get probability prediction and apply threshold
        prediction_prob = model.predict_proba([features])[0][1]
        risk_threshold = 0.5  # Adjust this threshold based on your model's optimal value
        risk = 'High' if prediction_prob >= risk_threshold else 'Low'

        return jsonify({
            'risk': risk,
            'probability': float(prediction_prob),
            'message': 'Risk classification completed'
        })

    except Exception as e:
        print("Error:", traceback.format_exc())  # Detailed error in console
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
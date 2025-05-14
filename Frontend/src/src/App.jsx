import React, { useState } from 'react';
import './App.css';

const labels = {
  Age: "Age",
  Cholesterol: "Cholesterol",
  Heart_Rate: "Heart Rate (bpm)",
  Diabetes: "Do you have diabetes?",
  Family_History: "Family history of heart disease?",
  Smoking: "Do you smoke?",
  Obesity: "Are you obese?",
  Alcohol_Consumption: "Do you consume alcohol?",
  Exercise_Hours_Per_Week: "Exercise Hours/Week",
  Previous_Heart_Problems: "Previous heart problems?",
  Stress_Level: "Stress Level (0-10)",
  Sedentary_Hours_Per_Day: "Sedentary Hours/Day",
  BMI: "BMI",
  Triglycerides: "Triglycerides",
  Physical_Activity_Days_Per_Week: "Active Days/Week",
  Sleep_Hours_Per_Day: "Sleep Hours/Day"
};

const yesNoFields = [
  "Diabetes", "Family_History", "Smoking", "Obesity", 
  "Alcohol_Consumption", "Previous_Heart_Problems"
];

const selectFields = {
  ...yesNoFields.reduce((acc, field) => ({ 
    ...acc, 
    [field]: ["Yes", "No"] 
  }), {})
};

const rangeFields = ["Stress_Level"];

function App() {
  const [formData, setFormData] = useState({
    Age: '',
    Cholesterol: '',
    Heart_Rate: '',
    Diabetes: 'No',
    Family_History: 'No',
    Smoking: 'No',
    Obesity: 'No',
    Alcohol_Consumption: 'No',
    Exercise_Hours_Per_Week: '',
    Previous_Heart_Problems: 'No',
    Stress_Level: '5',
    Sedentary_Hours_Per_Day: '',
    BMI: '',
    Triglycerides: '',
    Physical_Activity_Days_Per_Week: '',
    Sleep_Hours_Per_Day: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message || 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>❤️ Heart Attack Risk Assessment</h1>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div className="input-group" key={key}>
              <label>{labels[key]}</label>

              {selectFields[key] ? (
                <select name={key} value={formData[key]} onChange={handleChange} required>
                  {selectFields[key].map(option => (
                    <option value={option} key={option}>{option}</option>
                  ))}
                </select>
              ) : rangeFields.includes(key) ? (
                <>
                  <input
                    type="range"
                    name={key}
                    min="0"
                    max="10"
                    value={formData[key]}
                    onChange={handleChange}
                  />
                  <span>{formData[key]}</span>
                </>
              ) : (
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  step={key === 'BMI' ? '0.1' : '1'}
                />
              )}
            </div>
          ))}
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Calculate Risk'}
          </button>
        </form>

        {result && (
          <div className={`result ${result.error ? 'error' : result.risk === 'High' ? 'high-risk' : 'low-risk'}`}>
            {result.error ? (
              `⚠️ ${result.error}`
            ) : (
              <>
                <h2>Result: {result.risk} Risk</h2>
                <p>Probability: {(result.probability * 100).toFixed(1)}%</p>
                <p>{result.message}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
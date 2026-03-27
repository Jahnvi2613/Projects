from flask import Flask, request, jsonify, render_template
import joblib
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Load the trained model
try:
    model = joblib.load('spam_classifier.pkl')
except FileNotFoundError:
    print("Error: Model not found.")
    exit()

# Database Setup
def init_db():
    conn = sqlite3.connect('scans.db')
    cursor = conn.cursor()
    # Create a table for our logs if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_snippet TEXT,
            is_spam BOOLEAN,
            confidence REAL,
            timestamp DATETIME
        )
    ''')
    conn.commit()
    conn.close()

# Initialize the database when the app starts
init_db()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    email_text = data.get('text', '')

    if not email_text.strip():
        return jsonify({'error': 'Please enter some text.'}), 400

    # Predictions
    prediction = model.predict([email_text])[0]
    probabilities = model.predict_proba([email_text])[0]
    confidence = probabilities[prediction] * 100
    is_spam = bool(prediction == 1)

    # Save to SQL Database
    snippet = email_text[:50] + "..." if len(email_text) > 50 else email_text
    conn = sqlite3.connect('scans.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO scan_history (email_snippet, is_spam, confidence, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (snippet, is_spam, round(confidence, 2), datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()

    return jsonify({
        'is_spam': is_spam,
        'confidence': round(confidence, 2)
    })

@app.route('/history', methods=['GET'])
def get_history():
    # Fetch the 5 most recent scans from the database
    conn = sqlite3.connect('scans.db')
    cursor = conn.cursor()
    cursor.execute('SELECT email_snippet, is_spam, confidence, timestamp FROM scan_history ORDER BY id DESC LIMIT 5')
    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            'snippet': row[0],
            'is_spam': bool(row[1]),
            'confidence': row[2],
            'timestamp': row[3]
        })
    
    return jsonify(history)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
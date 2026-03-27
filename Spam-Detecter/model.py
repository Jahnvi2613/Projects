import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# 1. Load your actual dataset
print("Loading dataset 'emails.csv'...")
try:
    df = pd.read_csv('emails.csv')
except FileNotFoundError:
    print("Error: 'emails.csv' not found. Please ensure the file is in the same directory.")
    exit()

# 2. Clean the data (Drop any missing values)
df = df.dropna(subset=['text', 'spam'])

# --- NEW: Inject custom data to make it smarter against modern spam ---
custom_spam = pd.DataFrame({
    'text': [
        "Congratulations! You've won a free ticket!",
        "WINNER! Claim your free prize money now.",
        "URGENT: You have been selected for a free $1000 gift card.",
        "Click here to claim your free lottery ticket.",
        "Congratulations, you are our lucky winner today!",
        "Claim your free iPhone now! Click the link below.",
        "You have been selected for an exclusive reward. Claim now!"
    ],
    'spam': [1, 1, 1, 1, 1, 1, 1]
})

# Combine your dataset with our custom examples
df = pd.concat([df, custom_spam], ignore_index=True)
# ---------------------------------------------------------------------

# 3. Extract features and labels
X = df['text']
y = df['spam']

# 4. Split data into Training and Testing sets (80% train, 20% test)
print("Splitting data into training and testing sets...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Create an UPGRADED pipeline: Vectorizer -> Classifier
print("Building the upgraded model pipeline...")
model = make_pipeline(
    # ngram_range=(1,2) tells it to learn 2-word phrases like "free ticket"
    # min_df=1 ensures it doesn't ignore words that only appear a few times
    TfidfVectorizer(stop_words='english', max_df=0.95, min_df=1, ngram_range=(1, 2)), 
    
    # alpha=0.1 makes the model more sensitive to our newly injected keywords
    MultinomialNB(alpha=0.1) 
)

# 6. Train the model
print("Training the model... (This might take a few seconds)")
model.fit(X_train, y_train)

# 7. Evaluate the model to see how well it learned
print("\n--- Evaluating Model ---")
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Safe (0)', 'Spam (1)']))

# 8. Save the trained model to disk
joblib.dump(model, 'spam_classifier.pkl')
print("\nModel saved successfully as 'spam_classifier.pkl'. Ready for the Flask backend!")
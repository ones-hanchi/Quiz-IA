
from flask import Flask, jsonify, request
from flask_cors import CORS

from services import generate_quiz

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Quiz AI Backend is running!"
    })


@app.route("/api/generate-quiz", methods=["POST"])
def create_quiz():

    data = request.get_json(silent=True) or {}

    topic = data.get("topic", "").strip()
    number = data.get("number_of_questions", 5)
    difficulty = data.get("difficulty", "Medium")
    language = data.get("language", "English")

    allowed_difficulties = ["Easy", "Medium", "Hard"]
    allowed_languages = ["English", "French", "Arabic"]

    if not topic:
        return jsonify({"error": "Please enter a topic"}), 400

    if not isinstance(number, int) or not 1 <= number <= 20:
        return jsonify({"error": "Choose between 1 and 20 questions"}), 400

    if difficulty not in allowed_difficulties:
        return jsonify({"error": "Invalid difficulty"}), 400

    if language not in allowed_languages:
        return jsonify({"error": "Invalid language"}), 400

    try:
        quiz = generate_quiz(topic, number, difficulty, language)
        return jsonify(quiz)

    except Exception as error:
        print("Quiz generation error:", error)
        return jsonify({"error": "Quiz generation failed. Please try again."}), 500


if __name__ == "__main__":
    app.run(debug=True)

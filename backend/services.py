
import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)


def generate_quiz(topic, number_of_questions, difficulty, language):

    prompt = f"""
    Create a multiple-choice quiz.

    Topic: {topic}
    Number of questions: {number_of_questions}
    Difficulty: {difficulty}
    Language: {language}

    Requirements:
    - Generate exactly {number_of_questions} questions.
    - Write all questions and answers in the requested language.
    - Each question must have exactly 4 different options.
    - Only one option must be correct.
    - Provide a clear explanation of the correct answer.
    - Match the requested difficulty.

    Return ONLY valid JSON using this structure:

    {{
        "questions": [
            {{
                "question": "Question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Correct option",
                "explanation": "Explanation of the correct answer"
            }}
        ]
    }}
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config={
            "response_mime_type": "application/json"
        }
    )

    return json.loads(response.text)

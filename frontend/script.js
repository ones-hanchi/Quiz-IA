
const setup = document.getElementById("setup");
const topicInput = document.getElementById("topic");
const questionCount = document.getElementById("question-count");
const difficultySelect = document.getElementById("difficulty");
const languageSelect = document.getElementById("language");

const generateButton = document.getElementById("generate-btn");
const loading = document.getElementById("loading");
const errorElement = document.getElementById("error");

const quiz = document.getElementById("quiz");
const result = document.getElementById("result");

const questionNumber = document.getElementById("question-number");
const scoreElement = document.getElementById("score");
const questionElement = document.getElementById("question");
const answersContainer = document.getElementById("answers");

const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");

const explanationBox = document.getElementById("explanation");
const explanationText = document.getElementById("explanation-text");

const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");

const finalScore = document.getElementById("final-score");
const resultMessage = document.getElementById("result-message");


let questions = [];
let currentQuestionIndex = 0;
let score = 0;

let timerInterval = null;
let timeLeft = 20;
let answered = false;


async function generateQuiz() {

  const topic = topicInput.value.trim();
  const number = Number(questionCount.value);
  const difficulty = difficultySelect.value;
  const language = languageSelect.value;

  if (!topic) {
    errorElement.textContent = "Please enter a topic!";
    errorElement.classList.remove("hidden");
    topicInput.focus();
    return;
  }

  errorElement.classList.add("hidden");
  loading.classList.remove("hidden");
  generateButton.disabled = true;

  try {

    const response = await fetch(
      "http://127.0.0.1:5000/api/generate-quiz",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic,
          number_of_questions: number,
          difficulty: difficulty,
          language: language
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Quiz generation failed.");
    }

    if (!Array.isArray(data.questions) ||
        data.questions.length !== number) {
      throw new Error("The AI returned an unexpected number of questions.");
    }

    questions = data.questions.map(item => {

      if (!Array.isArray(item.options)) {
        throw new Error("Invalid question format.");
      }

      return {
        question: item.question,
        answers: item.options,
        correctAnswer: item.options.indexOf(item.answer),
        explanation: item.explanation || "No explanation available."
      };

    });

    const invalidQuestion = questions.some(q =>
      !q.question ||
      q.answers.length !== 4 ||
      q.correctAnswer === -1
    );

    if (invalidQuestion) {
      throw new Error("Some questions are incomplete. Please try again.");
    }

    currentQuestionIndex = 0;
    score = 0;

    setup.classList.add("hidden");
    result.classList.add("hidden");
    quiz.classList.remove("hidden");

    showQuestion();

  } catch (error) {

    errorElement.textContent = error.message;
    errorElement.classList.remove("hidden");

  } finally {

    loading.classList.add("hidden");
    generateButton.disabled = false;

  }
}



function showQuestion() {

  clearInterval(timerInterval);

  const currentQuestion = questions[currentQuestionIndex];

  answered = false;

  questionNumber.textContent =
    `Question ${currentQuestionIndex + 1} / ${questions.length}`;

  scoreElement.textContent = `Score: ${score}`;

  questionElement.textContent = currentQuestion.question;

  progressBar.style.width =
    `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

  answersContainer.innerHTML = "";

  explanationBox.classList.add("hidden");

  nextButton.disabled = true;

  nextButton.textContent =
    currentQuestionIndex === questions.length - 1
      ? "See My Result →"
      : "Next Question →";

  currentQuestion.answers.forEach((answer, index) => {

    const button = document.createElement("button");

    button.textContent = answer;
    button.classList.add("answer-btn");
    button.type = "button";

    button.addEventListener("click", () => {
      checkAnswer(index);
    });

    answersContainer.appendChild(button);

  });

  startTimer();
}



function startTimer() {

  timeLeft = 20;
  updateTimer();

  timerInterval = setInterval(() => {

    timeLeft--;

    updateTimer();

    if (timeLeft <= 0) {

      clearInterval(timerInterval);

      if (!answered) {
        checkAnswer(null);
      }

    }

  }, 1000);

}


function updateTimer() {

  timerElement.textContent = `${timeLeft}s`;

  if (timeLeft <= 5) {
    timerElement.classList.add("warning");
  } else {
    timerElement.classList.remove("warning");
  }

}




function checkAnswer(selectedIndex) {

  if (answered) return;

  answered = true;

  clearInterval(timerInterval);

  const currentQuestion = questions[currentQuestionIndex];

  const answerButtons =
    answersContainer.querySelectorAll(".answer-btn");

  answerButtons.forEach(button => {
    button.disabled = true;
  });

  const correctIndex = currentQuestion.correctAnswer;

  if (selectedIndex === correctIndex) {

    score++;

  } else if (selectedIndex !== null) {

    answerButtons[selectedIndex].classList.add("wrong");

  }

  answerButtons[correctIndex].classList.add("correct");

  scoreElement.textContent = `Score: ${score}`;

  explanationText.textContent = currentQuestion.explanation;
  explanationBox.classList.remove("hidden");

  if (selectedIndex === null) {
    timerElement.textContent = "Time up!";
  }

  nextButton.disabled = false;

}



nextButton.addEventListener("click", () => {

  if (!answered) return;

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {

    showQuestion();

  } else {

    showResult();

  }

});




function showResult() {

  clearInterval(timerInterval);

  quiz.classList.add("hidden");
  result.classList.remove("hidden");

  finalScore.textContent =
    `${score} / ${questions.length}`;

  const percentage = (score / questions.length) * 100;

  if (percentage === 100) {
    resultMessage.textContent = "Perfect score! Excellent work!";
  } else if (percentage >= 70) {
    resultMessage.textContent = "Great job! You know this topic well!";
  } else if (percentage >= 50) {
    resultMessage.textContent = "Good effort! Keep practicing!";
  } else {
    resultMessage.textContent = "Keep learning. You can do better!";
  }

}



generateButton.addEventListener("click", generateQuiz);

topicInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    generateQuiz();
  }
});

restartButton.addEventListener("click", () => {

  clearInterval(timerInterval);

  questions = [];
  currentQuestionIndex = 0;
  score = 0;

  topicInput.value = "";

  result.classList.add("hidden");
  quiz.classList.add("hidden");
  setup.classList.remove("hidden");

  errorElement.classList.add("hidden");

  topicInput.focus();

});

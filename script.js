const firstNumberEl = document.getElementById("first-number");
const secondNumberEl = document.getElementById("second-number");
const form = document.getElementById("sum-form");
const answerInput = document.getElementById("answer");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-question");
const correctCountEl = document.getElementById("correct-count");
const incorrectCountEl = document.getElementById("incorrect-count");

let firstNumber = 0;
let secondNumber = 0;
let solved = false;
let correctCount = 0;
let incorrectCount = 0;

function renderScores() {
  correctCountEl.textContent = String(correctCount);
  incorrectCountEl.textContent = String(incorrectCount);
}

function randomNumber() {
  return Math.floor(Math.random() * 10) + 1;
}

function newQuestion() {
  firstNumber = randomNumber();
  secondNumber = randomNumber();
  solved = false;

  firstNumberEl.textContent = String(firstNumber);
  secondNumberEl.textContent = String(secondNumber);
  answerInput.value = "";
  answerInput.disabled = false;
  form.querySelector("button[type='submit']").disabled = false;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextButton.hidden = true;
  answerInput.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (solved) {
    return;
  }

  const given = Number(answerInput.value);
  const expected = firstNumber + secondNumber;

  if (answerInput.value.trim() === "" || Number.isNaN(given)) {
    feedback.textContent = "Enter a number, then try again.";
    feedback.className = "feedback incorrect";
    answerInput.focus();
    return;
  }

  if (given === expected) {
    solved = true;
    correctCount += 1;
    renderScores();
    feedback.textContent = "Correct!";
    feedback.className = "feedback correct";
    answerInput.disabled = true;
    form.querySelector("button[type='submit']").disabled = true;
    nextButton.hidden = false;
    nextButton.focus();
    return;
  }

  incorrectCount += 1;
  renderScores();
  feedback.textContent = "That answer is not correct. Please retry.";
  feedback.className = "feedback incorrect";
  answerInput.focus();
  answerInput.select();
});

nextButton.addEventListener("click", newQuestion);

renderScores();
newQuestion();

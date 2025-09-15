import * as ui from './ui.js';

// State
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let flaggedQuestions = new Set();
let timerInterval;
const EXAM_DURATION = 180 * 60; // 3 hours in seconds
const TOTAL_QUESTIONS = 100;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let allQuestions = await response.json();
        shuffleArray(allQuestions);
        questions = allQuestions.slice(0, TOTAL_QUESTIONS);
    } catch (error) {
        console.error("Could not load questions:", error);
        ui.showError("Failed to load exam questions. Please try refreshing the page.");
    }
}

export async function init() {
    await loadQuestions();
}

export function startExam() {
    if (questions.length === 0) {
        ui.showError("No questions loaded. Cannot start the exam.");
        return;
    }
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions.clear();

    ui.showScreen('exam-screen');
    ui.createProgressBar(questions.length);
    showQuestion(currentQuestionIndex);
    startTimer();
}

function showQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    currentQuestionIndex = index;
    const question = questions[index];

    ui.renderQuestion(question, userAnswers[index], index + 1, questions.length);
    ui.updateProgressBar(questions.length, userAnswers, flaggedQuestions, currentQuestionIndex);
    ui.updateFlagButton(flaggedQuestions.has(currentQuestionIndex));

    ui.prevBtn.disabled = index === 0;
    ui.nextBtn.disabled = index === questions.length - 1;
}

export function selectAnswer(index, answer) {
    userAnswers[index] = answer;
    ui.updateProgressBar(questions.length, userAnswers, flaggedQuestions, currentQuestionIndex);
}

export function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

export function prevQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

export function goToQuestion(index) {
    showQuestion(index);
}

export function toggleFlag() {
    if (flaggedQuestions.has(currentQuestionIndex)) {
        flaggedQuestions.delete(currentQuestionIndex);
    } else {
        flaggedQuestions.add(currentQuestionIndex);
    }
    ui.updateFlagButton(flaggedQuestions.has(currentQuestionIndex));
    ui.updateProgressBar(questions.length, userAnswers, flaggedQuestions, currentQuestionIndex);
}

function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = EXAM_DURATION;
    ui.updateTimerDisplay(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        ui.updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

export function handleSubmitAttempt() {
    if (flaggedQuestions.size > 0) {
        const sortedFlagged = [...flaggedQuestions].sort((a, b) => a - b);
        const flaggedDetails = sortedFlagged.map(index => ({
            index,
            text: questions[index].question
        }));
        ui.showFlaggedQuestionsModal(flaggedDetails);
    } else {
        const unansweredCount = questions.length - Object.keys(userAnswers).length;
        if (unansweredCount > 0) {
            if (!confirm(`You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`)) {
                return;
            }
        } else if (!confirm('Are you sure you want to submit the exam?')) {
            return;
        }
        submitExam();
    }
}

export function submitExam() {
    clearInterval(timerInterval);
    ui.showScreen('results-screen');
    calculateResults();
}

function calculateResults() {
    let correctAnswers = 0;
    const results = questions.map((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        if (isCorrect) {
            correctAnswers++;
        }
        return {
            question: question.question,
            userAnswer: userAnswer || 'Not answered',
            correctAnswer: question.answer,
            isCorrect
        };
    });

    const percentage = Math.round((correctAnswers / questions.length) * 100);
    ui.renderResults(percentage, correctAnswers, questions.length, results);
}

export function restartExam() {
    clearInterval(timerInterval);
    ui.showScreen('start-screen');
}
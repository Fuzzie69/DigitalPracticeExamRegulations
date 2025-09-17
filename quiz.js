import * as ui from './ui.js';

// State
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let flaggedQuestions = new Set();
let timerInterval;
const EXAM_DURATION = 180 * 60; // 3 hours in seconds
const TOTAL_QUESTIONS = 100;
const STORAGE_KEY = 'regs_exam_start_time';

function seededRandom(seed) {
    // Mulberry32 PRNG
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function shuffleArray(array, seed = null) {
    // Fisher-Yates shuffle, optionally seeded
    let random = Math.random;
    if (seed !== null) {
        random = () => seededRandom(seed++);
    }
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
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
        // Use a random seed based on current time and Math.random to maximize randomness
        const now = Date.now();
        const extra = Math.floor(Math.random() * 1000000);
        const seed = now ^ extra;
        shuffleArray(allQuestions, seed);
        questions = allQuestions.slice(0, TOTAL_QUESTIONS);
    } catch (error) {
        console.error("Could not load questions:", error);
        ui.showError("Failed to load exam questions. Please try refreshing the page.");
    }
}

export async function init() {
    await loadQuestions();
    // If exam in progress, restore timer and state
    const startTime = localStorage.getItem(STORAGE_KEY);
    if (startTime) {
        // Optionally, you could restore more state here
        // For now, just keep the timer persistent
    }
}

export function startExam() {
    if (questions.length === 0) {
        ui.showError("No questions loaded. Cannot start the exam.");
        return;
    }
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions.clear();

    // Store the start time in localStorage
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());

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

function getTimeLeft() {
    const startTime = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (!startTime) return EXAM_DURATION;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(EXAM_DURATION - elapsed, 0);
}

function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = getTimeLeft();
    ui.updateTimerDisplay(timeLeft);

    timerInterval = setInterval(() => {
        timeLeft = getTimeLeft();
        ui.updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Directly submit the exam, ignoring flagged/incomplete questions
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
    localStorage.removeItem(STORAGE_KEY); // Clear timer persistence
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
            isCorrect,
            reference: question.reference // Pass reference to UI
        };
    });

    const percentage = Math.round((correctAnswers / questions.length) * 100);
    ui.renderResults(percentage, correctAnswers, questions.length, results);
}

export function restartExam() {
    clearInterval(timerInterval);
    localStorage.removeItem(STORAGE_KEY); // Clear timer persistence
    ui.showScreen('start-screen');
}
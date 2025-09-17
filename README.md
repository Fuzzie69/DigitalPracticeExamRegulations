# Electrician Level 4 Regulations Practice Exam

This project is a web-based practice exam tool for the Electrician Level 4 Regulations exam (NZ/AU context). It is designed to simulate the real exam experience, including timing, question navigation, flagging for review, and instant results with references.

## Features

- **100 Randomized Questions:** Each exam session presents 100 questions randomly selected and shuffled from a large pool, ensuring a unique experience every time.
- **Persistent Timer:** The exam timer (3 hours) persists even if the browser is refreshed, the window is minimized, or the computer is locked. The timer is stored in localStorage and resumes accurately.
- **Auto-Submit on Timeout:** If the timer reaches zero, the exam is automatically submitted, regardless of flagged or unanswered questions.
- **Flag for Review:** You can flag questions to review them before submitting the exam.
- **Progress Bar:** Visual progress bar shows answered, flagged, and current questions. Click any box to jump to that question.
- **Navigation:** Easily move between questions using Next/Previous buttons or the progress bar.
- **Open Book:** The exam is designed for open-book practice.
- **Results with References:** After submission, you receive your score, a breakdown of correct/incorrect answers, and the reference for each question (e.g., AS/NZS 3000 clause, ESR regulation).
- **Responsive Design:** Works well on desktop and mobile devices.
- **Accessible UI:** Clear, readable interface with keyboard navigation support.

## Usage

1. **Open `index.html`** in your browser.
2. Click **Start Exam** to begin.
3. Answer questions, flag any you wish to review, and navigate as needed.
4. When finished (or when time expires), submit the exam to see your results and references.
5. Click **Try Again** to start a new randomized exam.

## File Structure

- `index.html` - Main entry point for the app.
- `style.css` - Styles for the app.
- `main.js` - Entry point JavaScript, sets up event listeners.
- `quiz.js` - Core logic for question selection, timer, navigation, and scoring.
- `ui.js` - Handles all DOM updates and UI rendering.
- `questions.json` - Pool of exam questions (with answers and references).
- `README.md` - This file.

## Technical Notes

- **Randomization:** Uses a seeded shuffle to maximize randomness and minimize repeated question sets.
- **Timer Persistence:** Uses `localStorage` to store the exam start time, so the timer is accurate even after page reloads or browser restarts.
- **No Server Required:** All logic runs client-side; just open `index.html` in your browser.
- **References:** Each question includes a reference to the relevant regulation or standard for further study.

## Customization

- To add or edit questions, modify `questions.json`. Each question should include a `question`, `options`, `answer`, and `reference`.
- To change the exam duration or number of questions, edit the constants in `quiz.js`.

## Version

- v1.01

---

**This project is intended for educational and exam preparation purposes only. Always refer to the latest official standards and regulations for authoritative information.**

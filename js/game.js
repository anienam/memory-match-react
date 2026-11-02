/* ========================================
   MEMORY MATCH
   Interactive Game System
   ======================================== */

/* ========================================
   DOM ELEMENTS
   ======================================== */

const cardBoard = document.getElementById("card-board");

const scoreDisplay = document.getElementById("score");

const levelDisplay = document.getElementById("level");

const attemptsDisplay = document.getElementById("attempts");

const timerDisplay = document.getElementById("timer");

const highScoreDisplay = document.getElementById("high-score");

const progressText = document.getElementById("progress-text");

const progressBar = document.getElementById("progress-bar");

const progressFill = document.getElementById("progress-fill");

const restartButton = document.getElementById("restart-game");

const difficultyButtons = document.querySelectorAll(".difficulty-button");

const gameModal = document.getElementById("game-modal");

const modalIcon = document.getElementById("modal-icon");

const modalTitle = document.getElementById("modal-title");

const modalMessage = document.getElementById("modal-message");

const finalScoreDisplay = document.getElementById("final-score");

const nextLevelButton = document.getElementById("next-level");

const playAgainButton = document.getElementById("play-again");

/* ========================================
   GAME DATA
   ======================================== */

const symbols = [
  "🍎",
  "🚀",
  "🐱",
  "🌟",
  "🎵",
  "⚽",
  "🦋",
  "🌈",
  "🍕",
  "🎮",
  "🐼",
  "🌻",
];

/* ========================================
   DIFFICULTY SETTINGS
   ======================================== */

const difficultySettings = {
  easy: {
    pairs: 6,
    time: 90,
  },

  medium: {
    pairs: 8,
    time: 120,
  },

  hard: {
    pairs: 12,
    time: 180,
  },
};

/* ========================================
   GAME STATE
   ======================================== */

let difficulty = "easy";

let level = 1;

let score = 0;

let attempts = 0;

let matchedPairs = 0;

let cards = [];

let flippedCards = [];

let lockBoard = false;

let timer = null;

let timeRemaining = 90;

let gameActive = false;

/* ========================================
   HIGH SCORE
   ======================================== */

let highScore = Number(localStorage.getItem("memoryMatchHighScore")) || 0;

highScoreDisplay.textContent = highScore;

/* ========================================
   INITIALIZE GAME
   ======================================== */

function initializeGame() {
  resetGameState();

  createCards();

  renderCards();

  startTimer();

  updateUI();
}

initializeGame();

/* ========================================
   RESET GAME STATE
   ======================================== */

function resetGameState() {
  clearInterval(timer);

  score = 0;

  attempts = 0;

  matchedPairs = 0;

  flippedCards = [];

  lockBoard = false;

  gameActive = true;

  timeRemaining = difficultySettings[difficulty].time;
}

/* ========================================
   CREATE CARD DATA
   ======================================== */

function createCards() {
  const pairCount = difficultySettings[difficulty].pairs;

  const selectedSymbols = symbols.slice(0, pairCount);

  cards = [...selectedSymbols, ...selectedSymbols];

  shuffle(cards);
}

/* ========================================
   SHUFFLE
   ======================================== */

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
}

/* ========================================
   RENDER CARDS
   ======================================== */

function renderCards() {
  cardBoard.innerHTML = "";

  const pairCount = difficultySettings[difficulty].pairs;

  cardBoard.className = `card-board ${difficulty}-board`;

  cards.forEach((symbol, index) => {
    const card = document.createElement("button");

    card.type = "button";

    card.className = "memory-card";

    card.dataset.index = index;

    card.dataset.symbol = symbol;

    card.setAttribute("aria-label", "Hidden memory card");

    card.innerHTML = `

        <span class="card-inner">

          <span
            class="card-face card-back"
            aria-hidden="true"
          >
            ?
          </span>

          <span
            class="card-face card-front"
            aria-hidden="true"
          >
            ${symbol}
          </span>

        </span>

      `;

    card.addEventListener("click", handleCardClick);

    cardBoard.appendChild(card);
  });

  progressText.textContent = `0 / ${pairCount} pairs`;
}

/* ========================================
   CARD CLICK
   ======================================== */

function handleCardClick(event) {
  const card = event.currentTarget;

  if (
    lockBoard ||
    !gameActive ||
    card.classList.contains("flipped") ||
    card.classList.contains("matched")
  ) {
    return;
  }

  flipCard(card);

  flippedCards.push(card);

  if (flippedCards.length === 2) {
    attempts++;

    attemptsDisplay.textContent = attempts;

    checkForMatch();
  }
}

/* ========================================
   FLIP CARD
   ======================================== */

function flipCard(card) {
  card.classList.add("flipped");

  card.setAttribute("aria-label", `Card showing ${card.dataset.symbol}`);
}

/* ========================================
   CHECK MATCH
   ======================================== */

function checkForMatch() {
  lockBoard = true;

  const [firstCard, secondCard] = flippedCards;

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    handleMatch(firstCard, secondCard);
  } else {
    handleMismatch(firstCard, secondCard);
  }
}

/* ========================================
   MATCH
   ======================================== */

function handleMatch(firstCard, secondCard) {
  firstCard.classList.add("matched");

  secondCard.classList.add("matched");

  matchedPairs++;

  /*
   * Reward matching pairs.
   */

  score += 100 + Math.max(0, timeRemaining);

  updateHighScore();

  updateUI();

  flippedCards = [];

  lockBoard = false;

  const totalPairs = difficultySettings[difficulty].pairs;

  if (matchedPairs === totalPairs) {
    levelComplete();
  }
}

/* ========================================
   MISMATCH
   ======================================== */

function handleMismatch(firstCard, secondCard) {
  /*
   * Give the player a short delay
   * to remember the two cards.
   */

  setTimeout(() => {
    firstCard.classList.remove("flipped");

    secondCard.classList.remove("flipped");

    firstCard.setAttribute("aria-label", "Hidden memory card");

    secondCard.setAttribute("aria-label", "Hidden memory card");

    flippedCards = [];

    lockBoard = false;
  }, 750);
}

/* ========================================
   TIMER
   ======================================== */

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    if (!gameActive) {
      return;
    }

    timeRemaining--;

    updateUI();

    if (timeRemaining <= 0) {
      timeUp();
    }
  }, 1000);
}

/* ========================================
   TIME UP
   ======================================== */

function timeUp() {
  clearInterval(timer);

  gameActive = false;

  lockBoard = true;

  showGameOverModal(
    "Time's Up!",
    "The timer reached zero. Try again and beat your score.",
    "⏱️",
  );
}

/* ========================================
   LEVEL COMPLETE
   ======================================== */

function levelComplete() {
  clearInterval(timer);

  gameActive = false;

  /*
   * Level completion bonus.
   */

  score += timeRemaining * 10;

  updateHighScore();

  updateUI();

  modalIcon.textContent = "🎉";

  modalTitle.textContent = `Level ${level} Complete!`;

  modalMessage.textContent = "Excellent memory! Ready for the next challenge?";

  finalScoreDisplay.textContent = score;

  nextLevelButton.hidden = false;

  gameModal.hidden = false;
}

/* ========================================
   NEXT LEVEL
   ======================================== */

function nextLevel() {
  level++;

  /*
   * Progressively increase
   * difficulty.
   */

  if (level === 2 && difficulty === "easy") {
    difficulty = "medium";
  }

  if (level >= 3) {
    difficulty = "hard";
  }

  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === difficulty);
  });

  closeModal();

  resetGameState();

  createCards();

  renderCards();

  startTimer();

  updateUI();
}

/* ========================================
   GAME OVER
   ======================================== */

function showGameOverModal(title, message, icon) {
  modalIcon.textContent = icon;

  modalTitle.textContent = title;

  modalMessage.textContent = message;

  finalScoreDisplay.textContent = score;

  nextLevelButton.hidden = true;

  gameModal.hidden = false;
}

/* ========================================
   PLAY AGAIN
   ======================================== */

function playAgain() {
  level = 1;

  difficulty = "easy";

  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === "easy");
  });

  closeModal();

  initializeGame();
}

/* ========================================
   RESTART
   ======================================== */

function restartGame() {
  closeModal();

  initializeGame();
}

/* ========================================
   CLOSE MODAL
   ======================================== */

function closeModal() {
  gameModal.hidden = true;
}

/* ========================================
   UPDATE UI
   ======================================== */

function updateUI() {
  scoreDisplay.textContent = score;

  levelDisplay.textContent = level;

  attemptsDisplay.textContent = attempts;

  timerDisplay.textContent = formatTime(timeRemaining);

  highScoreDisplay.textContent = highScore;

  const totalPairs = difficultySettings[difficulty].pairs;

  progressText.textContent = `${matchedPairs} / ${totalPairs} pairs`;

  const progress = (matchedPairs / totalPairs) * 100;

  progressFill.style.width = `${progress}%`;

  progressBar.setAttribute("aria-valuenow", progress.toFixed(0));
}

/* ========================================
   FORMAT TIMER
   ======================================== */

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

/* ========================================
   HIGH SCORE
   ======================================== */

function updateHighScore() {
  if (score <= highScore) {
    return;
  }

  highScore = score;

  localStorage.setItem("memoryMatchHighScore", String(highScore));

  highScoreDisplay.textContent = highScore;
}

/* ========================================
   DIFFICULTY
   ======================================== */

function changeDifficulty(selectedDifficulty) {
  if (!difficultySettings[selectedDifficulty]) {
    return;
  }

  difficulty = selectedDifficulty;

  level = 1;

  difficultyButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.difficulty === selectedDifficulty,
    );
  });

  closeModal();

  initializeGame();
}

/* ========================================
   EVENT LISTENERS
   ======================================== */

restartButton.addEventListener("click", restartGame);

nextLevelButton.addEventListener("click", nextLevel);

playAgainButton.addEventListener("click", playAgain);

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeDifficulty(button.dataset.difficulty);
  });
});

/* ========================================
   KEYBOARD CONTROLS
   ======================================== */

document.addEventListener("keydown", (event) => {
  /*
   * R = restart
   */

  if (event.key.toLowerCase() === "r") {
    restartGame();
  }

  /*
   * Escape = close modal
   */

  if (event.key === "Escape" && !gameModal.hidden) {
    closeModal();
  }
});

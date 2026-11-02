import { useEffect, useState } from "react";

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

const difficultySettings = {
  easy: { pairs: 6, time: 90 },
  medium: { pairs: 8, time: 120 },
  hard: { pairs: 12, time: 180 },
};

function createCards(difficulty) {
  const selectedSymbols = symbols.slice(0, difficultySettings[difficulty].pairs);
  const cards = [...selectedSymbols, ...selectedSymbols].map((symbol, index) => ({
    id: index,
    symbol,
  }));

  for (let index = cards.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[randomIndex]] = [cards[randomIndex], cards[index]];
  }

  return cards;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const [difficulty, setDifficulty] = useState("easy");
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState(() => createCards("easy"));
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [matchedIds, setMatchedIds] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(
    difficultySettings.easy.time,
  );
  const [gameActive, setGameActive] = useState(true);
  const [modal, setModal] = useState(null);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("memoryMatchHighScore")) || 0,
  );

  const pairCount = difficultySettings[difficulty].pairs;
  const matchedPairs = matchedIds.length / 2;
  const progress = (matchedPairs / pairCount) * 100;

  function resetGame(nextDifficulty = difficulty) {
    setCards(createCards(nextDifficulty));
    setScore(0);
    setAttempts(0);
    setMatchedIds([]);
    setFlippedIds([]);
    setTimeRemaining(difficultySettings[nextDifficulty].time);
    setGameActive(true);
    setModal(null);
  }

  function saveHighScore(nextScore) {
    if (nextScore > highScore) {
      localStorage.setItem("memoryMatchHighScore", String(nextScore));
      setHighScore(nextScore);
    }
  }

  useEffect(() => {
    if (!gameActive) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      if (timeRemaining <= 1) {
        setTimeRemaining(0);
        setGameActive(false);
        setModal({
          title: "Time's Up!",
          message: "The timer reached zero. Try again and beat your score.",
          icon: "⏱️",
          isLevelComplete: false,
        });
        return;
      }

      setTimeRemaining((remaining) => remaining - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [gameActive, timeRemaining]);

  useEffect(() => {
    if (flippedIds.length !== 2) {
      return undefined;
    }

    const [firstId, secondId] = flippedIds;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);

    if (firstCard.symbol === secondCard.symbol) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFlippedIds([]), 750);
    return () => window.clearTimeout(timeout);
  }, [cards, flippedIds]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key.toLowerCase() === "r") {
        resetGame();
      }

      if (event.key === "Escape" && modal) {
        setModal(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  function handleCardClick(card) {
    if (
      !gameActive ||
      flippedIds.length === 2 ||
      flippedIds.includes(card.id) ||
      matchedIds.includes(card.id)
    ) {
      return;
    }

    if (flippedIds.length === 0) {
      setFlippedIds([card.id]);
      return;
    }

    const firstCard = cards.find((currentCard) => currentCard.id === flippedIds[0]);
    const selectedIds = [...flippedIds, card.id];
    setFlippedIds(selectedIds);
    setAttempts((currentAttempts) => currentAttempts + 1);

    if (firstCard.symbol !== card.symbol) {
      return;
    }

    const nextMatchedIds = [...matchedIds, ...selectedIds];
    const pairScore = 100 + Math.max(0, timeRemaining);
    const nextScore = score + pairScore;
    setMatchedIds(nextMatchedIds);
    setFlippedIds([]);

    if (nextMatchedIds.length === pairCount * 2) {
      const finalScore = nextScore + timeRemaining * 10;
      setScore(finalScore);
      setGameActive(false);
      setModal({
        title: `Level ${level} Complete!`,
        message: "Excellent memory! Ready for the next challenge?",
        icon: "🎉",
        isLevelComplete: true,
      });
      saveHighScore(finalScore);
      return;
    }

    setScore(nextScore);
    saveHighScore(nextScore);
  }

  function changeDifficulty(nextDifficulty) {
    setDifficulty(nextDifficulty);
    setLevel(1);
    resetGame(nextDifficulty);
  }

  function nextLevel() {
    const nextLevelNumber = level + 1;
    let nextDifficulty = difficulty;

    if (nextLevelNumber === 2 && difficulty === "easy") {
      nextDifficulty = "medium";
    }

    if (nextLevelNumber >= 3) {
      nextDifficulty = "hard";
    }

    setLevel(nextLevelNumber);
    setDifficulty(nextDifficulty);
    resetGame(nextDifficulty);
  }

  function playAgain() {
    setLevel(1);
    setDifficulty("easy");
    resetGame("easy");
  }

  return (
    <>
      <header className="game-header">
        <div className="container header-inner">
          <a href="../../index.html" className="brand">
            Memory Match
          </a>
          <a href="../../index.html" className="portfolio-link">
            ← Portfolio
          </a>
        </div>
      </header>

      <main>
        <section className="game-intro">
          <div className="container">
            <p className="eyebrow">Interactive Game System</p>
            <h1>
              Test your <span>memory.</span>
            </h1>
            <p>
              Find all matching pairs before time runs out. Complete levels to
              increase the challenge.
            </p>
          </div>
        </section>

        <section className="game-section">
          <div className="container">
            <div className="difficulty-section">
              <span className="label">Difficulty</span>
              <div className="difficulty-buttons">
                {Object.keys(difficultySettings).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`difficulty-button${difficulty === option ? " active" : ""}`}
                    aria-pressed={difficulty === option}
                    onClick={() => changeDifficulty(option)}
                  >
                    {option[0].toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="game-stats">
              <StatCard label="Score" value={score} />
              <StatCard label="Level" value={level} />
              <StatCard label="Attempts" value={attempts} />
              <StatCard label="Time" value={formatTime(timeRemaining)} />
              <StatCard label="Best Score" value={highScore} />
            </div>

            <div className="progress-wrapper">
              <div className="progress-info">
                <span>Progress</span>
                <span>
                  {matchedPairs} / {pairCount} pairs
                </span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Matched pairs"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div
              className={`card-board ${difficulty}-board`}
              aria-label="Memory card board"
            >
              {cards.map((card) => {
                const isMatched = matchedIds.includes(card.id);
                const isFlipped = isMatched || flippedIds.includes(card.id);

                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`memory-card${isFlipped ? " flipped" : ""}${isMatched ? " matched" : ""}`}
                    aria-label={
                      isFlipped
                        ? `Card showing ${card.symbol}${isMatched ? ", matched" : ""}`
                        : "Hidden memory card"
                    }
                    disabled={!gameActive || isFlipped || flippedIds.length === 2}
                    onClick={() => handleCardClick(card)}
                  >
                    <span className="card-inner">
                      <span className="card-face card-back" aria-hidden="true">
                        ?
                      </span>
                      <span className="card-face card-front" aria-hidden="true">
                        {card.symbol}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="game-controls">
              <button
                type="button"
                className="primary-button"
                onClick={() => resetGame()}
              >
                Restart Game
              </button>
            </div>

            {modal && (
              <div className="game-modal">
                <div
                  className="modal-content"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-title"
                >
                  <div className="modal-icon">{modal.icon}</div>
                  <p className="eyebrow">Game Complete</p>
                  <h2 id="modal-title">{modal.title}</h2>
                  <p>{modal.message}</p>
                  <div className="final-score">
                    <span>Final Score</span>
                    <strong>{score}</strong>
                  </div>
                  <div className="modal-actions">
                    {modal.isLevelComplete && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={nextLevel}
                      >
                        Next Level
                      </button>
                    )}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={playAgain}
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="instructions-section">
          <div className="container">
            <div className="instructions">
              <div>
                <p className="eyebrow">How to play</p>
                <h2>Match every pair</h2>
              </div>
              <ul>
                <li>Flip two cards to reveal their symbols.</li>
                <li>Find all matching pairs before the timer reaches zero.</li>
                <li>Fewer attempts give you a better score.</li>
                <li>Complete a level to unlock the next challenge.</li>
                <li>Your highest score is saved automatically.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;

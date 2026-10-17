

const rows = 11;
const cols = 11;
const targetWords = 18;

function seededRandom(seed) {
  let value = seed >>> 0;

  return function () {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const today = new Date().toISOString().slice(0, 10);
const dailySeed = Number(today.replaceAll("-", ""));
const random = seededRandom(dailySeed);

const wordBank = [
  { clue: "Planet we live on", answer: "EARTH" },
  { clue: "Night light", answer: "MOON" },
  { clue: "Shines in space", answer: "STAR" },
  { clue: "Space traveler", answer: "COMET" },
  { clue: "Moves around a star", answer: "ORBIT" },
  { clue: "Large body of water", answer: "OCEAN" },
  { clue: "Flows to the sea", answer: "RIVER" },
  { clue: "White sky cover", answer: "CLOUD" },
  { clue: "Frozen rain", answer: "HAIL" },
  { clue: "Moving air", answer: "WIND" },
  { clue: "Bright flash", answer: "LIGHT" },
  { clue: "Makes a melody", answer: "MUSIC" },
  { clue: "Movie performer", answer: "ACTOR" },
  { clue: "Big-screen story", answer: "MOVIE" },
  { clue: "King's partner", answer: "QUEEN" },
  { clue: "Royal headwear", answer: "CROWN" },
  { clue: "Fast big cat", answer: "TIGER" },
  { clue: "Ocean predator", answer: "SHARK" },
  { clue: "Sea giant", answer: "WHALE" },
  { clue: "Bird of prey", answer: "EAGLE" },
  { clue: "Sandy shore", answer: "BEACH" },
  { clue: "Sports group", answer: "TEAM" },
  { clue: "Football score", answer: "GOAL" },
  { clue: "Running contest", answer: "RACE" },
  { clue: "Award for a winner", answer: "MEDAL" },
  { clue: "Board game", answer: "CHESS" },
  { clue: "Moves on tracks", answer: "TRAIN" },
  { clue: "Flies passengers", answer: "PLANE" },
  { clue: "Tells the time", answer: "CLOCK" },
  { clue: "Grows in a garden", answer: "PLANT" },
  { clue: "Part of a tree", answer: "LEAF" },
  { clue: "Tiny start of a plant", answer: "SEED" },
  { clue: "Baked food", answer: "BREAD" },
  { clue: "Yellow citrus fruit", answer: "LEMON" },
  { clue: "Small round fruit", answer: "GRAPE" },
  { clue: "Sweet tropical fruit", answer: "MANGO" },
  { clue: "Computer helper", answer: "ROBOT" },
  { clue: "Written instructions", answer: "CODE" },
  { clue: "A tiny screen dot", answer: "PIXEL" },
  { clue: "Checkmate game piece", answer: "ROOK" },
  { clue: "Opposite of old", answer: "NEW" },
  { clue: "Not dark", answer: "LIT" },
  { clue: "A short nap", answer: "REST" },
  { clue: "A place to sit", answer: "SEAT" },
  { clue: "A loud sound", answer: "NOISE" },
  { clue: "A type of dance", answer: "SALSA" },
  { clue: "A written story", answer: "NOVEL" },
  { clue: "A mountain top", answer: "PEAK" },
  { clue: "Opposite of lose", answer: "WIN" }
];

function generatePuzzle() {
  let bestEntries = [];
  let bestQuality = -1;

  for (let attempt = 0; attempt < 25; attempt++) {
    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        type: "empty",
        letter: ""
      }))
    );

    const placed = [];
    const used = new Set();
    let acrossCount = 0;
    let downCount = 0;
    let crossingTotal = 0;

    function pointsFor(entry) {
      return Array.from(entry.answer, (_, i) => ({
        row: entry.clueRow +
          (entry.direction === "down" ? i + 1 : 0),
        col: entry.clueCol +
          (entry.direction === "across" ? i + 1 : 0)
      }));
    }

    function canPlace(entry, requireCrossing = true) {
      const clueCell = grid[entry.clueRow][entry.clueCol];

      if (clueCell.type !== "empty") return 0;

      let crossings = 0;

      for (let i = 0; i < entry.answer.length; i++) {
        const point = pointsFor(entry)[i];

        if (
          point.row < 0 || point.row >= rows ||
          point.col < 0 || point.col >= cols
        ) {
          return 0;
        }

        const cell = grid[point.row][point.col];

        if (cell.type === "clue") return 0;

        if (cell.type === "letter") {
          if (cell.letter !== entry.answer[i]) return 0;
          crossings++;
        }
      }

      if (requireCrossing && crossings === 0) return 0;
      return crossings;
    }

    function addEntry(entry) {
      const crossings = canPlace(entry, false);

      grid[entry.clueRow][entry.clueCol] = {
        type: "clue",
        letter: ""
      };

      for (let i = 0; i < entry.answer.length; i++) {
        const point = pointsFor(entry)[i];

        grid[point.row][point.col] = {
          type: "letter",
          letter: entry.answer[i]
        };
      }

      const id = entry.direction === "across"
        ? `A${++acrossCount}`
        : `D${++downCount}`;

      placed.push({ ...entry, id });
      used.add(entry.answer);
      crossingTotal += crossings;
    }

    // Start near the centre.
    const seeds = wordBank.filter(word =>
      word.answer.length >= 4 &&
      word.answer.length <= cols - 1
    );

    const seed = seeds[Math.floor(random() * seeds.length)];

    addEntry({
      direction: "across",
      clueRow: Math.floor(rows / 2),
      clueCol: Math.floor((cols - seed.answer.length - 1) / 2),
      clue: seed.clue,
      answer: seed.answer
    });

    while (placed.length < targetWords) {
      let bestCandidate = null;
      let bestCandidateScore = -Infinity;

      for (const word of wordBank) {
        if (used.has(word.answer)) continue;

        for (const direction of ["across", "down"]) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (
                direction === "across" &&
                c + word.answer.length >= cols
              ) continue;

              if (
                direction === "down" &&
                r + word.answer.length >= rows
              ) continue;

              const candidate = {
                direction,
                clueRow: r,
                clueCol: c,
                clue: word.clue,
                answer: word.answer
              };

              const crossings = canPlace(candidate);

              if (crossings === 0) continue;

              // Prefer crossings, with a little randomness.
              const score =
                crossings * 100 +
                word.answer.length +
                random() * 20;

              if (score > bestCandidateScore) {
                bestCandidateScore = score;
                bestCandidate = candidate;
              }
            }
          }
        }
      }

      if (!bestCandidate) break;
      addEntry(bestCandidate);
    }

    const quality = placed.length * 100 + crossingTotal;

    if (quality > bestQuality) {
      bestQuality = quality;
      bestEntries = placed;
    }

    if (placed.length >= targetWords) break;
  }

  return bestEntries;
}

const entries = generatePuzzle();

if (entries.length === 0) {
  throw new Error("Could not generate a puzzle.");
}

console.log(`Generated ${entries.length} answers.`);


const gridElement = document.querySelector("#grid");
const acrossElement = document.querySelector("#across-clues");
const downElement = document.querySelector("#down-clues");
const messageElement = document.querySelector("#message");
const progressElement = document.querySelector("#progress");
const mobileKeyboard = document.querySelector("#mobile-keyboard");

const board = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => ({
    type: "empty",
    entries: []
  }))
);

const letters = Array.from({ length: rows }, () =>
  Array(cols).fill("")
);

const cells = Array.from({ length: rows }, () =>
  Array(cols).fill(null)
);

let selectedEntry = entries[0];
let activeCell = {
  row: entries[0].clueRow +
    (entries[0].direction === "down" ? 1 : 0),
  col: entries[0].clueCol +
    (entries[0].direction === "across" ? 1 : 0)
};
let checked = false;

function getCells(entry) {
  return Array.from(entry.answer, (_, index) => ({
    row: entry.clueRow +
      (entry.direction === "down" ? index + 1 : 0),
    col: entry.clueCol +
      (entry.direction === "across" ? index + 1 : 0)
  }));
}

// Create clue cells and answer cells.
for (const entry of entries) {
  if (board[entry.clueRow][entry.clueCol].type !== "empty") {
    throw new Error("Two clues use the same grid cell.");
  }

  board[entry.clueRow][entry.clueCol] = {
    type: "clue",
    entry
  };

  for (const point of getCells(entry)) {
    if (
      point.row < 0 || point.row >= rows ||
      point.col < 0 || point.col >= cols
    ) {
      throw new Error(`Answer ${entry.id} extends beyond the grid.`);
    }

    const target = board[point.row][point.col];

    if (target.type === "clue") {
      throw new Error(`Answer ${entry.id} overlaps a clue cell.`);
    }

    target.type = "letter";
    target.entries.push(entry);

    const index = getCells(entry).findIndex(
      cell => cell.row === point.row && cell.col === point.col
    );
    const letter = entry.answer[index];

    if (target.solution && target.solution !== letter) {
      throw new Error(`Conflicting answers at row ${point.row + 1}, column ${point.col + 1}.`);
    }

    target.solution = letter;
  }
}

function findEntriesAt(row, col) {
  return board[row][col].entries || [];
}

function chooseEntry(entry) {
  selectedEntry = entry;
  activeCell = { ...getCells(entry)[0] };
  messageElement.textContent = `Solve ${entry.id}: ${entry.clue}`;
  render();
}

function renderGrid() {
  gridElement.innerHTML = "";
  gridElement.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const data = board[row][col];

      if (data.type === "empty") {
        const blank = document.createElement("div");
        blank.className = "cell blocked";
        gridElement.appendChild(blank);
        cells[row][col] = blank;
        continue;
      }

      const button = document.createElement("button");
      button.type = "button";

      if (data.type === "clue") {
        button.className = "cell clue-cell";

        const arrow = document.createElement("span");
        arrow.className = "clue-arrow";
        arrow.textContent =
          data.entry.direction === "across" ? "→" : "↓";

        const text = document.createElement("span");
        text.className = "clue-cell-text";
        text.textContent = data.entry.clue;

        button.append(arrow, text);
        button.setAttribute(
          "aria-label",
          `${data.entry.direction} clue: ${data.entry.clue}`
        );

        button.addEventListener("click", () => {
          chooseEntry(data.entry);
        });
      } else {
        button.className = "cell letter-cell";
        button.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);

        button.addEventListener("click", () => {
          const matching = findEntriesAt(row, col);

          if (matching.length > 1) {
            const currentIndex = matching.findIndex(
              entry => entry.id === selectedEntry.id
            );
            selectedEntry = matching[(currentIndex + 1) % matching.length];
          } else if (matching.length === 1) {
            selectedEntry = matching[0];
          }

          activeCell = { row, col };
          render();
        });
      }

      cells[row][col] = button;
      gridElement.appendChild(button);
    }
  }
}

function renderClues() {
  acrossElement.innerHTML = "";
  downElement.innerHTML = "";

  for (const entry of entries) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "clue";

    if (entry.id === selectedEntry.id) {
      button.classList.add("active-clue");
    }

    const number = document.createElement("span");
    number.className = "clue-number";
    number.textContent = `${entry.id} ${entry.direction === "across" ? "→" : "↓"}`;

    button.append(number, document.createTextNode(entry.clue));
    button.addEventListener("click", () => chooseEntry(entry));

    (entry.direction === "across" ? acrossElement : downElement)
      .appendChild(button);
  }
}

function render() {
  const selectedCells = getCells(selectedEntry);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const data = board[row][col];
      const cell = cells[row][col];

      if (data.type === "empty") continue;

      if (data.type === "clue") {
        cell.classList.toggle(
          "selected-clue",
          data.entry.id === selectedEntry.id
        );
        continue;
      }

      cell.textContent = letters[row][col];
      cell.classList.toggle(
        "selected-word",
        selectedCells.some(point => point.row === row && point.col === col)
      );
      cell.classList.toggle(
        "active",
        activeCell.row === row && activeCell.col === col
      );
      cell.classList.toggle(
        "correct",
        checked && letters[row][col] === data.solution
      );
    }
  }

  renderClues();

  let filled = 0;
  let total = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].type === "letter") {
        total++;
        if (letters[row][col]) filled++;
      }
    }
  }

  progressElement.textContent = `${filled} / ${total}`;
}

function moveToNextCell() {
  const wordCells = getCells(selectedEntry);
  const index = wordCells.findIndex(
    point => point.row === activeCell.row && point.col === activeCell.col
  );

  if (index >= 0 && index < wordCells.length - 1) {
    activeCell = { ...wordCells[index + 1] };
  }
}

function enterLetter(letter) {
  if (board[activeCell.row][activeCell.col].type !== "letter") return;

  letters[activeCell.row][activeCell.col] = letter.toUpperCase();
  checked = false;
  moveToNextCell();
  messageElement.textContent = "Keep going!";
  render();
}

function deleteLetter() {
  if (board[activeCell.row][activeCell.col].type !== "letter") return;

  if (letters[activeCell.row][activeCell.col]) {
    letters[activeCell.row][activeCell.col] = "";
  } else {
    const wordCells = getCells(selectedEntry);
    const index = wordCells.findIndex(
      point => point.row === activeCell.row && point.col === activeCell.col
    );

    if (index > 0) {
      activeCell = { ...wordCells[index - 1] };
      letters[activeCell.row][activeCell.col] = "";
    }
  }

  checked = false;
  render();
}

document.addEventListener("keydown", event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (/^[a-zA-Z]$/.test(event.key)) {
    event.preventDefault();
    enterLetter(event.key);
  } else if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    deleteLetter();
  } else if (event.key.startsWith("Arrow")) {
    event.preventDefault();

    const wordCells = getCells(selectedEntry);
    const index = wordCells.findIndex(
      point => point.row === activeCell.row && point.col === activeCell.col
    );

    const nextIndex =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? Math.min(index + 1, wordCells.length - 1)
        : Math.max(index - 1, 0);

    if (index >= 0) activeCell = { ...wordCells[nextIndex] };
    render();
  }
});

document.querySelector("#check-button").addEventListener("click", () => {
  checked = true;

  let allCorrect = true;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const data = board[row][col];

      if (
        data.type === "letter" &&
        letters[row][col] !== data.solution
      ) {
        allCorrect = false;
      }
    }
  }

  messageElement.textContent = allCorrect
    ? "🎉 Great job! You solved the puzzle!"
    : "Not quite yet. Check the highlighted letters and try again.";

  render();
});

document.querySelector("#clear-button").addEventListener("click", () => {
  for (const row of letters) row.fill("");

  checked = false;
  selectedEntry = entries[0];
  activeCell = { ...getCells(selectedEntry)[0] }
  messageElement.textContent = "Puzzle cleared. Try again!";
  render();
});

if (mobileKeyboard) {
  mobileKeyboard.innerHTML = "";

  for (const key of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-key";
    button.textContent = key;
    button.addEventListener("click", () => enterLetter(key));
    mobileKeyboard.appendChild(button);
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "mobile-key wide";
  deleteButton.textContent = "⌫ Delete";
  deleteButton.addEventListener("click", deleteLetter);
  mobileKeyboard.appendChild(deleteButton);
}

renderGrid();
render();



/* Grid zoom controls */

/* Grid zoom controls */
const gridViewport = document.querySelector(".grid-viewport");
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");
const zoomResetButton = document.getElementById("zoom-reset");
const zoomGrid = document.getElementById("grid");

let zoomLevel = 1;

function updateZoom() {
  zoomGrid.style.zoom = "";
  zoomGrid.style.transform = `scale(${zoomLevel})`;

  zoomResetButton.textContent = `${Math.round(zoomLevel * 100)} %`;
  zoomInButton.disabled = zoomLevel >= 2.5;
  zoomOutButton.disabled = zoomLevel <= 1;
}

zoomInButton.addEventListener("click", () => {
  zoomLevel = Math.min(2.5, zoomLevel + 0.25);
  updateZoom();
});

zoomOutButton.addEventListener("click", () => {
  zoomLevel = Math.max(1, zoomLevel - 0.25);
  updateZoom();
});

zoomResetButton.addEventListener("click", () => {
  zoomLevel = 1;
  updateZoom();
  gridViewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
});

updateZoom();

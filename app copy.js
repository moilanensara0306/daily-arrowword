
const entries = [
  {
    id: "A1",
    direction: "across",
    clueRow: 0,
    clueCol: 0,
    clue: "Drawing",
    answer: "MAP"
  },
  {
    id: "D1",
    direction: "down",
    clueRow: 0,
    clueCol: 5,
    clue: "Rank",
    answer: "LEVEL"
  },
  {
    id: "D2",
    direction: "down",
    clueRow: 0,
    clueCol: 6,
    clue: "Tale",
    answer: "STORY"
  },
  {
    id: "A2",
    direction: "across",
    clueRow: 2,
    clueCol: 0,
    clue: "Orbits a star",
    answer: "PLANET"
  },
  {
    id: "A3",
    direction: "across",
    clueRow: 4,
    clueCol: 0,
    clue: "Colorful bloom",
    answer: "FLOWER"
  },
  {
    id: "A4",
    direction: "across",
    clueRow: 6,
    clueCol: 0,
    clue: "Brain teaser",
    answer: "PUZZLE"
  }
];

const rows = 7;
const cols = 7;

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
let activeCell = { row: 0, col: 1 };
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
  activeCell = { row: 0, col: 1 };
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

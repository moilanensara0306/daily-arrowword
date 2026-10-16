
const entries = [
  {
    id: "A1",
    direction: "across",
    row: 0,
    col: 0,
    clue: "A drawing or plan",
    answer: "MAP"
  },
  {
    id: "A2",
    direction: "across",
    row: 1,
    col: 0,
    clue: "The star at the center of our solar system",
    answer: "SUN"
  },
  {
    id: "A3",
    direction: "across",
    row: 2,
    col: 0,
    clue: "A pet that meows",
    answer: "CAT"
  },
  {
    id: "A4",
    direction: "across",
    row: 3,
    col: 0,
    clue: "A person's sense of self",
    answer: "EGO"
  },
  {
    id: "A5",
    direction: "across",
    row: 4,
    col: 0,
    clue: "An animal that barks",
    answer: "DOG"
  },
  {
    id: "D1",
    direction: "down",
    row: 2,
    col: 1,
    clue: "In the past, as in 'two days ___'",
    answer: "AGO"
  }
];

const rows = 5;
const cols = 3;
const gridElement = document.querySelector("#grid");
const acrossElement = document.querySelector("#across-clues");
const downElement = document.querySelector("#down-clues");
const messageElement = document.querySelector("#message");
const progressElement = document.querySelector("#progress");

const letters = Array.from(
  { length: rows },
  () => Array(cols).fill("")
);

const solution = Array.from(
  { length: rows },
  () => Array(cols).fill("")
);

const cells = Array.from(
  { length: rows },
  () => Array(cols).fill(null)
);

let selectedEntry = entries[0];
let activeCell = { row: 0, col: 0 };
let checked = false;

function getCells(entry) {
  return Array.from(entry.answer, (_, index) => ({
    row: entry.row + (entry.direction === "down" ? index : 0),
    col: entry.col + (entry.direction === "across" ? index : 0)
  }));
}

// Build the answer grid from the puzzle data.
for (const entry of entries) {
  getCells(entry).forEach(({ row, col }, index) => {
    const letter = entry.answer[index];

    if (solution[row][col] && solution[row][col] !== letter) {
      throw new Error("Puzzle answers do not match at an intersection.");
    }

    solution[row][col] = letter;
  });
}

function renderGrid() {
  gridElement.innerHTML = "";
  gridElement.style.gridTemplateColumns =
    `repeat(${cols}, minmax(0, 1fr))`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);
      cell.textContent = letters[row][col];
      cell.dataset.row = row;
      cell.dataset.col = col;

      cell.addEventListener("click", () => {
        const matchingEntries = entries.filter(entry =>
          getCells(entry).some(
            point => point.row === row && point.col === col
          )
        );

        if (matchingEntries.length > 0) {
          if (
            matchingEntries.length > 1 &&
            getCells(selectedEntry).some(
              point => point.row === row && point.col === col
            )
          ) {
            const otherEntry = matchingEntries.find(
              entry => entry.id !== selectedEntry.id
            );

            if (otherEntry) selectedEntry = otherEntry;
          } else {
            selectedEntry = matchingEntries[0];
          }
        }

        activeCell = { row, col };
        render();
      });

      cells[row][col] = cell;
      gridElement.appendChild(cell);
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
    button.classList.toggle(
      "active-clue",
      selectedEntry.id === entry.id
    );

    const number = document.createElement("span");
    number.className = "clue-number";
    number.textContent = entry.id;

    button.append(number, document.createTextNode(entry.clue));

    button.addEventListener("click", () => {
      selectedEntry = entry;
      const firstCell = getCells(entry)[0];
      activeCell = { ...firstCell };
      messageElement.textContent = "Enter the answer using your keyboard.";
      render();
    });

    (entry.direction === "across" ? acrossElement : downElement)
      .appendChild(button);
  }
}

function render() {
  const selectedCells = getCells(selectedEntry);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cells[row][col];
      cell.textContent = letters[row][col];

      const isSelected = selectedCells.some(
        point => point.row === row && point.col === col
      );

      cell.classList.toggle("selected-word", isSelected);
      cell.classList.toggle(
        "active",
        activeCell.row === row && activeCell.col === col
      );

      cell.classList.toggle(
        "correct",
        checked && letters[row][col] === solution[row][col]
      );
    }
  }

  renderClues();

  const filled = letters.flat().filter(Boolean).length;
  const total = solution.flat().filter(Boolean).length;
  progressElement.textContent = `${filled} / ${total}`;
}

function moveToNextCell() {
  const wordCells = getCells(selectedEntry);
  const index = wordCells.findIndex(
    point =>
      point.row === activeCell.row &&
      point.col === activeCell.col
  );

  if (index >= 0 && index < wordCells.length - 1) {
    activeCell = { ...wordCells[index + 1] };
  }
}

document.addEventListener("keydown", event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  if (/^[a-zA-Z]$/.test(event.key)) {
    event.preventDefault();
    letters[activeCell.row][activeCell.col] = event.key.toUpperCase();
    checked = false;
    moveToNextCell();
    messageElement.textContent = "Keep going!";
    render();
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();

    if (letters[activeCell.row][activeCell.col]) {
      letters[activeCell.row][activeCell.col] = "";
    } else {
      const wordCells = getCells(selectedEntry);
      const index = wordCells.findIndex(
        point =>
          point.row === activeCell.row &&
          point.col === activeCell.col
      );

      if (index > 0) {
        activeCell = { ...wordCells[index - 1] };
        letters[activeCell.row][activeCell.col] = "";
      }
    }

    checked = false;
    render();
  }

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    moveToNextCell();
    render();
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    const wordCells = getCells(selectedEntry);
    const index = wordCells.findIndex(
      point =>
        point.row === activeCell.row &&
        point.col === activeCell.col
    );

    if (index > 0) activeCell = { ...wordCells[index - 1] };
    render();
  }
});

document.querySelector("#check-button").addEventListener("click", () => {
  checked = true;

  const allCorrect = solution.every((row, rowIndex) =>
    row.every((letter, colIndex) =>
      !letter || letters[rowIndex][colIndex] === letter
    )
  );

  messageElement.textContent = allCorrect
    ? "🎉 Great job! You solved the puzzle!"
    : "Not quite yet. Check the highlighted letters and try again.";

  render();
});

document.querySelector("#clear-button").addEventListener("click", () => {
  for (const row of letters) row.fill("");
  checked = false;
  selectedEntry = entries[0];
  activeCell = { row: 0, col: 0 };
  messageElement.textContent = "Puzzle cleared. Try again!";
  render();
});

renderGrid();
render();
const mobileKeyboard = document.querySelector("#mobile-keyboard");

for (const key of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mobile-key";
  button.textContent = key;

  button.addEventListener("click", () => {
    letters[activeCell.row][activeCell.col] = key;
    checked = false;
    moveToNextCell();
    messageElement.textContent = "Keep going!";
    render();
  });

  mobileKeyboard.appendChild(button);
}

const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.className = "mobile-key wide";
deleteButton.textContent = "⌫ Delete";

deleteButton.addEventListener("click", () => {
  letters[activeCell.row][activeCell.col] = "";
  checked = false;
  messageElement.textContent = "Letter deleted.";
  render();
});

mobileKeyboard.appendChild(deleteButton);
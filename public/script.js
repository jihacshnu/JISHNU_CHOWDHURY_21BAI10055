const ws = new WebSocket("ws://localhost:4000");

let currentPlayer = "A";
let selectedPiece = null;
let gameState = { board: [], moveHistory: [], gameOver: false, winner: null };
let selectedCharacters = { A: [], B: [] }; // Separate selections for A and B
let selectingForPlayer = "A"; // Track which player is currently selecting characters

const statusElement = document.getElementById("status");
const moveOptionsElement = document.getElementById("moveOptions");
const moveHistoryElement = document.getElementById("moveHistory");
const characterSelectionElement = document.getElementById("characterSelection");
const gameBoardElement = document.getElementById("gameBoard");
const currentPlayerElement = document.getElementById("currentPlayer");
ws.onopen = () => {
  console.log("WebSocket connection established.");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Received message:", message);

  if (message.type === "gameState") {
    gameState = message.data;
    currentPlayer = gameState.turn;

    if (gameState.gameOver) {
      statusElement.textContent = `Player ${gameState.winner} wins!`;
      document.getElementById(
        "winnerMessage"
      ).textContent = `Player ${gameState.winner} wins!`;
      document.getElementById("gameEndMessage").style.display = "block"; // Show end message and button
    } else {
      statusElement.textContent = `Player ${gameState.turn}'s turn`;
    }
    updateBoard(gameState.board);
    updateMoveHistory(gameState.moveHistory);
  } else if (message.type === "invalidMove") {
    statusElement.textContent = `Invalid move: ${message.error}`;
  } else if (message.type === "characterSelection") {
    characterSelectionElement.style.display = "none"; // Hide character selection
    gameBoardElement.style.display = "grid"; // Show game board
    console.log("Character selection successful.");
  }
};

function updateBoard(board) {
  console.log("Updating board:", board);
  gameBoardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement("div");
      cellElement.className = "cell";
      if (cell) {
        const [player, pieceType] = cell.split("-");
        cellElement.textContent = pieceType;

        // Assign the appropriate class based on player and piece type
        if (player === "A") {
          if (pieceType.startsWith("P")) {
            cellElement.classList.add("playerA-Pawn");
          } else if (pieceType === "H1") {
            cellElement.classList.add("playerA-Hero1");
          } else if (pieceType === "H2") {
            cellElement.classList.add("playerA-Hero2");
          }
        } else if (player === "B") {
          if (pieceType.startsWith("P")) {
            cellElement.classList.add("playerB-Pawn");
          } else if (pieceType === "H1") {
            cellElement.classList.add("playerB-Hero1");
          } else if (pieceType === "H2") {
            cellElement.classList.add("playerB-Hero2");
          }
        }

        cellElement.onclick = () => handleCellClick(rowIndex, colIndex);
      }
      gameBoardElement.appendChild(cellElement);
    });
  });
}

function updateMoveHistory(moveHistory) {
  moveHistoryElement.innerHTML = moveHistory
    .map((entry) => {
      const moveDesc = `${entry.player}-${entry.piece}: ${formatMove(
        entry.move
      )} from (${entry.from.row}, ${entry.from.col}) to (${entry.to.row}, ${
        entry.to.col
      })`;
      return `<div>${moveDesc}</div>`;
    })
    .join("");
}
function startAgain() {
  // Reset game state
  gameState = {
    board: [
      Array(5).fill(null),
      Array(5).fill(null),
      Array(5).fill(null),
      Array(5).fill(null),
      Array(5).fill(null),
    ],
    turn: "A",
    gameOver: false,
    winner: null,
    moveHistory: [],
    selectedCharacters: { A: [], B: [] }, // Reset character selections
  };

  // Clear the game board and move history
  gameBoardElement.innerHTML = "";
  moveHistoryElement.innerHTML = "";

  // Show the character selection and hide the game board
  characterSelectionElement.style.display = "block";
  gameBoardElement.style.display = "none";
  document.getElementById("gameEndMessage").style.display = "none";

  // Notify clients to reset their game state
  ws.send(JSON.stringify({ type: "resetGame" }));

  // Optionally, you might want to start selection for player A or B
  startSelectionForPlayer("A");
}

function formatMove(move) {
  switch (move) {
    case "L":
      return "Left";
    case "R":
      return "Right";
    case "F":
      return "Forward";
    case "B":
      return "Backward";
    case "FL":
      return "Forward-Left";
    case "FR":
      return "Forward-Right";
    case "BL":
      return "Backward-Left";
    case "BR":
      return "Backward-Right";
    case "RF":
      return "Right-Forward";
    case "RB":
      return "Right-Backward";
    case "LF":
      return "Left-Forward";
    case "LB":
      return "Left-Backward";
    default:
      return "Unknown Move";
  }
}

function handleCellClick(row, col) {
  console.log(`Cell clicked: (${row}, ${col})`);
  const cell = gameState.board[row][col];
  if (cell && cell.startsWith(currentPlayer)) {
    selectPiece(cell, row, col);
  } else if (selectedPiece) {
    movePiece(row, col);
  }
}

function selectPiece(piece, row, col) {
  selectedPiece = { piece, row, col };
  showMoveOptions();
}

function showMoveOptions() {
  const piece = selectedPiece.piece.split("-")[1];
  let moveOptions = [];

  if (piece === "P1" || piece === "P2" || piece === "P3") {
    moveOptions = ["L", "R", "F", "B"];
  } else if (piece === "H1") {
    moveOptions = ["F", "B"];
  } else if (piece === "H2") {
    moveOptions = ["FL", "FR", "BL", "BR"];
  } else if (piece === "H3") {
    moveOptions = ["FL", "FR", "BL", "BR", "RF", "RB", "LF", "LB"];
  }

  moveOptionsElement.innerHTML = moveOptions
    .map(
      (move) =>
        `<button onclick="sendMove('${move}')">${formatMove(move)}</button>`
    )
    .join("");
}

function sendMove(move) {
  if (!selectedPiece) return;

  const moveData = {
    player: currentPlayer,
    move,
    piece: selectedPiece.piece.split("-")[1],
    from: { row: selectedPiece.row, col: selectedPiece.col },
  };

  console.log("Sending move:", moveData);
  ws.send(JSON.stringify(moveData));
  selectedPiece = null;
  moveOptionsElement.innerHTML = "";
}

function movePiece(row, col) {
  if (selectedPiece) {
    const moveData = {
      player: currentPlayer,
      move: selectedMove,
      piece: selectedPiece.piece.split("-")[1],
      from: { row: selectedPiece.row, col: selectedPiece.col },
      to: { row, col },
    };

    console.log("Sending move:", moveData);
    ws.send(JSON.stringify(moveData));
    selectedPiece = null;
    moveOptionsElement.innerHTML = "";
  }
}

function selectCharacter(character) {
  if (selectedCharacters[selectingForPlayer].length < 5) {
    selectedCharacters[selectingForPlayer].push(character);
    document.getElementById(
      `selectedCharacters${selectingForPlayer}`
    ).innerHTML = `Selected: ${selectedCharacters[selectingForPlayer].join(
      ", "
    )}`;
  } else {
    alert(
      `Player ${selectingForPlayer}, you have already selected 5 characters.`
    );
  }
}

function submitSelection(player) {
  if (selectedCharacters[player].length === 5) {
    ws.send(
      JSON.stringify({
        type: "characterSelection",
        player,
        characters: selectedCharacters[player],
      })
    );
    characterSelectionElement.style.display = "none"; // Hide character selection
    gameBoardElement.style.display = "grid"; // Show game board
  } else {
    alert(`Player ${player}, please select all 5 characters.`);
  }
}

function startSelectionForPlayer(player) {
  selectingForPlayer = player;
  document.getElementById("playerASelection").style.display =
    player === "A" ? "block" : "none";
  document.getElementById("playerBSelection").style.display =
    player === "B" ? "block" : "none";
}

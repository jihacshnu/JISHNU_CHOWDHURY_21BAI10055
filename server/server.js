const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`HTTP server listening on http://localhost:${port}`);
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 4000 });

let gameState = {
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
  selectedCharacters: { A: [], B: [] }, // Store characters for both players
};

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.send(JSON.stringify({ type: "gameState", data: gameState }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "characterSelection") {
      const { player, characters } = data;
      gameState.selectedCharacters[player] = characters;

      if (
        gameState.selectedCharacters.A.length === 5 &&
        gameState.selectedCharacters.B.length === 5
      ) {
        gameState.board = initializeBoard(gameState.selectedCharacters);
        gameState.turn = "A";
        gameState.gameOver = false;
        gameState.winner = null;
        gameState.moveHistory = [];
        broadcastGameState();
      }
    } else {
      const { player, move, piece, from } = data;

      if (player !== gameState.turn || gameState.gameOver) {
        ws.send(
          JSON.stringify({
            type: "invalidMove",
            error: "Not your turn or game over",
          })
        );
        return;
      }

      const newPosition = getNewPosition(from, move, piece);
      if (!newPosition || !isValidMove(from, newPosition)) {
        ws.send(JSON.stringify({ type: "invalidMove", error: "Invalid move" }));
        return;
      }

      makeMove(from, newPosition, player, piece, move);
      checkForWinner();
      gameState.turn = gameState.turn === "A" ? "B" : "A";
      broadcastGameState();
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

function initializeBoard(selectedCharacters) {
  const board = [
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
  ];

  selectedCharacters.A.forEach((character, index) => {
    board[0][index] = `A-${character}`;
  });

  selectedCharacters.B.forEach((character, index) => {
    board[4][index] = `B-${character}`;
  });

  return board;
}

function getNewPosition(from, move, piece) {
  const moveMap = {
    L: { row: 0, col: -1 },
    R: { row: 0, col: 1 },
    F: { row: -1, col: 0 },
    B: { row: 1, col: 0 },
    FL: { row: -2, col: -1 },
    FR: { row: -2, col: 1 },
    BL: { row: 2, col: -1 },
    BR: { row: 2, col: 1 },
    RF: { row: -1, col: 2 },
    RB: { row: 1, col: 2 },
    LF: { row: -1, col: -2 },
    LB: { row: 1, col: -2 },
  };

  const movement = moveMap[move];
  let steps = 1;
  if (piece === "H1" || piece === "H2") {
    steps = 2;
  } else if (piece === "H3") {
    steps = 1;
  }

  return {
    row: from.row + movement.row * steps,
    col: from.col + movement.col * steps,
  };
}

function isValidMove(from, to) {
  return (
    to.row >= 0 &&
    to.row < gameState.board.length &&
    to.col >= 0 &&
    to.col < gameState.board[0].length &&
    (!gameState.board[to.row][to.col] ||
      gameState.board[to.row][to.col][0] !== gameState.turn)
  );
}

function makeMove(from, newPosition, player, piece, move) {
  const oldCell = gameState.board[from.row][from.col];
  const targetCell = gameState.board[newPosition.row][newPosition.col];

  if (piece === "H3" && targetCell && targetCell[0] !== player) {
    gameState.board[newPosition.row][newPosition.col] = null;
  }

  gameState.board[from.row][from.col] = null;
  gameState.board[newPosition.row][newPosition.col] = oldCell;
  gameState.moveHistory.push({ player, move, piece, from, to: newPosition });
}

function checkForWinner() {
  const playerAHasPieces = gameState.board.some((row) =>
    row.some((cell) => cell && cell.startsWith("A"))
  );
  const playerBHasPieces = gameState.board.some((row) =>
    row.some((cell) => cell && cell.startsWith("B"))
  );

  if (!playerAHasPieces) {
    gameState.gameOver = true;
    gameState.winner = "B";
  } else if (!playerBHasPieces) {
    gameState.gameOver = true;
    gameState.winner = "A";
  }
}

function broadcastGameState() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "gameState", data: gameState }));
    }
  });
}

console.log("WebSocket server started on ws://localhost:4000");

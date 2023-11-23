const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];

function handleCellClick(index) {
  if (board[index] === '' && !isGameOver()) {
    board[index] = currentPlayer;
    renderBoard();
    if (!isGameOver()) {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      statusElement.innerText = `Ход игрока ${currentPlayer === 'X' ? 'X' : 'O'}`;
    }
  }
}

function renderBoard() {
  boardElement.innerHTML = '';
  board.forEach((value, index) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerText = value;
    cell.addEventListener('click', () => handleCellClick(index));
    boardElement.appendChild(cell);
  });
}

function isGameOver() {
  if (checkWinner('X')) {
    statusElement.innerText = 'Игрок X победил!';
    return true;
  } else if (checkWinner('O')) {
    statusElement.innerText = 'Игрок O победил!';
    return true;
  } else if (board.every(cell => cell !== '')) {
    statusElement.innerText = 'Ничья!';
    return true;
  }
  return false;
}

function checkWinner(player) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  return winningCombinations.some(combination => {
    return combination.every(index => board[index] === player);
  });
}

renderBoard();
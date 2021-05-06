// Splat/tick and event listener onClick taken from in class example: https://jayhawk-nation.web.app/examples/TicTacToe

let canvas;
let context;
let BOARD_PADDING = { sides: 20, top: 80, bottom: 40 }

let model = {
  board: makeEmptyBoard(),
  next: "RED",
  totalMoves: 0,
  winner: undefined,
  redWins: 0,
  yellowWins: 0,
  tied: false
}

function tick() {
  window.requestAnimationFrame(splat);
}

function makeEmptyBoard() {
  let board = [];

  for (var i = 0; i < 7; i++) {
    board[i] = new Array(6);

    for (var m = 0; m < 6; m++) {
      board[i][m] = '';
    }
  }

  return board
}

function splat() {
  // Draw background.
  context.fillStyle = "#4a4a4a";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw title.
  context.font = "40px Libre Franklin";
  context.fillStyle = "#c5c5c5";
  context.textAlign = "center";
  context.fillText("CONNECT4", canvas.width / 2, 55)

  // Draw move counter.
  context.font = "24px Libre Franklin";
  context.fillStyle = "#c5c5c5";
  context.textAlign = "left";
  context.fillText(`Move Count: ${model.totalMoves}`, BOARD_PADDING.sides, BOARD_PADDING.top - 24);

  // Draw board.
  context.fillStyle = "#3A83C8";
  context.fillRect(BOARD_PADDING.sides, BOARD_PADDING.top, 780, 670);

  for (let o = 80; o < 800; (o += 110)) {
    for (let p = 140; p < 710; (p += 110)) {
      let color = model.board[roundX(o)][roundY(p)];

      context.beginPath();
      context.arc(o, p, 45, 0, 2 * Math.PI);
      context.fillStyle = color ? color : '#2c659c';
      context.fill();
      context.stroke();
    }
  }

  // Draw win counts.
  context.font = "24px Libre Franklin";
  context.fillStyle = "#c5c5c5";
  context.textAlign = "left";
  context.fillText(`Red Wins: ${model.redWins}`, BOARD_PADDING.sides, 785);
  context.fillText(`Yellow Wins: ${model.yellowWins}`, BOARD_PADDING.sides, 815);

  // Draw reset board button.
  context.fillStyle = "#3A83C8";
  context.fillRect(700, 765, 100, 50);

  context.font = "18px Libre Franklin";
  context.fillStyle = "#c5c5c5";
  context.textAlign = "center";
  context.fillText(`Reset`, 750, 788);
  context.fillText(`Board`, 750, 805);

  // Draw winner/tie/next-turn info text.
  context.font = "38px Libre Franklin";
  context.textAlign = "center";

  if (model.winner) {
    context.fillStyle = model.winner;
    context.fillText(`${model.winner} Wins!!`, canvas.width / 2, 805)
  } else if (model.tied) {
    context.fillStyle = "#c5c5c5";
    context.fillText("Tie Game!!", canvas.width / 2, 805)
  } else {
    context.fillStyle = model.next;
    context.fillText(`It is ${model.next}s turn...`, canvas.width / 2, 805)
  }

  tick();
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.querySelector("#myCanvas");
  context = canvas.getContext("2d");

  splat();
})

function roundX(x) { return Math.ceil((x - 30) / 110) - 1 }
function roundY(x) { return Math.ceil((x - 90) / 110) - 1 }

document.addEventListener("click", e => {
  const [i, j] = [roundX(e.x), roundY(e.y)];

  if ((e.x > 707 && e.x < 810) && (e.y > 772 && e.y < 825)) resetBoard();
  if (model.tied) return;
  if (model.winner) return;
  if (i < 0 || i > 6) return;
  if (j < 0 || j > 5) return;

  // Get the y location that the piece falls to.
  let finalY;
  for (let m = 6; m >= 0; m--) {
    if (model.board[i][m] == '') {
      finalY = m;
      break;
    }
  }

  if (finalY !== undefined) {
    model.board[i][finalY] = model.next;
    model.totalMoves++;

    // Check for win.
    if (checkWin(i, finalY, model.next)) {
      model.winner = model.next;
      model[`${model.winner.toLowerCase()}Wins`]++;
      return;
    }

    // Check for tie.
    if (model.totalMoves == 42) {
      model.tied = true;
    }

    model.next = model.next == 'RED' ? 'YELLOW' : 'RED'
  } else {
    console.log("ERROR: Invalid placement!!!");
  }
})

function checkWin(x, y, color) {

  // Check vertical win.
  if (checkArrayWinner(model.board[x], color)) return true;

  // Check horizontal.
  let horizontalAry = [];

  for (let i = 0; i < 7; i++) {
    horizontalAry.push(model.board[i][y]);
  }

  if (checkArrayWinner(horizontalAry, color)) return true;

  // Check top left to bottom right diagnoal
  let start = { x: 0, y: 0 }

  // Get board start coordinates
  if (x > y) {
    start.x = x - y;
  } else if (x < y) {
    start.y = y - x;
  }

  let topLeftToBotRightAry = [];

  let onBoard = true;
  let currentX = start.x;
  let currentY = start.y;

  while (onBoard) {
    topLeftToBotRightAry.push(model.board[currentX][currentY]);

    currentX++;
    currentY++;

    if (currentX > 6 || currentY > 5)
      onBoard = false;
  }

  if (checkArrayWinner(topLeftToBotRightAry, color)) return true;

  //Check top right to bottom left diagnoal
  start = { x: 0, y: 0 }

  // Get board start coordinates
  if (x + y <= 6) {
    start.x = x + y;
  } else if (x + y > 6) {
    start.x = 6;
    start.y = (x + y) - 6;
  }

  let topRightToBotLeftAry = [];

  onBoard = true;
  currentX = start.x;
  currentY = start.y;

  while (onBoard) {
    topRightToBotLeftAry.push(model.board[currentX][currentY]);

    currentX--;
    currentY++;

    if (currentX < 0 || currentY > 5)
      onBoard = false;
  }

  if (checkArrayWinner(topRightToBotLeftAry, color)) return true;

  return false;
}

function checkArrayWinner(array, color) {
  let highest = 0;
  let count = 0;

  for (let i = 0; i < array.length; i++) {
    if (array[i] == color)
      count++;

    if (count >= highest)
      highest = count;

    if (array[i] != color)
      count = 0;
  }

  return highest >= 4;
}

function resetBoard() {
  let newStarter = 'RED'

  if (model.winner != undefined || model.tied == true)
    newStarter = model.next == 'RED' ? 'YELLOW' : 'RED';

  model = {
    board: makeEmptyBoard(),
    next: newStarter,
    totalMoves: 0,
    winner: undefined,
    redWins: model.redWins,
    yellowWins: model.yellowWins,
    tied: false
  }
}

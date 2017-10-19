"use strict";

// logic taken from Jan Schreiber https://codepen.io/janschreiber/pen/xZbEvM

/*

A SIMPLE TIC-TAC-TOE GAME IN JAVASCRIPT

(1) Grid layout

The game grid is represented in the array Grid.cells as follows:

[0] [1] [2]
[3] [4] [5]
[6] [7] [8]

The cells (array elements) hold the following numeric values:
0 if not occupied, 1 for player, 3 for computer.
This allows us to quickly get an overview of the game state:
if the sum of all the cells in a row/column/diagonal is 9, the computer wins,
if it is 3 and all the cells are occupied, the human player wins,
etc.

(2) Strategy of makeComputerMove()

The computer first  looks for almost completed rows, columns, and
diagonals, where there are two fields occupied either by the human
player or by the computer itself. If the computer can win by
completing a sequence, it does so; if it can block the player from
winning with the next move, it does that. If none of that applies,
it plays the center field if that's free, otherwise it selects a
random free field. This is not a 100 % certain strategy, but the
gameplay experience is fairly decent.

*/


//==================================
// EVENT BINDINGS
//==================================


//==================================
// HELPER FUNCTIONS
//==================================
function sumArray(array) {
    var sum = 0,
        i = 0;
    for (i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
}

function isInArray(element, array) {
    if (array.indexOf(element) > -1) {
        return true;
    }
    return false;
}

// accept an array argument and return the array where its elements value have already
// been shuffle
function shuffleArray(array) {
    var counter = array.length,
        temp,
        index;
    while (counter > 0) {
				// loop through the array elements starting from highest index to the
				// lowest and exchange each value with the value of any random index
				// from 0 to the length of array - 1
				// ex. if array length is 6, it will get any random number between 0 to 5
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

function intRandom(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

//==================================
// GRID OBJECT
//==================================

// Grid constructor
//=================
function Grid() {
	this.cells = new Array(9);
}

// Get free cells (has 0 as its value) in Grid.cells array
// Returns an array of indices in the original Grid.cells array, not the values of the array elements
// Their values can be accessed as Grid.cells[index]
Grid.prototype.getFreeCellIndices = function() {
	var i,
			arr = [];

	for (i = 0; i < this.cells.length; i++) {
		if (this.cells[i] === 0) {
			arr.push(i);
		}
	}

	return arr;
}

// get a row values (accepts 0, 1, or 2 as argument)
// a row combination in Grid.cells is [012], [345], or [678]
// returns the values of the elements
Grid.prototype.getRowValues = function(index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error('Wrong arg for getRowValues!');
		return null;
	}

	var i = index * 3;
	return this.cells.slice(i, i+3);
}

// get the indices of the Grid.cells row
// returns an array with the indices, not their values
Grid.prototype.getRowIndices = function(index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error('Wrong arg for getRowIndices!');
		return null;
	}

	var row = [];
	index = index * 3;
	row.push(index);
	row.push(index+1);
	row.push(index+2);
	return row;
}

// get a column values (accept 0, 1, or 2 as argument)
// a column combination in Grid.cells is [036], [147], or [258]
// returns an array containing the values of the column
Grid.prototype.getColumnValues = function(index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error('Wrong arg for getColumnValues!');
		return null;
	}

	var i, column = [];
	for (i = index; i < this.cells.length; i += 3) {
		column.push(this.cells[i]);
	}

	return column;
}

// get a column (indices)
Grid.prototype.getColumnIndices = function(index) {
	if (index !== 0 && index !== 1 && index !== 2) {
		console.error('Wrong arg for getColumnIndices!');
		return null;
	}

	var i, column = [];
	for (i = index; i < this.cells.length; i += 3) {
		column.push(i);
	}

	return column;
}

// get diagonal cells
// arg 0: from top-left
// arg 1: from top-right
Grid.prototype.getDiagValues = function(arg) {
	if (arg !== 0 && arg !== 1) {
		console.error('Wrong arg for getDiagValues!');
		return null;
	}

	var diag = [];
	if (arg === 0) {
		diag.push(this.cells[0]);
		diag.push(this.cells[4]);
		diag.push(this.cells[8]);
	} else {
		diag.push(this.cells[2]);
		diag.push(this.cells[4]);
		diag.push(this.cells[6]);
	}

	return diag;
}

// get diagonal cells indices
Grid.prototype.getDiagIndices = function(arg) {
	if (arg !== 0 && arg !== 1) {
		console.error('Wrong arg for getDiagValues!');
		return null;
	} else if (arg === 0) {
		return [0, 4, 8];
	} else {
		return [2, 4, 6];
	}
}

// Get first index with two in a row (accepts computer or player as argument)
Grid.prototype.getFirstWithTwoInARow = function (agent) {
    if (agent !== computer && agent !== player) {
        console.error("Function getFirstWithTwoInARow accepts only player or computer as argument.");
        return null;
    }
    var sum = agent * 2,
		// return an array containing the indexes of free cells
    	freeCells = shuffleArray(this.getFreeCellIndices());
	// loop through the indices of free cells and
	// for each index loop through every rows or columns
	// if the sum of rows or columns is equal to 2 * player / 2 * computer, two cells is occupied
    for (var i = 0; i < freeCells.length; i++) {
        for (var j = 0; j < 3; j++) {
            var rowV = this.getRowValues(j);
            var rowI = this.getRowIndices(j);
            var colV = this.getColumnValues(j);
            var colI = this.getColumnIndices(j);
			// if sum of row values = 2 * player or 2 * computer and
			// the current free index cell is in the row index
			// return the free index
            if (sumArray(rowV) == sum && isInArray(freeCells[i], rowI)) {
                return freeCells[i];

				// if sum of columns values = 2 * player or 2 * computer and
				// the current free index cell is in the column index
				// return the free index
            } else if (sumArray(colV) == sum && isInArray(freeCells[i], colI)) {
                return freeCells[i];
            }
        }

				// if none rows or columns are occupied in two cells
				// loop through diagonal
        for (j = 0; j < 2; j++) {
            var diagV = this.getDiagValues(j);
            var diagI = this.getDiagIndices(j);
            if (sumArray(diagV) == sum && isInArray(freeCells[i], diagI)) {
								// return the index of the two cells occupied diagonal
                return freeCells[i];
            }
        }
    }
    return false;
};

// emptied all the Grid.cells
Grid.prototype.reset = function () {
    for (var i = 0; i < this.cells.length; i++) {
        this.cells[i] = 0;
    }
    return true;
};

// GLOBAL VARIABLES
var moves = 0,			// total moves
	winner = 0,			// 0 - no winner; player(1/x) - player win; computer(3/o) - computer win
	x = 1,
	o = 3,
	player = x,
	computer = o,
	whoseTurn = x,
	gameOver = false,
	score = {
		ties: 0,
		computer: 0,
		player: 0
	},
	xText = '<span class="x">&times;</span>',
	oText = '<span class="o">o</span>',
	playerText = xText,
	computerText = oText,
	difficulty = 1,
	myGrid = null;

//==================================
// MAIN FUNCTIONS
//==================================

// execute when player clicks one of the grid cells
function cellClicked(id) {
	// The last character of the id corresponds to the numeric index in Grid.cells:
	var idName = id.toString();
	var cell = parseInt(idName[idName.length-1]);

	if (myGrid.cells[cell] > 0 || whoseTurn !== player ||  gameOver) {
		// do nothing if cell is already occupied or is not player turn or the game is over
		return false;
	}

	moves += 1;
	// make the pointer to default arrow for occupied cell (if not occupied the pointer is different)
	document.getElementById(id).style.cursor = 'default';
	// fill the board and grid cell with player symbol
	document.getElementById(id).innerHTML = playerText;
	myGrid.cells[cell] = player;

	// // randomize orientation (for looks only)
	// var rand = Math.random();
	// if (rand < 0.3) {
	// 		document.getElementById(id).style.transform = "rotate(180deg)";
	// } else if (rand > 0.6) {
	// 		document.getElementById(id).style.transform = "rotate(90deg)";
	// }

	// Test if we have a winner
	// the least move to have a winner is 5
	if (moves >= 5) {
		winner = checkWin();
	}

	if (winner === 0) {
		whoseTurn = computer;
		makeComputerMove();
	}

	return true;
}

// check if there is a winner
function checkWin() {
	winner = 0;

	// check rows
	for (var i = 0; i <= 2; i++) {
		var row = myGrid.getRowValues(i);
		if (row[0] > 0 && row[0] === row[1] && row[0] === row[2]) {
			if (row[0] === computer) {
				score.computer += 1;
				winner = computer;
			} else {
				score.player += 1;
				winner = player;
			}

			// give the winning row/column/diagonal a different bg-color
			var tmpArr = myGrid.getRowIndices(i);
			for (var j = 0; j < tmpArr.length; j++) {
				var cellID = 'cell' + tmpArr[j];
				document.getElementById(cellID).classList.add('win-color');
			}

			setTimeout(endGame, 1000, winner);
			return winner;
		}
	}

	// check columns
	for (var i = 0; i <= 2; i++) {
		var col = myGrid.getColumnValues(i)
		if (col[0] > 0 && col[0] === col[1] && col[0] === col[2]) {
			if (col[0] === computer) {
				score.computer += 1;
				winner = computer;
			} else {
				score.player += 1;
				winner = player;
			}

			var tmpArr = myGrid.getColumnIndices(i);
			for (var j = 0; j < tmpArr.length; j++) {
				var cellID = 'cell' + tmpArr[j];
				document.getElementById(cellID).classList.add('win-color');
			}

			setTimeout(endGame, 1000, winner);
			return winner;
		}
	}

	// check diagonals
	for (var i = 0; i <= 1; i++) {
		var diag = myGrid.getDiagValues(i);
		if (diag[0] > 0 && diag[0] === diag[1] && diag[0] === diag[2]) {
			if (diag[0] === computer) {
				score.computer++;
				winner = computer;
			} else {
				score.player++;
				winner = player;
			}

			var tmpArr = myGrid.getDiagIndices(i);
			for (var j = 0; j < tmpArr.length; j++) {
				var cellID = 'cell' + tmpArr[j];
				document.getElementById(cellID).classList.add('win-color');
			}

			setTimeout(endGame, 1000, winner);
			return winner;
		}
	}

	// if we haven't returned a winner by now and the board is full, it's a tie
	var emptyCells = myGrid.getFreeCellIndices();
	if (emptyCells.length === 0) {
		winner = 10;
		score.ties++;
		endGame(winner);
		return winner;
	}

	return winner;
}

// The core logic of the game AI
function makeComputerMove() {
	if (gameOver) {
		return false;
	}

	var cell = -1,
		myArr = [],
		corners = [0, 2, 6, 8]

	// the least moves to get first two same value in cells in a row is 3
	if (moves >= 3) {
		// this is computer move/turn so find the possibilities computer can win first
		// cell either contain the index of cell that two occupied in a row/column/diagonal
		// or false if no tow cells is occupied in a row/column/diagonal
		cell = myGrid.getFirstWithTwoInARow(computer);
		if (cell === false) {
			// if no two cells occupied in a row/column/diagonal for computer
			// find for player
			cell = myGrid.getFirstWithTwoInARow(player);
		}
		// if no two cells occupied for computer or player
		// find cell to fill
		if (cell === false) {
			// check center cell for un-occupied for difficulty = 1
			if (myGrid.cells[4] === 0 && difficulty === 1) {
				cell = 4;
			} else {
				// if difficulty !== 1, choose any un-occupied cell
				myArr = myGrid.getFreeCellIndices();
				cell = myArr[intRandom(0, myArr.length - 1)];
			}
		}

		// Avoid a catch-22 situation:
		if (moves == 3 && myGrid.cells[4] == computer && player == x && difficulty == 1) {
				if (myGrid.cells[7] == player && (myGrid.cells[0] == player || myGrid.cells[2] == player)) {
						myArr = [6,8];
						cell = myArr[intRandom(0,1)];
				}
				else if (myGrid.cells[5] == player && (myGrid.cells[0] == player || myGrid.cells[6] == player)) {
						myArr = [2,8];
						cell = myArr[intRandom(0,1)];
				}
				else if (myGrid.cells[3] == player && (myGrid.cells[2] == player || myGrid.cells[8] == player)) {
						myArr = [0,6];
						cell = myArr[intRandom(0,1)];
				}
				else if (myGrid.cells[1] == player && (myGrid.cells[6] == player || myGrid.cells[8] == player)) {
						myArr = [0,2];
						cell = myArr[intRandom(0,1)];
				}
		}
		else if (moves == 3 && myGrid.cells[4] == player && player == x && difficulty == 1) {
				if (myGrid.cells[2] == player && myGrid.cells[6] == computer) {
						cell = 8;
				}
				else if (myGrid.cells[0] == player && myGrid.cells[8] == computer) {
						cell = 6;
				}
				else if (myGrid.cells[8] == player && myGrid.cells[0] == computer) {
						cell = 2;
				}
				else if (myGrid.cells[6] == player && myGrid.cells[2] == computer) {
						cell = 0;
				}
		}
	} else if (moves === 1 && myGrid.cells[4] == player && difficulty == 1) {
			// if player is X and played center, play one of the corners
			cell = corners[intRandom(0,3)];
	} else if (moves === 2 && myGrid.cells[4] == player && computer == x && difficulty == 1) {
			// if player is O and played center, take two opposite corners
			if (myGrid.cells[0] == computer) {
					cell = 8;
			}
			else if (myGrid.cells[2] == computer) {
					cell = 6;
			}
			else if (myGrid.cells[6] == computer) {
					cell = 2;
			}
			else if (myGrid.cells[8] == computer) {
					cell = 0;
			}
	} else if (moves === 0 && intRandom(1,10) < 8) {
			// if computer is X, start with one of the corners sometimes
			cell = corners[intRandom(0,3)];
	} else {
			// choose the center of the board if possible
			if (myGrid.cells[4] === 0 && difficulty == 1) {
					cell = 4;
			} else {
					myArr = myGrid.getFreeCellIndices();
					cell = myArr[intRandom(0, myArr.length - 1)];
			}
	}
	var id = "cell" + cell.toString();
	// console.log("computer chooses " + id);
	document.getElementById(id).innerHTML = computerText;
	document.getElementById(id).style.cursor = "default";
	// randomize rotation of marks on the board to make them look
	// as if they were handwritten
	// var rand = Math.random();
	// if (rand < 0.3) {
	// 		document.getElementById(id).style.transform = "rotate(180deg)";
	// } else if (rand > 0.6) {
	// 		document.getElementById(id).style.transform = "rotate(90deg)";
	// }
	myGrid.cells[cell] = computer;
	moves += 1;
	if (moves >= 5) {
		winner = checkWin();
	}
	if (winner === 0 && !gameOver) {
		whoseTurn = player;
	}
}

function endGame(who) {
	if (who == player) {
        announceWinner("Congratulations, you won!");
    } else if (who == computer) {
        announceWinner("Computer wins!");
    } else {
        announceWinner("It's a tie!");
    }
    gameOver = true;
    whoseTurn = 0;
    moves = 0;
    winner = 0;
    document.getElementById("compScore").innerHTML = score.computer;
    document.getElementById("tieScore").innerHTML = score.ties;
    document.getElementById("playerScore").innerHTML = score.player;
    for (var i = 0; i <= 8; i++) {
        var id = "cell" + i.toString();
        document.getElementById(id).style.cursor = "default";
    }
    setTimeout(restartGame, 800);
}

// Executed when player hits restart button
// ask should be true if we should ask users if they want to play as X or O
function restartGame(ask) {
	if (moves > 0) {
		var response = confirm("Are you sure you want to restart over ?");
		if (response === false) {
			return;
		}
	}

	gameOver = false;
	moves = 0;
	winner = 0;
	whoseTurn = x;
	myGrid.reset();

	for (var i = 0; i <= 8; i++) {
		var id = 'cell' + i.toString();
		document.getElementById(id).innerHTML = '';
		document.getElementById(id).style.cursor = 'pointer';
		document.getElementById(id).classList.remove('win-color');
	}

	if (ask === true) {
		setTimeout(showOptions, 200);
	} else if (whoseTurn === computer) {
		setTimeout(makeComputerMove, 800);
	}
}

// executed when the page loads
function initialize() {
	myGrid = new Grid();
	moves = 0;
	winner = 0;
	gameOver = false;
	whoseTurn = player;	// default, this may change

	for (var i = 0; i < myGrid.cells.length; i++) {
		myGrid.cells[i] = 0;
	}

	setTimeout(showOptions, 500);
}

// set default option
function showOptions() {
	if (player === o) {
		document.getElementById('rx').checked = false;
		document.getElementById('ro').checked = true;
	} else if (player === x) {
		document.getElementById('rx').checked = true;
		document.getElementById('ro').checked = false;
	}

	if (difficulty === 0) {
		document.getElementById('r0').checked = true;
		document.getElementById('r1').checked = false;
	} else if (difficulty === 1) {
		document.getElementById('r0').checked = false;
		document.getElementById('r1').checked = true;
	}

	document.getElementById('optionDlg').style.display = 'block';
}

function getOptions() {
	var diffs = document.getElementsByName('difficulty');
	for (var i = 0; i < diffs.length; i++) {
		if (diffs[i].checked) {
			difficulty = parseInt(diffs[i].value);
			break;
		}
	}

	if (document.getElementById('rx').checked === true) {
		player = x;
		computer = o;
		whoseTurn = player;
		playerText = xText;
		computerText = oText;
	} else {
		player = o;
		computer = x;
		whoseTurn = computer;
		playerText = oText;
		computerText = xText;
		setTimeout(makeComputerMove, 400);
	}

	document.getElementById('optionDlg').style.display = 'none';
}

function announceWinner(text) {
    document.getElementById("winText").innerHTML = text;
    document.getElementById("winAnnounce").style.display = "block";
    setTimeout(closeModal, 1400, "winAnnounce");
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

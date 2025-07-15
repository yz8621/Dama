import R from "../common/ramda.js";
import Dama from "../common/dama.js";
import Json_rpc from "../Json_rpc.js";
import Actions from "./player.js";

const Board = Object.create(null);


//Initialization


Board.home_player = document.getElementById("home_name").value;
Board.away_player = document.getElementById("away_name").value;
const record_game = Json_rpc.method("record_game");

//The following variables encode the state of the game
//the board is the current board state
//player encodes the player with the current turn
let board = Dama.start_board(8, 8);
let player = 1;
//selectedMoveablePiece is the piece to move from, if not null
let selectedMoveablePiece = null;
//moveablePaths encodes the possible moves without capture
let moveablePaths = [];
//forcedPaths encodes the possible capture moves
//if not empty, moveablePaths is ignored
let forcedPaths = [];

//this stack is useful for take-backs
let stack = [board];

const SELECTMOVEABLE = 0;
const SELECTTARGET = 1;
const GAMEEND = 2;
//gameState switches between SELECTMOVEABLE, where player has to select
//a piece to start the move
//and SELECTTARGET, which invokes the move
//and GAMEEND, in case the move caused a win or draw
let gameState = SELECTMOVEABLE;

//adds the move and path to the moves div element
const encode_move = function (path) {
    let moveStr = "";
    if (R.type(path)===Number) {
        moveStr = `P${winning} Won!`;
    } else {
        let ids = R.map(tuple_to_id, path);
        moveStr = `P${player}: ` + R.join(" ", ids);

        //Regular expression captures a letter between a and h
        // followed by a number between 1 and 8
        // and captures it in a group called move
        //followed by a repetition of the first capture
        //g at the end means capture all
        let re = /(?<move>[a-h][1-8]) \1 /g;
        //new RegExp(`(?<move>[a-h][1-8]) \1 `, "g"); //trying to make JSLint happy

        //the replace functions replaces each match of re with
        //only one occurance of $<move>, removing neighbouring duplicates
        //I wish Ramda can do this with arrays. I wouldn't have needed the loop.
        moveStr = moveStr.replace(re, "$<move> ");
    }
    let move = document.createElement("li");
    move.textContent = moveStr;
    el("moves").appendChild(move);
};

//resets the interactive cells
const resetInteractiveCells = () => {
    forcedPaths = [];
    moveablePaths = [];
};

//computes all possible moves and reflects them on the board
//called once per turn
Board.ply = function () {
    resetInteractiveCells();
    let captures = [];
    //starts by computing and collecting possible captures for all pieces
    let countVecOuter = R.range(0, board.length).map((row) => {
        let countVec = R.range(0, board[0].length).map((column) => {
            let cap = Dama.piece_capture_count(board, player, [row, column]);
            if (cap[0]>0) {captures.push(cap);}
            return cap[0];
        });
        return R.reduce(R.max, 0, countVec);
    });
    //if captures are possible, only the maximum ones are legal
    //filter accordingly
    if (captures.length>0){
        let max = R.reduce(R.max, 0, countVecOuter);
        R.map((cap) =>{
            if (cap[0]===max) {
                R.map((path) =>{
                    moveablePaths.push(path);
                    forcedPaths.push(path);
                }, cap[1]);
            }
        }, captures);
        Board.redraw_board();
        return;
    }
    //if no captures are possible, compute all possible moves
    R.range(0, board.length).map((row) => {
        R.range(0, board[0].length).map((column) => {
            let paths = Dama.possible_moves(board, player, row, column);
            R.map((path) =>{
                moveablePaths.push(path);
            }, paths);
        });
    });
    Board.redraw_board();
};

//array of colours to distinguish the different forced paths
const forcedPathColors= ["#c37b64", "#af788a", "#9ba981", "#8d94b6", "#7ba77b", "coral"];
//utility array to simplify icon lookup
const playerIconIds = ["", "p1Icon", "p2Icon"];

//utility function to simplify 
const el = (id) => {return document.getElementById(id);};

//functions to map visualization to stylesheet
const setMoveable = function (cell) {
    cell.style = ""; //I had to add this for the class to apply
    cell.className = "moveableCell";
};

const setMoveableSelected = function (cell) {
    cell.style = "";
    cell.className = "moveableSelected";
};

const setTarget = function (cell) {
    cell.style = "";
    cell.className = "targetCell";
};

const setForcedPath = function (pathIdx, cell) {
    cell.style.background = `${forcedPathColors[pathIdx]}`;
};

const highlight_player = function (player) {
    let playerIcon = el(playerIconIds[player]);
    playerIcon.style.border = "4px solid lightgreen";
};

const dim_player = function (player) {
    let playerIcon = el(playerIconIds[player]);
    playerIcon.style.border = "1px solid white";
};

// if tuple is 0,1 , this returns a1
//maps row, column to game board element id
const tuple_to_id = (tuple) => `${colLabels[tuple[1]] + (tuple[0]+1)}`;

//similarly for the first cell in the path
const first_onpath_to_id = (path) => {
    return tuple_to_id(path[0]);};
//similarly for the last cell in the path
const last_onpath_to_id = (path) => {return tuple_to_id(path[path.length-1]);};

const startsWithMoveable = function (path) {
    return R.equals(path[0], selectedMoveablePiece);
};

//redraws the board
//called after every move
Board.redraw_board = function (width =8, height =8) {
    //sets default value to all cells
    R.range(0, height).map(function (row) {
        R.range(0, width).map(function (col) {
            let ch = colLabels[col];
            let cell = el(`${ch + (row+1)}`);
            cell.textContent = board[row][col];
            cell.style.border = "none";
            cell.style.background = "#e8c098";
        });
    });

    //set player turn by highlighting their icon and dimming the opposing player's
    highlight_player(player);
    dim_player(3-player); //3-player means other player

    //reflect the possible moves and forced targets on the board for
    //the player to select from
    //path should start with selected piece
    if (gameState === SELECTTARGET && selectedMoveablePiece!==null) {
        if (forcedPaths.length === 0) {
            R.filter(startsWithMoveable, moveablePaths).map(last_onpath_to_id).map(el).map(setTarget);
            //the user can still change their mind and select another moveable piece
            R.map(first_onpath_to_id, moveablePaths).map(el).map(setMoveable);
        } else {
            R.filter(startsWithMoveable, forcedPaths).map(last_onpath_to_id).map(el).map(setTarget);
        }
        setMoveableSelected(el(tuple_to_id(selectedMoveablePiece)));
    } else if (gameState === SELECTMOVEABLE && selectedMoveablePiece === null) {
        //reflect the start positions for the player to select from 
        if (forcedPaths.length === 0) {
            R.map(first_onpath_to_id, moveablePaths).map(el).map(setMoveable);
        } else {
            R.map(last_onpath_to_id, forcedPaths).map(el).map(setTarget);
            R.map(first_onpath_to_id, forcedPaths).map(el).map(setMoveable);
        }
    }

    //change background of each path i to forcedPathColor i
    R.range(0, forcedPaths.length).map(function (i) {
        R.map(tuple_to_id, forcedPaths[i]).map(el).map(function (cell) {
            setForcedPath(i, cell);
        });
    });
    let playerStr = player===1 ? Board.home_player : Board.away_player;
    if (gameState === SELECTMOVEABLE && stack.length>1) {
        el("helperText").textContent = `${playerStr}!
        Select a Highlighted Piece to Move`;
    } else if (gameState === SELECTTARGET) {
        el("helperText").textContent = `${playerStr}! 
        Select a Target Spot (end of a path)`;
    }
};

//utility array to map indeces to column names
const colLabels = ["a", "b", "c", "d", "e", "f", "g", "h"];

//create the game board elements
Board.newBoard = function (height, width) {
    let damaBoard = document.createElement("table");

    R.range(1, height + 1).map(function (rowIndex) {
        let row = document.createElement("tr");
        R.range(0, width).map(function (colIndex) {
            let cell = cell_setup(rowIndex, colIndex);
            row.appendChild(cell);
            
        });
        row.appendChild(row_index_cell(rowIndex));
        damaBoard.appendChild(row);
    });
    let lastRow = document.createElement("tr");
    R.range(0, width).map(function(col) {
        let cell = column_index_cell(col);
        lastRow.appendChild(cell);
    });

    damaBoard.appendChild(lastRow);
    return damaBoard;
};

const forced_ntimes = function (idTuple) {
    const endsWith = (path) => R.equals(path[path.length-1], idTuple);
    return R.count(endsWith,forcedPaths);
};

//makes the move and records the path on the screen
//updates statistics on the server in case of an endgame
//switches player after the turn is done
//updates stack to handle take back
//prepares board and game state for next move
const handle_make_move = function (path) {
    board = Dama.make_move(board, player, path);
    encode_move(path);
    let winning = Dama.who_has_won(board);
    if (winning === 1 || winning === 2) {
        record_game(Board.home_player, Board.away_player, winning).then(
            Actions.update_statistics(Board.home_player, Board.away_player));
        el("result_winner").textContent = `Player ${winning} Wins!`;
        el("result_dialog").showModal();
        gameState = GAMEEND;
        encode_move(winning);
        reset_game();
    } else {
        player = 3 - player;
        stack.push(board);
    }
    gameState = SELECTMOVEABLE;
    selectedMoveablePiece = null;
    Board.ply();
};

//accessibility cells to make the board readable
//rows from 1-8
const row_index_cell = function (row) {
    let indexCell = document.createElement("td");
    let name = `${row}`;
    indexCell.id = `ic${name}`;
    indexCell.className = "rowIndexCell";
    indexCell.textContent = name;
    indexCell.tabIndex = -1;
    return indexCell;
};
//columns from a-h
const column_index_cell = function (column) {
    let indexCell = document.createElement("td");
    let name = colLabels[column];
    indexCell.id = `rc${name}`;
    indexCell.className = "columnIndexCell";
    indexCell.textContent = name;
    indexCell.tabIndex = -1;
    return indexCell;
};

//sets up the gameboard cells and connects them to their handling function
const cell_setup = function (row, col) { //row: from 1-8, col: from 0-7
    let ch = colLabels[col];
    let cell = document.createElement("td");
    let width = board[0].length;
    let height = board.length;

    let name = `${ch + row}`;
    cell.setAttribute("name", name);
    cell.textContent = name;
    cell.className = "moveableCell";
    cell.id = name;

    cell.tabIndex = 0;
    cell.setAttribute("aria-label", "Cell" + name);

    //interactive heart of the game
    //handles most user interaction
    //players click to select a piece to move
    //then select target position
    cell.onclick = function () {
        const startsWithClickedCell = function (path) {
            return R.equals(path[0], [row-1, col]);
        };
        const endsWithClickedCell = function (path) {
            return R.equals(path[path.length-1], [row-1, col]);
        };
        const startsSelectedEndsTarget = function (path) {
            return startsWithMoveable(path) && endsWithClickedCell(path);
        };
        let selPath = null;

        //at this point, players must select a piece to move
        //piece must be the beginning of the capture path or a moveable path
        if (selectedMoveablePiece === null && gameState === SELECTMOVEABLE) {
            //go through each path in moveablePaths and compare the first cell
            //with [row-1, col]
            //if found, set the cell selectable
            if (forcedPaths.length === 0) {
                selPath = R.find(startsWithClickedCell, moveablePaths);
                if (selPath) {
                    selectedMoveablePiece = [row-1, col];
                    gameState = SELECTTARGET;
                }
            } else {
                selPath = R.find(startsWithClickedCell, forcedPaths);
                if (selPath) {
                    selectedMoveablePiece = [row-1, col];
                    gameState = SELECTTARGET;
                }
            }
        } else if (gameState === SELECTTARGET && selectedMoveablePiece!==null) {
            //at this point player must select a target position
            //position must be at the end of a moveable path or forced moveable path
            let matches = [];
            if (forcedPaths.length === 0) {
                matches = R.filter(startsSelectedEndsTarget, moveablePaths);
                if (matches.length===1) {
                    //move happens here
                    handle_make_move(matches[0]);
                } else if (matches.length>1) {
                    //This cannot happen!
                    //Branch kept for completion
                } else {
                    selPath = R.find(startsWithClickedCell, moveablePaths);
                    if (selPath) {
                        selectedMoveablePiece = [row - 1, col];
                        gameState = SELECTTARGET;
                    }
                }
            } else {
                matches = R.filter(startsSelectedEndsTarget, forcedPaths);
                if (matches.length===1) {
                    //move happens here
                    handle_make_move(matches[0]);
                } else if (matches.length>1) {
                    //mostly, this code will never be executed 
                    //written for completion
                    //dialog showing multiple paths to select from
                    //if targetPiece is the target of more than one forcedPath, x
                    //pop up a dialog box for the use to pick the path x
                    let matchString = R.range(0, matches.length).map(function (index) {
                        return `P${index+1}: ` + encode_move(matches[index]);
                    }).join(`\n`);
                    let response = "";
                    let responseID = -1;
                    while (response==="") {
                        response = prompt(`You have several capture paths \n
Select one of them by typing its ID: \n` + matchString, "P1");
                        responseID = parseInt(response[1]);
                        if (response[0] !== "P" || responseID >= matches.length || responseID < 1) {
                            response = "";
                        }
                    }
                    //move happens here
                    handle_make_move(matches[responseID - 1]);
                } else {
                    //player might change their mind and start with another piece
                    selPath = R.find(startsWithClickedCell, forcedPaths);
                    if (selPath) {
                        selectedMoveablePiece = [row - 1, col];
                        gameState = SELECTTARGET;
                    }
                }
            }
        }
        Board.redraw_board();
    };
    //accessibility optional action with keyboard
    cell.addEventListener("keypress", function(event){
        if (event.key === "Enter" || event.code === "Space") {
            cell.onclick();
            return;
        }
    });
    //accessibility optional gameboard navigation with keyboard
    cell.addEventListener("keydown", function(event){
        if (event.code === "ArrowLeft") {
            if (col>0) {
                cell.previousSibling.focus();
            }
            return;
        }
        if (event.code === "ArrowRight") {
            if(col<width) {
                cell.nextSibling.focus();
            }
        }
        if (event.code === "ArrowUp") {
            if (row>0) {
                el(tuple_to_id([row-2, col])).focus()
            }
        }
        if (event.code === "ArrowDown") {
            if (row<height) {
                el(tuple_to_id([row, col])).focus()
            }
        }
    });
    return cell;
};

const reset_game = function () {
    board = Dama.start_board(8, 8);
    player = 1;
    stack = [board];
    resetInteractiveCells();
    selectedMoveablePiece = null;
    gameState = SELECTMOVEABLE;
    el("moves").textContent= "";
};

Board.req_draw = function (p) {
    let confirmation = confirm(`Player ${p} requests a draw`);
    if (confirmation) {
        el("result_message").textContent = `It's a Draw!`;
        el("result_winner").textContent = `Both Players Win`;

        record_game(Board.home_player, Board.away_player, 0).then(
            Actions.update_statistics(Board.home_player, Board.away_player));
        
        el("result_dialog").showModal();
        gameState = GAMEEND;
        reset_game();
    }
    return;
};

Board.take_back = function (p) {
    if (player === p) {
        alert("A player can request take back only after they make a move");
    } else if (stack.length <= 1) {
        alert("No moves to take back");
    } else {
        let confirmation = confirm(`Hi Player ${player}!\n` +
            `Player ${p} requested to take back their last move.\n` +
            `Kindly confirm by pressing OK.`);
        if (confirmation) {
            stack.pop();
            board = stack[stack.length - 1];

            el("moves").removeChild(el("moves").lastElementChild);
            Board.redraw_board();
            player = p;
            Board.ply();
        }
    }
    return;
};

Board.resign = function (p) {
    el("result_message").textContent = `Congratulations!`;
    el("result_winner").textContent = `Player ${3-p} Wins!`;

    record_game(Board.home_player, Board.away_player, 3-p).then(
        Actions.update_statistics(Board.home_player, Board.away_player));

    el("result_dialog").showModal();
    gameState = GAMEEND;
    reset_game();
};


el("result_dialog").onclick = function () {
    reset_game();
    el("result_dialog").close();
    Board.newBoard(8, 8);
    Board.redraw_board();
    Board.ply();
};

el("result_dialog").onkeydown = el("result_dialog").onclick;

export default Object.freeze(Board);

import R from "./ramda.js";

const DOWN = 0;
const UP = 1;
const LEFT = 2;
const RIGHT = 3;

/**
 * Dama.js is a module to model and play "Dama", also known as
 *  "Turkish Draughts".
 * https://en.wikipedia.org/wiki/Turkish_draughts
 * @namespace Dama
 * @author Yasmin A. Zaraket
 * @version 2021/22
 */
const Dama = Object.create(null);

/**
 * A Board is a two-dimensional array that Dama pieces (called "pieces")
 *  can be moved on with every ply.
 * Each player has 16 pieces already in position at the start of the game.
 * The board is implemented as an array of rows.
 * @memberof Dama
 * @typedef {Dama.Piece_or_empty[][]} Board
 */

/**
 * A piece is a coloured disk that players move on the grid.
 * @memberof Dama
 * @typedef {(1 | 2)} Token
 */

/**
 * Either a Man or an empty position.
 * @memberof Dama
 * @typedef {(Dama.Token | 0)} Piece_or_empty
 */

/**
 * This function return a printable string of a given board
 * @memberof Dama
 * @property {array} board A board with positioned pieces
 * @returns {string} A " | " separated string with each row on a line
 */
Dama.board_to_string = function (board) {
    return R.map(function (row) {
        return R.join(" | ", row);
    }, board).join("\n");
};

/**
 * A set of template piece strings for {@link Dama.to_string_with_piece}.
 * Concept inherited from Connect4 example.
 * @memberof Dama
 * @enum {string[]}
 * @property {string[]} default ["0", "1", "2"] Displays men by their index.
 * @property {string[]} disks [" ", "⛀", "⛂"]
 * Displays men as coloured disks.
 * @property {string[]} queens [" ", "♕", "♛"]
 * Displays men as queens. (When they reach the opposite side of the board)
 */
Dama.piece_strings = Object.freeze({
    "default": ["0", "1", "2"],
    "disks": [" ", "⛀", "⛂"],
    "queens": [" ", "♕", "♛"]
});

/*
* returns the id of the opponent player from player
* 1 --> 2, 2--> 1
*/
const opponent = (player) => 3 - player;

/* The following objects provide utilities to help with moves in the specified
 * directions.
 * They compute the target row, column, move position,
 * whether coordinates of position are legal,
 * coordinates of move are legal,
 * board position of move is empty
 * move is logically possible.
 * I created four different objects (left, right, up, down)
 * to allow polymorphic behaviour as I handle
 * moves in different directions using the same logic with different parameters.
 * Currying with R helps create arrays of functions curried with preprepared
 * direction objects.
*/

const mu_left = Object.create(null);
mu_left.left = 1;
mu_left.right = 0;
mu_left.down = 0;
mu_left.up = 0;

const mu_right = Object.create(null);
mu_right.left = 0;
mu_right.right = 1;
mu_right.down = 0;
mu_right.up = 0;

const mu_down = Object.create(null);
mu_down.left = 0;
mu_down.right = 0;
mu_down.down = 1;
mu_down.up = 0;

const mu_up = Object.create(null);
mu_up.left = 0;
mu_up.right = 0;
mu_up.down = 0;
mu_up.up = 1;

//utility functions start
const mr = function (dir, r) {
    return r - dir.up + dir.down; //encodes move a row
};
const mc = function (dir, c) {
    return c - dir.left + dir.right; //encodes move a column
};

// return the position resulting from move
const mpos = function (dir, r, c) {
    return [mr(dir, r), mc(dir, c)];
};

// returns whether coordinates are in board limits
const is_in_limits = function (bu, dir, r, c) {
    //dir is kept for curry consistency. Sorry jslint
    return r >= 0 && c >= 0 && r < bu.w() && c < bu.h();
};
// returns whether coordinates of move are in board limits
const is_move_in_limits = function (bu, dir, r, c) {
    return is_in_limits(bu, dir, mr(dir, r), mc(dir, c));
};
// returns the value of the move position on the board
const move_board_pos = function (bu, dir, r, c) {
    return bu.val(mr(dir, r), mc(dir, c));
};
// returns whether the board position is empty
const is_move_board_empty = function (bu, dir, r, c) {
    let x = move_board_pos(bu, dir, r, c);
    return x === Dama.piece_strings.disks[0];
};
// returns whether the move is logically possible
const can_move = function (bu, dir, r, c) {
    return is_move_in_limits(bu, dir, r, c) &&
    is_move_board_empty(bu, dir, r, c);
};

/*
* The b_util Object houses utility functions that help
* work with a board and a player.
* it provides the width and height of the board,
* the value of a given cell,
* whether the cell belongs to current player,
* whether the cell belongs to opponnent  player,
* whether the cell is a queen,
* and whether the player can capture in the specified
* direction at the current board.
*
* it also provides access to pre-prepared mu_dir objects
* in each of the four directions organized to be called
* with DOWN, UP, LEFT, RIGHT array indeces for convenience of use
* of mu_dir functions with Ramda.
*/

const b_util = Object.create(null);
//sets board and player for b_util to work
b_util.set = function (board, player) {
    b_util.board = board;
    b_util.player = player;
//    b_util.curry_all();
};
//Initialization
b_util.board = [];
b_util.player = 1;
//return width of the board
b_util.w = function () {
    return b_util.board[0].length;
};
//returns height of the board
b_util.h = function () {
    return b_util.board.length;
};
//returns value of the cell at row, column
b_util.val = function (r, c) {
    return b_util.board[r][c];
};
//convenience array with direction objects
b_util.dirs = [mu_down, mu_up, mu_left, mu_right];

//utility function to curry all move direction functions
//with preprepared direction objects
b_util.curry_all = function () {
    b_util.mr = R.map(function (dir) {
        return R.curry(mr)(dir);
    }, b_util.dirs);

    b_util.mc = R.map(function (dir) {
        return R.curry(mc)(dir);
    }, b_util.dirs);

    // return the position resulting from move
    b_util.mpos = R.map(function (dir) {
        return R.curry(mpos)(dir);
    }, b_util.dirs);
    // returns whether coordinates are in board limits
    b_util.is_in_limits = R.map(function (dir) {
        return R.curry(is_in_limits)(b_util, dir);
    }, b_util.dirs);
    // returns whether coordinates of move are in board limits
    b_util.is_move_in_limits = R.map(function (dir) {
        return R.curry(is_move_in_limits)(b_util, dir);
    }, b_util.dirs);
    // returns the value of the move position on the board
    b_util.move_board_pos = R.map(function (dir) {
        return R.curry(move_board_pos)(b_util, dir);
    }, b_util.dirs);
    // returns whether the board position is empty
    b_util.is_move_board_empty = R.map(function (dir) {
        return R.curry(is_move_board_empty)(b_util, dir);
    }, b_util.dirs);
    // returns whether the move is logically possible
    b_util.can_move = R.map(function (dir) {
        return R.curry(can_move)(b_util, dir);
    }, b_util.dirs);
};

b_util.curry_all();

b_util.can_capture = function (dir, r, c) {
    let mu_dir = b_util.dirs[dir];
    let moveR = mr(mu_dir, r);
    let moveC = mc(mu_dir, c);
    return b_util.is_opponent_rc(moveR, moveC) && b_util.is_move_board_empty[
        dir
    ](moveR, moveC);
};


b_util.is_player_rc = function (r, c) {
    return b_util.val(r, c) === Dama.piece_strings.disks[b_util.player] ||
    b_util.val(r, c) === Dama.piece_strings.queens[b_util.player];
};
b_util.is_player = function (piece_val) {
    return piece_val === Dama.piece_strings.disks[b_util.player] ||
    piece_val === Dama.piece_strings.queens[b_util.player];
};
//checks if piece with value piece_val belongs to opponent of player
b_util.is_opponent = function (piece_val) {
    let op = opponent(b_util.player);
    return piece_val === Dama.piece_strings.disks[
        op
    ] || piece_val === Dama.piece_strings.queens[op];
};
//checks if piece at (r,c) belongs to opponent of player
b_util.is_opponent_rc = function (r, c) {
    return b_util.is_opponent(b_util.val(r, c));
};
//checks if piece at (r,c) is queen of player
b_util.is_queen = function (r, c) {
    return b_util.val(r, c) ===
    Dama.piece_strings.queens[b_util.player];
};
b_util.is_empty = function (r, c) {
    return b_util.val(r, c) === Dama.piece_strings.disks[0];
};


/**
 * Creates a new empty board.
 * Standard: 8 wide and 8 high board.
 * @memberof Dama
 * @function
 * @param {number} [width = 8] The width of the new board.
 * @param {number} [height = 8] The height of the new board.
 * @returns {Array} New empty board.
 */
Dama.empty_board = function (width = 8, height = 8) {
    let board = R.range(0, width).map(function () {
        return R.repeat(Dama.piece_strings.disks[0], height);
    });
    return board;
};

/**
 * Creates a start board with player pieces
 * By default, the board has 16 pieces per player starting from the second row
 * from the perspective of the player
 * @memberof Dama
 * @function
 * @param {number} [width = 8] The width of the start board
 * @param {number} [height = 8] The height of the start board
 * @returns {Array} Standard start board with player pieces
 */
Dama.start_board = function (width = 8, height = 8) {
    let board = Dama.empty_board(width, height);
    board[1] = R.repeat(Dama.piece_strings.disks[1], width);
    board[2] = R.repeat(Dama.piece_strings.disks[1], width);

    board[5] = R.repeat(Dama.piece_strings.disks[2], width);
    board[6] = R.repeat(Dama.piece_strings.disks[2], width);

    return board;
};

/**
 * Computes a list of all possible and legal moves
 * of the chosen piece (specified by {row} and {column})
 * for the specified {player} starting from the given {board}
 * Returns an empty list in case no legal moves are possible
 * @memberof Dama
 * @function
 * @param {array} board The board with positioned pieces
 * @param {number} player Either player 1 or 2
 * @param {number} row Row index of the chosen piece to move
 * @param {number} column Column index of the chosen piece to move
 * @throws {InvalidArgumentException} Throws an exception in case the peice
 *  at ({row} , {column}) does not belong to specified {player}
 * @returns {array} List of all possible and legal moves for the chosen piece
 */
Dama.possible_moves = function (board, player, row, column) {
    b_util.set(board, player);
    if (!b_util.is_player_rc(row, column)) {
        return [];
    }

    //handle Queen piece
    let moveablePaths = [];
    if (b_util.is_queen(row, column)) {

        //handle all four directions
        R.range(0, 4).map(function (dir) {
            let curRow = row;
            let curColumn = column;
            let path = [[row, column]];

            //detect sequence of empty spaces
            while (b_util.can_move[dir](curRow, curColumn)) {
                curRow = b_util.mr[dir](curRow);
                curColumn = b_util.mc[dir](curColumn);
                path.push([curRow, curColumn]);
                moveablePaths.push(path);
                path = R.clone(path);
            }
        });
        return moveablePaths;
    }

    //handle regular piece
    R.range(0, 4).map(function (dir) {  //handle four directions
        if (b_util.can_move[dir](row, column)) {
            //player 1 regular piece cannot move up
            if (player === 1 && dir === UP) {
                return;
            }
            //player 2 regular piece cannot move down
            if (player === 2 && dir === DOWN) {
                return;
            }
            let path = [[row, column], b_util.mpos[dir](row, column)];
            moveablePaths.push(path);
        }
    });
    return moveablePaths;
};

//appends the prefix over each path from resultDirection
// then adds the resulting paths into result
const append_paths = function (prefix, result, resultDirection) {
    return R.concat(result, R.map(R.concat(prefix), resultDirection));
};

/**
 * Computes the number of opponent"s pieces the specified {player}"s {piece}
 * (not queen) can capture with regards to the {board}
 * @memberof Dama
 * @function
 * @param {array} board The board with positioned pieces
 * @param {number} player Either player 1 or 2
 * @param {array} piece Tuple of the selected {piece}"s
 * (not queen) row and column
 * @returns {Array} Returns the maximum number of the opponent"s pieces the
 * selected {piece} can capture along with the
 *  possible paths that execute the capture
 */
Dama.piece_capture_count = function (board, player, piece) {
    b_util.set(board, player);
    let row = piece[0];
    let column = piece[1];

    if (!b_util.is_player_rc(row, column)) {
        return [0, []];
    }
    //if the specified peice is a queen, call the queen version of this function
    if (b_util.is_queen(row, column)) {
        return Dama.queen_capture_count(board, player, piece);
    }

    //compute the directions in which a capture is possible
    let canCapture = [
        // only player 1 can move/capture down with regular piece
        (player === 1 && row <= b_util.h() - 3) && b_util.can_capture(
            DOWN,
            row,
            column
        ),
        // can peice capture down
        //only player 2 can move/capture up with regular piece
        (player === 2 && row >= 2) && b_util.can_capture(UP, row, column),
         // can peice capture up
        (column >= 2) && b_util.can_capture(LEFT, row, column),
        // can peice capture left
        (column <= b_util.w() - 3) && b_util.can_capture(RIGHT, row, column)
    ];
        // can peice capture right

    //if no capture is possible, return an empty result
    if (!R.reduce(R.or, false, canCapture)) {
        return [0, []];
    }

    //initialize result (format [count, paths]) for each direction
    let recResults = R.repeat(R.clone([0, []]), 4);

    //preprare the prefix of the capture path for each direction
    let prefixes = [[[row, column], [row + 1, column], [row + 2, column]],
                    //capture down prefix
        [[row, column], [row - 1, column], [row - 2, column]],
        //capture up prefix
        [[row, column], [row, column - 1], [row, column - 2]],
        //capture left prefix
        [[row, column], [row, column + 1], [row, column + 2]]];
        //capture up prefix

    let maxVec = R.range(0, 4).map(function (i) {
        if (!canCapture[i]) {
            return 0;
        }
        //if can not capture in this direction return 0
        let board1 = R.clone(board);
        // clone the board for recursion
        //on capture, current peice and capture oponent peices become empty
        board1[row][column] = Dama.piece_strings.disks[0];
        board1[prefixes[i][1][0]][prefixes[i][1][1]] = Dama.piece_strings.disks[
            0
        ];
        //the target move spot was empty and now
        // becomes occupied with player peice
        board1[prefixes[i][2][0]][prefixes[i][2][1]] = Dama.piece_strings.disks[
            player
        ];
        if (
            (i === DOWN && row + 2 === b_util.h() - 1)
            || (i === UP && row - 2 === 0)
        ) {
            //in case peice was promoted to queen, place a queen
            board1[prefixes[i][2][0]][prefixes[i][2][1]] =
            Dama.piece_strings.queens[player];
           // continue recursively with queen_capture_count
            recResults[i] = Dama.queen_capture_count(
                board1,
                player,
                [prefixes[i][2][0], prefixes[i][2][1]]
            );
        } else {
            //continue recursively
            recResults[i] = Dama.piece_capture_count(
                board1,
                player,
                [prefixes[i][2][0], prefixes[i][2][1]]
            );
        }
        return recResults[i][0];
        //return the number of possible captured pieces in board1
    });
    //get the max number of captured pieces, paths capturing
    // less than max will be discarded
    let max = R.reduce(R.max, 0, maxVec);
    let result = [max + 1, []];
    if (max === 0) {
        //if no subsequent capture is possible return
        // the possible captures at this step
        let sel = R.range(0, 4).filter(function (i) {
            return canCapture[i];
        });
        //returns list of indices with true in canCapture
        let selectFunc = R.compose(R.values, R.pickAll);
        return [max + 1, selectFunc(sel, prefixes)];
    }
    R.range(0, 4).map(function (i) {
        if (recResults[i][0] === max) {
            result[1] = append_paths(prefixes[i], result[1], recResults[i][1]);
        }
    });
    return result;
};


 /**
 * Computes the number of opponent"s pieces the specified {player}"s {queen}
 * can capture with regards to the {board}
 * @memberof Dama
 * @function
 * @param {array} board The board with positioned pieces
 * @param {number} player Either player 1 or 2
 * @param {array} queen Tuple of the selected {queen}"s row and column
  * @returns {Array} Returns the maximum number of the opponent"s pieces the
 *  selected {queen} can capture along with the possible
 *  paths that execute the capture
 */
Dama.queen_capture_count = function (board, player, queen) {
    let row = queen[0];
    let column = queen[1];
    b_util.set(board, player);

    if (!b_util.is_player_rc(row, column)) {
        return [0, []];
    }

    //check if the queen can capture left, right, up down
    //if it can not capture, return an empty result [0,[]]
    //if it can, the queen can land on multiple target spots
    // [q] _ _ o _ _ _ x   ---> _ _ _ _ ? ? ? x
    // all three paths have the same prefix: _ _ _ _ ?

    // for each target spot/prefix, transform the board and
    // recursively call queen_capture_count

    //collect the results for each direction,
    //keep the ones with  the maximum number of captured pieces
    //append the prefix of the capture to collected recursive Results
    // and return.

    //the queen can capture left if there is a sequence of spaces,
    // a single opponent peice, then a sequence of spaces in the left
    // direction.
    const can_q_capture_dir = function (dir) {
        let path = [[row, column]];

        let curRow = row;
        let curCol = column;
        while (
            b_util.is_move_in_limits[dir](curRow, curCol)
            && b_util.is_move_board_empty[dir](curRow, curCol)
        ) {
            curRow = b_util.mr[dir](curRow);
            curCol = b_util.mc[dir](curCol);
            path.push([curRow, curCol]);
        }
        if (!b_util.is_move_in_limits[dir](curRow, curCol)) {
            return [0, []];
        }
        if (!b_util.is_opponent(b_util.move_board_pos[dir](curRow, curCol))) {
            return [0, []];
        }
        curRow = b_util.mr[dir](curRow);
        curCol = b_util.mc[dir](curCol);
        path.push([curRow, curCol]);
        //
        //At this point board[curRow][curCol] has an oponent peice
        // next to queen in the selected direction (maybe separated with spaces)
        // o _ _ [q] _ _ _ _
        if (!b_util.is_move_in_limits[dir](curRow, curCol)) {
            return [0, []];
            //in this case, the opponent peice is protected by the wall
        }
        if (!b_util.is_move_board_empty[dir](curRow, curCol)) {
            // x o _ _ [q] _ _ _ // not protected by the wall, but has our peice
            return [0, []];
        }
        //  _ x _ _ o _ _ [q]
        curRow = b_util.mr[dir](curRow);
        curCol = b_util.mc[dir](curCol);
        path.push([curRow, curCol]);
        let result = [1, [path]];
        // this is the capture path with the smallest length
        // result: [1, [_ o _ _ q]]

        //the following loop computes all longer paths that capture the same
        //opponent piece but have other ending positions (if any).
        while (
            b_util.is_move_in_limits[dir](curRow, curCol)
            && b_util.is_move_board_empty[dir](curRow, curCol)
        ) {
            curRow = b_util.mr[dir](curRow);
            curCol = b_util.mc[dir](curCol);
            path = R.clone(path);
            path.push([curRow, curCol]);
            result[1].push(path);
            // result: [1, [_ o _ _ q, _ _ o _ _ q]]
        }
        return result;
    };
    let prefixes = [can_q_capture_dir(DOWN), // for down
        can_q_capture_dir(UP), // for up
        can_q_capture_dir(LEFT), // for left
        can_q_capture_dir(RIGHT) // for right
    ];
    //if no capture is possible return an empty result.
    if (R.reduce(R.max, 0, R.range(0, 4).map(function (i) {
        return prefixes[i][0];
    })) === 0) {
        return [0, []];
    }
    //here we are sure queen can capture one peice at least in one direction

    //create containers to collect recursive results per direction.
    //The format will be [ [num_of_captures1, prefix1, path1],
    // [num_of_captures2, prefix2, path2], ... ]
    let recPathResults = [];

    //Transform the board and recursively apply queen_capture_count for
    //each direction with a possible capture.
    let maxVecOuter = R.range(0, 4).map(function (i) {// for each direction
        if (prefixes[i][0] === 0) {
            return 0;
        }
        let board1 = R.clone(board);
        //set the player"s peice to empty
        // _ o _ _ q  --> _ o _ _ _
        board1[row][column] = Dama.piece_strings.disks[0];

        //the peice to capture is the one before last in the first path
        let firstPath = prefixes[i][1][0];
        let rowCapture = firstPath[firstPath.length - 2][0];
        let colCapture = firstPath[firstPath.length - 2][1];
        board1[rowCapture][colCapture] = Dama.piece_strings.disks[0];
        // _ o _ _ _  --> _ _ _ _ _

        //now for each path set the target peice to player"s queen
        // and proceed recursively collecting the number of possible
        // captures per call.
        let maxVec = R.map(function (prefix) {//for each path in direction i
            let board2 = R.clone(board1);
            let targetRow = prefix[prefix.length - 1][0];
            let targetCol = prefix[prefix.length - 1][1];

            board2[targetRow][targetCol] = Dama.piece_strings.queens[player];
            // _ o _ _ q -->... --> _ _ _ _ _  --> q _ _ _ _
            let pathResults = Dama.queen_capture_count(
                board2,
                player,
                [targetRow, targetCol]
            );
            // pathResults = [captureCount, [recPath1, recPath2, ...]]
            // append it to recPathResults in the following format
            // [ [prevCaptureCount, prefix, prevCapturePath1], ...,
            // [prevCaptureCount, prefix, prevCapturePathX], ...
            //   , [captureCount, prefix, recPath1],
            // [captureCount, prefix, path2], ...]
            R.map((path) => recPathResults.push(
                [pathResults[0], prefix, path]
            ), pathResults[1]);
            return pathResults[0];
        }, prefixes[i][1]);
        return R.reduce(R.max, 0, maxVec);
    });
    let max = R.reduce(R.max, 0, maxVecOuter);

    let result = [1, []];
    if (max === 0) {
        //format prefixes correctly and return
        R.range(0, 4).map(function (i) {// for each direction
            if (prefixes[i][0] === 0) {
                return 0;
            }

            R.map(function (prefix) {//for each path in direction i
                result[1].push(prefix);
            }, prefixes[i][1]);
            return 1;
        });
        return result;
    }
    //select the paths in recPathResults that have maximum capture count
    //append the prefix of each path to it,
    //set the number of captures to 1+max
    //return the result
    result[0] = 1 + max;
    R.map(function (flatResult) {//for each path in direction i
        if (flatResult[0] === max) {
            result[1].push(
                R.concat(flatResult[1], flatResult[2])
            );
        }
    }, recPathResults);

    return result;
};

/**
 * Computes whether the chosen {piece} for a specified {player} can move
 * with regards to the {board}. A {piece} is moveable if it can capture
 * the maximum number of the opponent"s pieces in one turn. If no capture is
 * possible, then a piece is moveable if it is not blocked
 * @memberof Dama
 * @function
 * @param {array} board The board with positioned pieces
 * @param {number} player Either player 1 or 2
 * @param {array} piece Tuple of the selected {piece}"s row and column
 * @returns {number} Returns 0 if piece cannot move, 1 if piece can only move
 * (no other piece can capture), 2 if it can move and capture
 */
Dama.is_piece_moveable = function (board, player, piece) {
    let possibleMoves = Dama.possible_moves(board, player, piece[0], piece[1]);
    return possibleMoves.length !== 0;

    //board of the piece belongs to the player
    //  if not, then false
    //if piece is queen, direction doesn"t matter
    //  check for empty, non-blocked, spots in its row/column
    //if player 1, then direction is: row+/- , column+
    //if player 2, then direction is: row+/- , column-
    //check for empty, non-blocked, spots
};


/**
 * Computes the resulting board from a given {board}
 * after a move by the specified {player} using the specified {path}
 * @memberof Dama
 * @function
 * @param {array} board The board with positioned pieces
 * @param {number} player Either player 1 or 2
 * @param {array} path an array of the path that the chosen
 *  piece will move along
 * @throws {Error} Throws an exception in case piece at
 * position {path[0]} does not belong to {player}, or move to position
 *  {path[path.length-1]} is not legal
 * @returns {array} Modified board reflecting the move made by the player
 *  and its side effects
 */
Dama.make_move = function (board, player, path) {
    b_util.set(board, player);
    //defend against invalid arguments
    //the piece does not belong to the player
    if (!b_util.is_player_rc(path[0][0], path[0][1])) {
        throw new Error("InvalidArgumentException");
    }
    //the move should have at least two positions
    if (path.length <= 1) {
        throw new Error("InvalidArgumentException");
    }
    //the end position should be empty
    if (!b_util.is_empty(path[path.length - 1][0], path[path.length - 1][1])) {
        throw new Error("InvalidArgumentException");
    }

    let piece = board[path[0][0]][path[0][1]];
    let promoted = false;
    let promotion_row = [-1, 7, 0];
    //prepare result board
    let board1 = R.clone(board);

    //clear path and check if piece gets promoted
    R.map(function (step) {
        board1[step[0]][step[1]] = Dama.piece_strings.disks[0];
        if (step[0] === promotion_row[player]) {
            promoted = true;
        }
    }, path);

    //if piece gets promoted, set target to Queen
    if (piece === Dama.piece_strings.queens[player] || promoted) {
        board1[path[path.length - 1][0]][path[path.length - 1][1]]
        = Dama.piece_strings.queens[player];
    } else {
        //set target to regular piece if it doesn't get promoted
        board1[path[path.length - 1][0]][path[path.length - 1][1]]
        = Dama.piece_strings.disks[player];
    }
    //return result board
    return board1;
};

/**
 * Computes whether a player won or not and
 * returns 0 if no one won, and the player index if a player won
 * @memberof Dama
 * @function
 * @param {array} board The board with positioned pieces
 * @throws {InvalidArgumentException} Throws an exception if
 *  empty (or illegal) board
 * @returns {number} Returns: 0 if {board} is not a winning board,
 * 1 if {board} indicates player 1 won, and 2 if {board} indicates player 2 won
 */
Dama.who_has_won = function (board) {
    //prepare function to curry to check if piece belongs to player
    const is_player_func = R.curry(function (player, piece_val) {
        return piece_val === Dama.piece_strings.disks[player]
        || piece_val === Dama.piece_strings.queens[player];
    });

    //check how many pieces player 1 has
    let counts = R.map(function (row) {
        return R.count(is_player_func(1), row);
    }, board);
    let p1Pieces = R.reduce(R.add, 0, counts);

    //check how many pieces player 2 has
    let p2Pieces = R.reduce(R.add, 0, R.map(function (row) {
        return R.count(is_player_func(2), row);
    }, board));
    //check if player 2 won
    if (p1Pieces === 0 && p2Pieces > 0) {
        return 2;
    }
    //check if player 1 won
    if (p2Pieces === 0 && p1Pieces > 0) {
        return 1;
    }
    //check for error
    if (p2Pieces === 0 && p1Pieces === 0) {
        throw new Error("InvalidPieceCount");
    }
    //if none, game resumes
    return 0;
};

/**
 * Computes whether the target {row} turns the piece into a queen for the
 * given {player}
 * @memberof Dama
 * @function
 * @param {number} player Either player 1 or 2
 * @param {number} row Row index of the chosen piece
 * @returns {boolean} Returns true if target {row} turns
 *  piece into queen for {player}
 */
Dama.is_queen_promotable = function (player, row) {
    if (player === 1) {
        return row === 0;
    }
    if (player === 2) {
        return row === 7;
    }
    return false;
};

/**
 * Computes all the possible moves for player from current board
 * given {player}
 * @memberof Dama
 * @function
 * @param {Array} board valid Dama board with positioned pieces
 * @param {number} player Either player 1 or 2
 * @returns {Array} Returns an array of paths where each path eencodes
 *  a possible move for {player}
 */
Dama.compute_moves = function (board, player) {
    let forcedPaths = [];
    let moveablePaths = [];
    let captures = [];

    //check if any captures are possible
    let countVecOuter = R.range(0, board.length).map(function (row) {
        let countVec = R.range(0, board[0].length).map(function (column) {
            let cap = Dama.piece_capture_count(board, player, [row, column]);
            if (cap[0] > 0) {
                captures.push(cap);
            }
            return cap[0];
        });
        return R.reduce(R.max, 0, countVec);
    });

    //if so, collect the maximum capture paths
    if (captures.length > 0) {
        let max = R.reduce(R.max, 0, countVecOuter);
        R.map(function (cap) {
            if (cap[0] === max) {
                R.map(function (path) {
                    moveablePaths.push(path);
                    forcedPaths.push(path);
                }, cap[1]);
            }
        }, captures);
        return forcedPaths;
    }

    //Otherwise, check and collect all possible moves
    R.range(0, board.length).map(function (row) {
        R.range(0, board[0].length).map(function (column) {
            let paths = Dama.possible_moves(board, player, row, column);
            R.map(function (path) {
                moveablePaths.push(path);
            }, paths);
        });
    });
    return moveablePaths;
};


/**
 * This constructs a dummy board used for testing
 * @memberof Dama
 * @function
 * @param {number} [width = 8] The width of the start board
 * @param {number} [height = 8] The height of the start board
 * @returns {Array} Dummy board with player pieces
 */
Dama.dummy_result_board = function (width = 8, height = 8) {
    let board = Dama.empty_board(width, height);
    board[1] = R.repeat(Dama.piece_strings.disks[1], 3);
    board[2] = R.repeat(Dama.piece_strings.disks[1], 5);

    board[5] = R.repeat(Dama.piece_strings.disks[2], 2);
    board[6] = R.repeat(Dama.piece_strings.disks[2], 4);

    return board;
};

export default Object.freeze(Dama);

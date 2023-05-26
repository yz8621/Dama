
import Dama from "../common/dama.js";
import R from "../common/ramda.js";


const DISPLAY_MODE = "to_string";
const display_functions = {
    "json": JSON.stringify,
    "to_string": Dama.board_to_string
};

//Utility function similar to the Connect4 example
//Given a board,
// When DISPLAY_MODE is to_string then display_board returns a printable string
// When DISPLAY_MODE is json then display_board returns a JSON string
//Repeated here from Dama.test.js for convenience
const display_board = function (board) {
    try {
        return "\n" + display_functions[DISPLAY_MODE](board);
    } catch (ignore) {
        return "\n" + JSON.stringify(board);
    }
};

describe("Valid piece capture count", function () {
    //initialize a start board for use with all it
    let board0 = [
        [" ", " ", " ", " ", " ", " ", " ", " "],
        ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
        ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " "],
        ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
        ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
        [" ", " ", " ", " ", " ", " ", " ", " "]
    ];
    let result;
    it(`Given a board, a player, and a piece,
When there is no opportunity for the player's piece to capture opponent pieces,
Then piece_capture_count returns zero as a capture count`, function () {
        result = Dama.piece_capture_count(board0, 1, [2, 1]);
        if (result[0] !== 0) {
            throw new Error("Board should not have capture moves");
        }
    });

    it(`Given a board, a player, and a piece,
When there is one opportunity for the player's
 piece to capture one opponent piece,
Then piece_capture_count returns one as a
 capture count and one capture path alternative`, function () {
        board0[3][1] = "⛂";
        result = Dama.piece_capture_count(board0, 1, [2, 1]);
        if (result[0] !== 1 && result[1].length !== 1) {
            throw new Error("Board should have one capture move");
        }
    });

    it(`Given a board, a player, and a piece,
When there is one opportunity for the player's
     piece to capture two opponent pieces,
Then piece_capture_count returns two as a
     capture count and one capture path alternative`, function () {
        board0[3][1] = "⛂";
        board0[6][1] = " ";
        result = Dama.piece_capture_count(board0, 1, [2, 1]);
        if (result[0] !== 2 && result[1].length !== 1) {
            throw new Error("Board should have two capture moves");
        }
    });

    it(`Given a board, a player, and a piece,
When there is one opportunity for the player's
     piece to capture three opponent pieces,
Then piece_capture_count returns three as a
     capture count and one capture path alternative`, function () {
        board0[3][1] = "⛂";
        board0[6][1] = " ";
        board0[6][3] = " ";
        result = Dama.piece_capture_count(board0, 1, [2, 1]);
        if (result[0] !== 3 && result[1].length !== 1) {
            throw new Error("Board should have three capture moves");
        }
    });

    it(`Given a board, a player, and a piece,
When there is one opportunity for the player's
     piece to capture three opponent piece,
Then piece_capture_count returns three as a
     capture count and two capture path alternative`, function () {
        //Testing board may not make sense for the game, but works for testing
        board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            ["⛀", "⛂", " ", "⛂", " ", "⛂", " ", "⛀"],
            ["⛂", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            [" ", "⛂", " ", "⛂", "⛂", " ", "⛂", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 1, [2, 0]);
        if (result[0] !== 3 && result[1].length !== 2) {
            throw new Error(`Board should have three capture
             moves with 2 alternative paths`);
        }
    });

    it(`Given a board, a player, and a piece,
When there is no opportunity for the player's
     piece to capture any of the opponent's pieces,
Then piece_capture_count returns zero as a
     capture count and no capture path alternative`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            ["⛀", "⛂", " ", "⛂", " ", "⛂", " ", "⛀"],
            ["⛂", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            [" ", "⛂", " ", "⛂", "⛂", " ", "⛂", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 1, [3, 1]);
        if (result[0] !== 0) {
            throw new Error("Empty spot should lead to no capture");
        }
    });
});

describe("Valid Queen capture count", function () {
    //Initializing a board for use with all its
    let board0 = [];
    let result;

    it(
        `Given a board, a player, and a Queen,
When the Queen can not capture any of the opponent's pieces,
Then queen_capture_count returns 0 as capture count and
0 alternative paths`,
        function () {
            board0 = [
                ["♕", " ", " ", " ", " ", " ", " ", " "],
                ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
                ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
                [" ", " ", " ", " ", " ", " ", " ", " "],
                [" ", " ", " ", " ", " ", " ", " ", " "],
                ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
                ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
                [" ", " ", " ", " ", " ", " ", " ", " "]
            ];
            result = Dama.queen_capture_count(board0, 1, [0, 0]);
            if (result[0] !== 0 && result[1].length !== 0) {
                throw new Error("Board should not have capture moves");
            }
        }
    );

    it(`Given a board, a player, and a Queen,
When the Queen can capture one of the opponent's pieces with
 two alternative paths,
Then queen_capture_count returns 1 as capture count and
 2 alternative paths`, function () {
        board0 = [
            ["♕", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            [" ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", " ", " ", " ", " ", " "]
        ];
        result = Dama.queen_capture_count(board0, 1, [0, 0]);
        if (result[0] !== 1 && result[1].length !== 2) {
            throw new Error(`Board should capture 1 and
             has two alternative targets`);
        }
    });

    it(`Given a board, a player, and a Queen,
When the Queen can capture two of the opponent's pieces
 with four alternative paths,
Then queen_capture_count returns 2 as capture counts
 and 4 alternative paths`, function () {
        board0 = [
            ["♕", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            [" ", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.queen_capture_count(board0, 1, [0, 0]);
        if (result[0] !== 2 && result[1].length !== 4) {
            throw new Error(`Board should capture 2 and
             has 4 alternative targets`);
        }
    });

    it(`Given a board, a player, and a Queen,
When the Queen can capture three of the opponent's pieces
 with three alternative paths,
Then queen_capture_count returns 3 capture
 and 3 alternative paths`, function () {
        board0 = [
            ["♕", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛂", "⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂"],
            [" ", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.queen_capture_count(board0, 1, [0, 0]);
        if (result[0] !== 3 && result[1].length !== 3) {
            throw new Error(`Board should capture 3 and
             has 3 alternative targets`);
        }
    });
});


/**
 * Given a board with positioned pieces, a player,
 * and an array of moves,
 * Checks if the provided moves result in a promotion to Queen
 *  of the player's piece at the beginning of each path in moves
 * @memberof Dama.test
 * @function
 * @param {Board} board The board to test.
 * @param {number} player Either player 1 or player 2
 * @param {Array} moves An array of paths where each path is a sequence of
 *   moves that result in the piece at path[0][0] being promoted to
 *   Queen
 * @throws if the resulting board fails for  any of the paths in moves
 */
const moves_results_in_queen = function (board, player, moves) {
    R.map(function (path) {
        let board1 = Dama.make_move(board, player, path);
        let targetRow = path[path.length - 1][0];
        let targetCol = path[path.length - 1][1];
        if (
            board1[targetRow][targetCol] !== Dama.piece_strings.queens[player]
        ) {
            throw new Error("Piece must turn into queen");
        }
    }, moves);
};

describe("valid piece to queen capture", function () {
    //Initialize board for use in all its
    //Different than previous tests because the piece
    // turns into queen along its path
    let board0 = [];
    let result;

    it(`Given a board, a player, and a piece,
When the player's piece can capture two of the opponent's pieces
 with four alternative paths, and get promoted to Queen along the way,
Then piece_capture_count returns 2 as capture counts,
 4 alternative paths, and the piece turns into a Queen`, function () {
        board0 = [
            ["♕", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            ["⛀", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 1, [5, 0]);
        if (result[0] !== 2 && result[1].length !== 4) {
            throw new Error(`Board should capture 2 and
             has 4 alternative targets`);
        }
        moves_results_in_queen(board0, 1, result[1]);
    });

    it(`Given a board, a player, and a piece,
When the player's piece can capture three of the opponent's pieces
     with four alternative paths, and get promoted to Queen along the way,
Then piece_capture_count returns 3 as capture counts,
     4 alternative paths, and the piece turns into a Queen`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            ["⛀", " ", " ", " ", " ", " ", " ", " "],
            ["♛", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 1, [3, 0]);
        if (result[0] !== 3 && result[1].length !== 4) {
            throw new Error(`Board should capture 3 and has 4 alternative
 targets (piece turns into queen after second capture)`);
        }
        moves_results_in_queen(board0, 1, result[1]);
    });
});

describe("player 2 valid capture", function () {
    //Initializing board for use in all its
    //Checking if above tests work for player 2
    let board0 = [];
    let result;

    it(`Given a board, a player, and a piece,
When the player's piece can capture four of the opponent's pieces
     with four alternative paths, and get promoted to Queen along the way,
Then piece_capture_count returns 4 as capture counts,
     4 alternative paths, and the piece turns into a Queen`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", "⛀", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", " "],
            ["⛀", " ", " ", " ", " ", " ", " ", "⛀"],
            ["♛", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 2, [4, 7]);
        if (result[0] !== 4 && result[1].length !== 4) {
            throw new Error(`Board should capture 4 and has 4 alternative
 targets (piece turns into queen after second capture)`);
        }
        moves_results_in_queen(board0, 2, result[1]);
    });

    it(`Given a board, a player, and a piece,
When the player's piece can capture zero of the opponent's pieces
     with zero alternative paths, and get promoted to Queen along the way,
Then piece_capture_count returns 0 as capture counts,
     0 alternative paths`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", "⛀", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            ["⛀", " ", " ", " ", " ", " ", " ", "⛀"],
            ["♛", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 2, [4, 7]);
        if (result[0] !== 0) {
            throw new Error("Board should capture 0");
        }
    });

    it(`Given a board, a player, and a piece,
When the player's piece can capture three of the opponent's pieces
     with five alternative paths, and get promoted to Queen along the way,
Then piece_capture_count returns 3 as capture counts,
     5 alternative paths, and the piece turns into a Queen`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", "⛀", " ", " "],
            ["⛀", "⛀", "⛀", "⛀", "⛀", "", "⛀", "⛀"],
            ["⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", " "],
            [" ", " ", " ", " ", " ", " ", " ", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.piece_capture_count(board0, 2, [4, 7]);
        if (result[0] !== 3 && result[1].length !== 5) {
            throw new Error(`Board should capture 3 and has 5 alternative
 targets (piece turns into queen after second capture)`);
        }
    });
});

describe("valid possible moves", function () {
    //Initialize board for use in all its
    let board0 = [];
    let result;

    it(`Given a board, a player, a row, and a column,
When the chosen piece (row 0 and column 0) can move,
Then possible_moves returns 11`, function () {
        board0 = [
            ["♕", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            ["⛀", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.possible_moves(board0, 1, 0, 0);
        if (result.length !== 11) {
            throw new Error("Should have 11 possible moves");
        }
    });
});

describe("valid end of game", function () {
    //Initialize board to use for all its
    let board0 = [];
    let result;

    it(`Given a board,
When player 2 is winning and player 1 has no more pieces,
Then who_has_won returns 2`, function () {
        board0 = [
            ["♕", " ", " ", " ", " ", " ", " ", " "],
            [" ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["⛀", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "]
        ];
        result = Dama.who_has_won(board0);
        if (result !== 1) {
            throw new Error("Player 1 is winner");
        }
    });

    it(`Given a board,
When player 1 is winning and player 2 has no more pieces,
Then who_has_won returns 1`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.who_has_won(board0);
        if (result !== 2) {
            throw new Error("Player 2 is winner");
        }
    });

    it(`Given a board,
When neither player 1 nor player 2 are winning,
Then who_has_won returns 0`, function () {
        board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            ["⛀", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.who_has_won(board0);
        if (result !== 0) {
            throw new Error("No one is a winner");
        }
    });
});

describe("valid make move", function () {
    //Initialize board for use in all its
    let board0 = [];
    let result;

    it(`Given a board, a player, and a path,
When player 2's piece should move from the first index in the path (4,0)
 to the last index in the path (2,0),
Then make_move returns the board with player 2's piece in (2,0).`, function () {
        board0 = [
            ["⛀", " ", " ", " ", " ", "⛀", " ", " "],
            ["⛀", " ", " ", "⛀", "⛀", "", "⛀", "⛀"],
            [" ", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            ["⛀", " ", " ", " ", " ", " ", " ", "⛀"],
            ["♛", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        let resultBoard = [
            ["⛀", " ", " ", " ", " ", "⛀", " ", " "],
            ["⛀", " ", " ", "⛀", "⛀", "", "⛀", "⛀"],
            ["♛", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", "⛂", " ", " ", " ", " "]
        ];
        result = Dama.make_move(board0, 2, [[4, 0], [3, 0], [2, 0]]);
        if (!R.equals(result, resultBoard)) {
            throw new Error("Wrong Move" + display_board(result));
        }
    });
});
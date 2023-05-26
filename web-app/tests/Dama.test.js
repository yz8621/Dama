
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
const display_board = function (board) {
    try {
        return "\n" + display_functions[DISPLAY_MODE](board);
    } catch (ignore) {
        return "\n" + JSON.stringify(board);
    }
};

/**
 * Checks if the Dama board is in a valid state.
 * A board is valid if all the following are true:
 * - The board is a rectangular 2d array
 * - The board length is equal to its height and both are bigger than 4
 * - The board can not be empty and has at least one piece
 * - The board elements contain only
 *   " ", "⛀", "⛂", "♕", "♛" as elements.
 * - The board has no regular pieces ("⛀", "⛂") in rows 0
 *   and height - 1 (promoted to queen: "♕", "♛")
 * @memberof Dama.test
 * @function
 * @param {Board} board The board to test.
 * @throws if the board fails any of the above conditions.
 */
const throw_if_invalid = function (board) {
    // Board is a 2-D array
    if (!Array.isArray(board) || !Array.isArray(board[0])) {
        throw new Error(
            "The board is not a 2D array: " + display_board(board)
        );
    }

    // Board is 'Square' with minimum dimensions
    let height = board.length;
    let width = board[0].length;
    if (width !== height || width < 4) {
        throw new Error(
            "The board is not square with > 4 dimensions" + display_board(board)
        );
    }

    //board is not empty
    let count = R.reduce(R.add, 0, R.map(function (row) {
        return R.count((val) => val !== " ", row);
    }, board));
    if (count === 0) {
        throw new Error(
            "The board is empty: " + display_board(board)
        );
    }

    // all pieces are [" ", "⛀", "⛂", "♕", "♛"]
    const is_valid_piece = function (val) {
        return R.find((vv) => val === vv, [" ", "⛀", "⛂", "♕", "♛"]);
    };
    count = R.reduce(R.add, 0, R.map(function (row) {
        return R.count(is_valid_piece, row);
    }, board));
    if (count !== width * height) {
        throw new Error(
            "The board has illegal pieces: " + display_board(board)
        );
    }
    //Rows board[0] and board[height-1] have no regular pieces
    const is_regular_piece = function (val) {
        return val === "⛀" || val === "⛂";
    };
    count = R.count(is_regular_piece, board[0]) + R.count(
        is_regular_piece,
        board[height - 1]
    );
    if (count !== 0) {
        throw new Error(
            "Promotion rows (0, heigh-1) have regular pieces: " +
            display_board(board)
        );
    }
};

describe("Start Board valid moves", function () {

    it(`Given a start board,
When no moves are made,
Then the board is valid`, function () {
        const start_board = Dama.start_board();
        throw_if_invalid(start_board);
    });
    it(`Given a start board,
When all possible legal moves are applied for player1,
  and all resulting possible moves are applied for player2,
Then the resulting boards are all valid.`, function () {
        let board0 = Dama.start_board();
        let moves = Dama.compute_moves(board0, 1);
        if (moves.length === 0) {
            throw new Error(
                "There should be possible moves from start board: "
                + display_board(board0)
            );
        }
        let boards = R.map(function (move) {
            let board1 = Dama.make_move(board0, 1, move);
            throw_if_invalid(board1);
            return board1;
        }, moves);

        R.map(function (board2) {
            moves = Dama.compute_moves(board2, 2);
            if (moves.length === 0) {
                throw new Error(`There should be possible moves from start
                 + one move board: ` + display_board(board2));
            }
            R.map(function (move) {
                let board3 = Dama.make_move(board2, 2, move);
                throw_if_invalid(board3);
            }, moves);
        }, boards);
    });
});


/**
 * Checks if throw_if_invalid is a valid test by checking whether
 *  it rejects invalid boards (as described above {@link throw_if_invalid})
 * @memberof Dama.test
 * @function
 * @param {Board} invalidBoard The board to test.
 * @throws if throw_if_invalid does not catch any of the errors.
 */
const invalid_test_actually_throws = function (invalidBoard) {
    let caught = false;
    try {
        throw_if_invalid(invalidBoard);
    } catch (err) {
        caught = true;
        err.message = null; //just to make jslint happy
    }
    if (!caught) {
        throw new Error("Invalid test. throw_if_invalid should have thrown.");
    }
};

describe("Testing the tests! Make sure invalid boards are caught", function () {
    it(`Given a board,
When it is empty,
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = Dama.empty_board();
        invalid_test_actually_throws(board0);
    });
    it(`Given an object,
When it is a non-array board,
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = 5;
        invalid_test_actually_throws(board0);
    });
    it(`Given a board,
When it is not square,
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = [
            ["⛀", " ", " ", " ", " ", "⛀", " ", " "],
            ["⛀", " ", " ", "⛀", "⛀", "", "⛀", "⛀"],
            ["♛", " ", "⛀", "⛀", "⛀", "⛀", "⛀", "⛀"]
        ];
        invalid_test_actually_throws(board0);
    });
    it(`Given a 3x3 board,
When it is smaller than minimum dimensions,
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = [
            ["⛀", " ", " "],
            ["⛀", " ", " "],
            ["♛", " ", "⛀"]
        ];
        invalid_test_actually_throws(board0);
    });
    it(`Given a board,
When it has illegal elements (different than space, ⛀, ⛂, ♕, ♛),
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["a", " ", " ", "⛀", "⛀", "", "⛀", "⛀"],
            ["♛", " ", "g", "d", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", " ", " ", " ", " ", " "]
        ];
        invalid_test_actually_throws(board0);
    });
    it(`Given a board,
When it has a regular piece (⛀, ⛂,) non-queen (♕, ♛) in promotion row (0),
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = [
            [" ", "⛀", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", "⛀", "⛀", "", "⛀", "⛀"],
            ["♛", " ", " ", " ", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", " ", " ", " ", " ", " "]
        ];
        invalid_test_actually_throws(board0);
    });
    it(`Given a board,
When it has a regular piece (⛀, ⛂,) non-queen (♕, ♛) in promotion row (7),
Then it is invalid and throw_if_invalid should throw`, function () {
        let board0 = [
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", "⛀", "⛀", "", "⛀", "⛀"],
            ["♛", " ", " ", " ", "⛀", "⛀", "⛀", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛀"],
            [" ", " ", " ", " ", " ", " ", " ", "⛂"],
            [" ", " ", "⛂", "⛂", "⛂", "⛂", "⛂", "⛂"],
            ["⛂", "⛂", "⛂", " ", "⛂", "⛂", "⛂", "⛂"],
            [" ", " ", " ", " ", " ", " ", "⛂", " "]
        ];
        invalid_test_actually_throws(board0);
    });
});

//More behavioural tests that test each API function are in Behaviour.test.js

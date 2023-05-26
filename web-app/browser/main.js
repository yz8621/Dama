import Json_rpc from "./Json_rpc.js";
import Board from "./modules/board.js";
import Actions from "./modules/player.js";

const game_board = document.getElementById("game_board");
let app_board = Board.newBoard(8, 8);
game_board.append(app_board);


Actions.connect();
Actions.connectImages();
Actions.resize_window();
Actions.connectKeyPress();

Board.redraw_board();

Board.ply();


const get_statistics = Json_rpc.method("get_statistics");

document.getElementById("home_name").onchange = function () {
    get_statistics([Board.home_player, Board.away_player]).then(
        Actions.update_statistics(Board.home_player, Board.away_player)
    );
};

document.getElementById("away_name").onchange = (
    document.getElementById("home_name").onchange
);

get_statistics([Board.home_player, Board.away_player]).then(
    Actions.update_statistics(Board.home_player, Board.away_player)
);


document.getElementById(
    "Tutorial"
).addEventListener("click", Actions.connectTutorial);

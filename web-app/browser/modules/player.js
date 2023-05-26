import R from "../../common/ramda.js";
import Board from "./board.js";
import Json_rpc from "../Json_rpc.js";

const Actions = Object.create(null);
const change_icon = Json_rpc.method("change_icon");

const playerIcons = [
    "./assets/abu.JPG", "./assets/pascal.jpg", "./assets/stitch.JPG",
    "./assets/zazu.JPG", "./assets/sebastian.JPG", "./assets/mushu.jpg",
    "./assets/maximus.jpg", "./assets/sm.jpg", "./assets/mk.JPG"
];

const playerPicIds = [
    "abu", "pascal", "stitch", "zazu", "sebastian",
    "mushu", "maximus", "spiderman", "moonknight"
];

let p = 1;

const el = (id) => document.getElementById(id);

const p1IconClicked = function () {
    el("chooseIcon").showModal();
    p = 1;
};

const p2IconClicked = function () {
    el("chooseIcon").showModal();
    p = 2;
};

//player 1
const p1TakebackClicked = function () {
    Board.take_back(1);

};

const p1reqDrawClicked = function () {
    Board.req_draw(1);

};
const p1ResignClicked = function () {
    Board.resign(1);

};

//player 2

const p2TakebackClicked = function () {
    Board.take_back(2);

};
const p2reqDrawClicked = function () {
    Board.req_draw(2);

};
const p2ResignClicked = function () {
    Board.resign(2);
};


const actionIDs = [
    "p1Icon", "p1Takeback", "p1reqDraw", "p1Resign", "p2Icon",
    "p2Takeback", "p2reqDraw", "p2Resign"
];

const actionFunctions = [
    p1IconClicked, p1TakebackClicked, p1reqDrawClicked,
    p1ResignClicked, p2IconClicked, p2TakebackClicked,
    p2reqDrawClicked, p2ResignClicked
];

Actions.connect = function () {
    R.range(0, actionIDs.length).map(function (index) {
        let element = el(actionIDs[index]);
        element.addEventListener("click", actionFunctions[index]);
    });
    window.onresize = Actions.resize_window;
};

Actions.connectImages = function () {
    R.range(0, playerPicIds.length).map(function (index) {
        let image = el(playerPicIds[index]);
        image.addEventListener("click", function () {
            let imageSource = `url(${playerIcons[index]})`;
            let imageSource1 = el("p1Icon").style.backgroundImage;
            let imageSource2 = el("p2Icon").style.backgroundImage;
            if (p === 1) {
                imageSource1 = imageSource;
                el("p1Icon").style.backgroundImage = imageSource;
            }
            if (p === 2) {
                imageSource2 = imageSource;
                el("p2Icon").style.backgroundImage = imageSource;
            }
            change_icon(
                Board.home_player,
                Board.away_player,
                imageSource1,
                imageSource2
            ).then(
                Actions.update_statistics(
                    Board.home_player,
                    Board.away_player
                )
            );
            el("chooseIcon").close();
        });
    });
};

Actions.update_statistics = function (player1, player2) {
    return function (stats) {
        const stats_home = stats[player1];
        const stats_away = stats[player2];

        el("home_name").textContent = player1;
        el("p1Icon").style.backgroundImage = stats_home.player_icon;
        el("p1Wins").textContent = stats_home.player_wins + " Wins";
        el("p1Losses").textContent = stats_home.player_losses + " Losses";
        el("p1Draws").textContent = stats_home.player_draws + " Draws";

        el("away_name").textContent = player2;
        el("p2Icon").style.backgroundImage = stats_away.player_icon;
        el("p2Wins").textContent = stats_away.player_wins + " Wins";
        el("p2Losses").textContent = stats_away.player_losses + " Losses";
        el("p2Draws").textContent = stats_away.player_draws + " Draws";
    };
};

let letterPressed = null;

Actions.connectKeyPress = function () {
    el("container").addEventListener("keypress", function (event) {
        if (
            (event.keyCode >= 97 && event.keyCode <= 104) ||
            (event.keyCode >= 65 && event.keyCode <= 72)
        ) {
            letterPressed = event.key;
        } else if (event.keyCode >= 49 && event.keyCode <= 56) {
            if (letterPressed !== null) {
                el(letterPressed + event.key).focus();
            }
        } else {
            letterPressed = null;
        }
    });
};

Actions.resize_window = function () {
    let width = window.innerWidth;
    let defaultWidth = 995;
    if (width < defaultWidth) {
        el("stylesheet").href = "vertical.css";
    }
    if (width >= defaultWidth) {
        el("stylesheet").href = "default.css";
    }
};

const tutorialIds = [
    "starterMessage", "topBar", "explainIcon", "explainTakeBack",
    "explainDraw", "explainResign", "explainWins", "explainMoveEncode",
    "explainHelperText", "AimofTheGame", "explainMovePiece",
    "explainTargetPiece", "explainResize", "explainNavigation",
    "referToAbout", "endTutorialMessage"
];

Actions.connectTutorial = function () {
    el("starterMessage").showModal();
    R.range(0, tutorialIds.length).map(function (index) {
        let message = el(tutorialIds[index]);
        message.addEventListener("click", function () {
            message.close();
            if (index < tutorialIds.length - 1) {
                el(tutorialIds[index + 1]).showModal();
            }
        });
    });
};


export default Object.freeze(Actions);
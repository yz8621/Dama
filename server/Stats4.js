//import * as fs from "fs";

/**
 * Stats4 is a module to load and save game stats and Elo ratings
 * for Connect 4 games.
 * @namespace Stats4
 * @author Yasmin Zaraket
 * @version 2021/22
 */
const Stats4 = Object.create(null);

/**
 * @memberof Stats4
 * @typedef {Object} Statistics
 * @property {number} player_wins How many times the player
 * has won when playing.
 * @property {number} player_losses How many times the player
 *     has lost when playing.
 * @property {number} player_draws How many times the player has
 *     tied when playing.
 */

/*
//Commented out for possible security threat.
//Awaiting response from professor...

 const read_stats_file = function () {
    let statFilePath = process.env.APPDATA + '\\dama_stats.json';
    let statsData = {};
    try {
        fs.appendFile(statFilePath, " ", function (err) {
            if (err) { throw err;}
            console.log('Append passed');
        });// creates the file if it does not exist
        let statsFile = fs.readFileSync(statFilePath);
        try {
            statsData = JSON.parse(statsFile);
        } catch (syntaxErr) {
            console.log("No Stat Data in file");
            throw syntaxErr;
        }
        if (Object.keys(statsData).length!==0){
            return statsData;
        }
        console.log(Object.keys(statsData).length);
    } catch (err) {
        console.log("file read operations failed");
    }
    return {};
};
*/
//const player_statistics = read_stats_file();
const player_statistics = {};

const new_player = function () {
    let icon = "url(./assets/abu.JPG)";
    if (Object.keys(player_statistics).length === 1) {
        icon = "url(./assets/sm.jpg)";
    }
    return {
        "player_icon": icon,
        "player_wins": 0,
        "player_losses": 0,
        "player_draws": 0
    };
};

/**
 * @memberof Stats4
 * @function
 * @param {string[]} players A list of player names to return stats for.
 * @returns {Object.<Stats4.Statistics>} The statistics of the requested
 *     players as object with keys given in players.
 */
Stats4.get_statistics = function (players) {
    players.map(function (player) {
        if (!player_statistics[player]) {
            player_statistics[player] = new_player();
        }
    });
    return Object.fromEntries(
        players.map(
            function (player) {
                return [player, player_statistics[player] || new_player()];
            }
        )
    );
};

/**
 * Record the result of a game and return updated statistcs.
 * @memberof Stats4
 * @function
 * @param {string} player_1 The name of player 1 (who plies first)
 * @param {string} player_2 The name of player 2
 * @param {(0 | 1 | 2)} result The number of the player who won,
 *     or `0` for a draw.
 * @returns {Object.<Stats4.Statistics>} Returns statistics for player_1 and
 *     player_2, i.e. the result of
 *     {@link Stats4.get_statistics}`([player_1, player_2])`
 */
Stats4.record_game = function (player_1, player_2, result) {
    if (!player_statistics[player_1]) {
        player_statistics[player_1] = new_player();
    }
    if (!player_statistics[player_2]) {
        player_statistics[player_2] = new_player();
    }
    const player_1_stats = player_statistics[player_1];
    const player_2_stats = player_statistics[player_2];
    switch (result) {
    case (0):
        player_1_stats.player_draws += 1;
        player_2_stats.player_draws += 1;
        break;
    case (1):
        player_1_stats.player_wins += 1;
        player_2_stats.player_losses += 1;
        break;
    case (2):
        player_1_stats.player_losses += 1;
        player_2_stats.player_wins += 1;
        break;
    }

    //write_stats_file();
    //commented out for possible security threat
    return Stats4.get_statistics([player_1, player_2]);
};


/**
 * Record the player icons and return updated statistcs.
 * @memberof Stats4
 * @function
 * @param {string} player_1 The name of player 1 (who plies first)
 * @param {string} player_2 The name of player 2
 * @param {string} icon_1 The url to player 1's icon
 * @param {string} icon_2 The url to player 2's icon
 * @returns {Object.<Stats4.Statistics>} Returns statistics for player_1 and
 *     player_2, i.e. the result of
 *     {@link Stats4.get_statistics}`([player_1, player_2])`
 */

Stats4.change_icon = function (player_1, player_2, icon_1, icon_2) {
    //this changes icon of player_1 in both player_1 and player_2 objects
    if (!player_statistics[player_1]) {
        player_statistics[player_1] = new_player();
    }
    if (!player_statistics[player_2]) {
        player_statistics[player_2] = new_player();
    }
    const player_1_stats = player_statistics[player_1];
    const player_2_stats = player_statistics[player_2];

    player_1_stats.player_icon = icon_1;

    player_2_stats.player_icon = icon_2;
    return Stats4.get_statistics([player_1, player_2]);
};

/*
//commented out for possible security threat
const write_stats_file = function () {
    let statsFilePath = process.env.APPDATA + '\\dama_stats.json';
    try {
        let jsonPlayerStats = JSON.stringify(player_statistics);
        fs.writeFileSync(statsFilePath, jsonPlayerStats);
    } catch (err) {
        console.log("file write operations failed");
    }
};
*/

export default Object.freeze(Stats4);

/*
    Script for the saving system.
*/

let firstTime = true;


function SaveVar(name, value) {
    localStorage.setItem(name, value);
}

function LoadVar(name) {
    // Returns a variable from the local storage.
    return JSON.parse(localStorage.getItem(name));
}

function GetStorage(key, val) {
    // Gets all the keys and/or values from the local storage. key = true to get keys, val = true to get values. Both to both.
    let storage = localStorage;
    let keys = Object.keys(storage);
    let values = Object.values(storage);
    let returnKeys = [];
    let returnValues = [];
    for (let i = 0; i < keys.length; i++) {
        returnKeys.push(keys[i]);
        if (values[i] != "undefined") {
            returnValues.push(JSON.parse(values[i]));
        }
        else {
            returnValues.push(undefined);
        }
    }

    if (val && key) {
        return [returnKeys, returnValues];
    }
    else if (val) {
        return returnValues;
    }
    else if (key) {
        return returnKeys;
    }
    else {
        console.error("No value or key specified.");
    }
}

function LoadGame() {
    // Loads all the variables from the local storage.
    let keys = GetStorage(true, false);
    let values = GetStorage(false, true);

    for (let i = 0; i < keys.length; i++) {
        eval(keys[i] + " = " + values[i]);
    }
    console.log("Game loaded.");
}

function SaveGame() {
    // Updates existing items in localStorage from the variables.
    let keys = GetStorage(true, false);

    for (let i = 0; i < keys.length; i++) {
        SaveVar(keys[i], eval(keys[i]));
    }
    console.log("Game saved.");
}


function UpdateFooter() {
    document.getElementById("ft-highscore-p1").innerHTML = phase1_score_highscore + " points";
    document.getElementById("ft-highscore-p2").innerHTML = phase2_score_highscore + " points";
    document.getElementById("ft-highscore-p3").innerHTML = phase3_buttonsPressed_highscore + " buttons";
    
    document.getElementById("ft-maxLevel-l").innerHTML = maxLevel;
    document.getElementById("ft-maxLevel-p").innerHTML = maxPhase;
    
    document.getElementById("ft-gamesPlayed").innerHTML = gamesPlayed;
}


// If the local storage is empty, fill it with the default values and display the initial message. Otherwise, load the already stored values.
if (localStorage.length == 0) {

    function SetDefaultValues() {
        localStorage.setItem("difficulty", difficulty);
        localStorage.setItem("sounds", sounds);
        localStorage.setItem("phase1_score_highscore", phase1_score_highscore);
        localStorage.setItem("phase2_score_highscore", phase2_score_highscore);
        localStorage.setItem("phase3_buttonsPressed_highscore", phase3_buttonsPressed_highscore);
        localStorage.setItem("firstTime", firstTime);
        localStorage.setItem("phase3_buttonsPressed_highscore_currentTime", phase3_buttonsPressed_highscore_currentTime);
        localStorage.setItem("gamesPlayed", gamesPlayed);
        localStorage.setItem("maxLevel", maxLevel);
        localStorage.setItem("maxPhase", maxPhase);

        SetDifficulty(difficulty); // Set currentTimeToClick and phase2_comboRequirement indirectly through this function
    }

    document.getElementById("initialOverlay").style.opacity = "1";
}
else {
    LoadGame();
    UpdateFooter();
    document.getElementById("initialOverlay").style.display = "none";
    SetDifficulty(difficulty);
    initialTimeline.play();
}

function LocalStorageDump() {
    // Dumps the localStorage to the console.
    let keys = GetStorage(true, false);
    let values = GetStorage(false, true);

    for (let i = 0; i < keys.length; i++) {
        console.log(keys[i] + ": " + values[i]);
    }
}
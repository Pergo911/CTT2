/*
    Script for the main menu's "options" section
*/

// Define properties of an option
class Option {
    constructor(title, func) {
        this.title = title;
        this.func = func;
    }
}

// Create options - strictly 6 options, limit of the board
const optionCollection = [
    new Option(".DIFF", RollDifficulty),
    new Option("SOUNDS", RollSounds),
    new Option(".MEMCLR", ResetLocalStorage),
    new Option("", undefined), // blank
    new Option("", undefined), // blank
    new Option("BACK", CloseOptions),
]

if (optionCollection.length != 6) {
    console.warn("Option collection has incorrect number of options");
}

// Show options
function Options() {
    CloseMenu("", ContinueAfterAnim);
    
    function ContinueAfterAnim() {
        OpenMenu(
            [
                optionCollection[0].title,
                optionCollection[1].title,
                optionCollection[2].title,
                optionCollection[3].title,
                optionCollection[4].title,
                optionCollection[5].title,
            ],
            [
                optionCollection[0].func,
                optionCollection[1].func,
                optionCollection[2].func,
                optionCollection[3].func,
                optionCollection[4].func,
                optionCollection[5].func,
            ],
            "Options"
        );
    }
}

// Back to Main Menu
function CloseOptions() {
    CloseMenu("", ContinueAfterAnim);

    function ContinueAfterAnim() {
        MainMenu();
    }
}

function RollDifficulty() {
    // Determine the next difficulty level
    if (difficulty < 2) {
        difficulty++;
    }
    else {
        difficulty = 0;
    }

    // Set the difficulty level and save it
    SetDifficulty(difficulty)
    SaveGame();

    // Notify the user
    canClickButtonGlobal = false;
    switch (difficulty) {
        case 0:
            Title(["EASY"], 500, undefined, () => {canClickButtonGlobal = true;});
            break;
        case 1:
            Title(["MEDIUM"], 500, undefined, () => {canClickButtonGlobal = true;});
            break;
        case 2:
            Title(["HARD"], 500, undefined, () => {canClickButtonGlobal = true;});
            break;
    }
}
// Toggle for sounds
function RollSounds() {
    sounds = !sounds;
    SaveGame();
    canClickButtonGlobal = false;

    if (sounds) {
        Title(["ON"], 500, undefined,() => {canClickButtonGlobal = true;});
    }
    else {
        Title(["OFF"], 500, undefined,() => {canClickButtonGlobal = true;})
    }
    console.log(sounds);
}


// Set the difficulty level. Affects currentTimeToClick and phase2_comboRequirement.
function SetDifficulty(diff) {
    difficulty = diff;

    switch (diff) {
        case 0:
            // easy
            currentTimeToClick = 200;
            break;
        case 1:
            // medium
            currentTimeToClick = 100;
            break;
        case 2:
            // hard
            currentTimeToClick = 50;
            break;
    }

    phase2_comboRequirement = Math.round(currentTimeToClick * 0.6);
}

function ResetLocalStorage() {
    // Resets the localStorage.
    localStorage.clear();
    location.reload();
}
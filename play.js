/*
    Script for handling the game
*/

// Declare global variables
let timer = 0;
let currentTimeToClick = 999; // Set by SetDifficulty()
let currentPhase = 0;
let gameTimer;
let countdown;
let bpsInterval;
let timerText = "";
let canBePaused = false;
let level = 1;
let lives = 1;
let timeCollection_all = [];
let startWithPhase = 1; // DEBUG (do not remove, set to 1 for normal behaviour, 0 to do nothing)

let phase1_score = 0;
let phase1_roundRequirement = 5;
let phase1_remainingRounds = phase1_roundRequirement;
let phase1_timeCollection = [];

let phase2_currentCombo = 0; // Current number of COMBOs
let phase2_comboPass = 5; // Number of COMBO×'s required to pass to the next phase
let phase2_comboRequirement = 999; // Set by SetDifficulty()  // Maximum time that qualifies as a COMBO. 60% of time to click.
let phase2_comboResets = 0; // Number of COMBO resets
let phase2_resetRequirement = 5; // Maximum number of resets to still get points
let phase2_remainingResets = phase2_resetRequirement;
let phase2_score = 0;

let phase3_timeToClick = 0;
let phase3_buttonsPressed = 0;
let phase3_prevButtonid = "placeholder";

let difficulty = 0; // Set by localStorage, 0 by default

let phase1_score_highscore = 0;
let phase2_score_highscore = 0;
let phase3_buttonsPressed_highscore = 0;
let phase3_buttonsPressed_highscore_currentTime = 0;
let gamesPlayed = 0;
let maxLevel = 0;
let maxPhase = 0;

let livesUsedAt = [];

document.getElementById("fc-timeToClick-span").innerHTML = TimerString(currentTimeToClick) + "<small>s</small>";
document.getElementById("fc-comboTime-span").innerHTML = TimerString(phase2_comboRequirement) + "<small>s</small>";
document.getElementById("combo-resets-span").innerHTML = phase2_resetRequirement;

let sounds = true;

// Prepare the board for the game when the "PLAY" button is clicked
function PrepareForGame() {
    if (currentPhase != 0) {
        console.error("Trying to prepare for game when already prepared!");
        return;
    }
    
    if (!flowchartOpen) {
        ClearFlowchart();
        ShowFlowchart();
    }
    if (menuOpen) {
        CloseMenu("&nbsp;", ContinueAfterAnim);
    } else {
        ContinueAfterAnim();
    }
    FocusBoard(0);
    
    function ContinueAfterAnim() {
        Title(["READY?"], 2000);
        setTimeout(() => {StartPhase(startWithPhase)}, 2300);
    }
}

// Countdown before the game starts
function Countdown() {
    ActivatePauseButton();
    countdown = 3
    if (currentPhase != 3) {
        UpdateHUD(TimerString(currentTimeToClick) + "<small>s</small>", 500)
    }
    else {
        UpdateHUD(TimerString(phase3_timeToClick) + "<small>s</small>", 500)
    }
    initialCountdown = setInterval(() => {
        if (countdown != 0) {
            // Flash the board and update the HUD while counting down
            Title([String(countdown)], 500, "orange");
            FlashBoard(undefined, 0, 700, 255, 165, 0); // orange
            ChangeHeaderColor(255, 165, 0, 0); // orange
            ChangeHeaderColor(40, 40, 40, 500); // default

            countdown--;
        }
        else {
            // Start the game after the countdown
            clearInterval(initialCountdown);
            
            if (currentPhase != 3) {Action(); FlashBackground(500, 0.5);}
            else {phase3_Action();}
            DisablePauseButton();
        }
    }, 500);
}


function Action() {
    // Loop that adds event listeners to all the buttons, including the wrong and correct ones
    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
        document.getElementsByClassName("grid-elem")[i].outerHTML = document.getElementsByClassName("grid-elem")[i].outerHTML;
        document.getElementsByClassName("grid-elem")[i].addEventListener("mousedown", function() {
            ClickHandler(this.firstChild, ()=>{ButtonClicked(this.id)})
        });
    }

    canClickButtonGlobal = true

    // Start the timer
    correctButton = GenerateButton();
    timer = currentTimeToClick;
    gameTimer = setInterval(() => {
        if (timer > 0) {
            timerText = Timer();
            let mainHUD = document.getElementById("mainHUD").firstChild;
            mainHUD.innerHTML = timerText + "<small>s</small>";
        }
        else {
            EndGame(true);
        }
    }, 10);
}
// Same as Action(), but fitted for ButtonRush at phase 3
function phase3_Action() {
    // Loop that adds event listeners to all the buttons, including the wrong and correct ones
    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
        if (phase3_buttonsPressed == 0) {
            document.getElementsByClassName("grid-elem")[i].outerHTML = document.getElementsByClassName("grid-elem")[i].outerHTML;
        }
        document.getElementsByClassName("grid-elem")[i].addEventListener("mousedown", function() {
            ClickHandler(this.firstChild, ()=>{phase3_ButtonClicked(this.id)})
        });
    }

    canClickButtonGlobal = true;


    correctButton = GenerateButton();
    FlashBackground(500, 0.5);
    // If this is the first time calling this function, start the timer
    if (phase3_buttonsPressed == 0) {
        timer = phase3_timeToClick;
        
        // Display the speed continuously on the flowchart until the timer is up
        bpsInterval = setInterval(() => {
            document.getElementById("bps-span").innerHTML = CalculateBPS();
        }, 100);

        gameTimer = setInterval(() => {
            if (timer > 0) {
                // Update the timer

                timerText = Timer();
                let mainHUD = document.getElementById("mainHUD").firstChild;
                mainHUD.innerHTML = timerText + "<small>s</small>";
            }
            else {
                // Time's up!

                clearInterval(gameTimer);
                clearInterval(bpsInterval);

                for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
                    document.getElementsByClassName("grid-elem")[i].outerHTML = document.getElementsByClassName("grid-elem")[i].outerHTML;
                    document.getElementsByClassName("grid-elem")[i].firstChild.style.backgroundColor = "";
                    document.getElementsByClassName("grid-elem")[i].firstChild.style.boxShadow = "";
                }

                InvertColors(300);

                // If the player still hasn't pressed a single button, end the game
                if (phase3_buttonsPressed == 0) {
                    Title(["WHY", "SURRENDER?"], 1000, "red");
                    // If the player surrenders, let them know they really should have pressed a button :P
                    lives = 1; // Lives to 1 instead of 0
                    
                    setTimeout(() => {EndGame(true)}, 1200);
                    return;
                }

                // Check for highscore
                if (IsHighscore(phase3_buttonsPressed_highscore, phase3_buttonsPressed)) {
                    phase3_buttonsPressed_highscore = phase3_buttonsPressed;
                }

                MarkFC(3, 1, "OK");
                anime({
                    targets: document.getElementsByClassName("fc-item")[2],
                    backgroundColor: "rgb(40, 40, 40)",
                    color: "rgb(255, 255, 255)",
                    duration: 400,
                });
                setTimeout(() => {
                    Title([phase3_buttonsPressed, "BUTTONS"], 1000, "green");
                    setTimeout(() => {
                        Title([GetCompliment()], 1000, "green");
                        setTimeout(() => {
                            LevelUp();
                        }, 1200);
                    }, 1700); // Delay a bit more than the callback would take.
                }, 300); // Wait for the invertion to finish.
            }
        }, 10);
    }
}

// Generate a random button, make it highlighted, and return the id
function GenerateButton() {
    // buttonid = "button" + Math.floor(Math.random() * 54);
    let buttonid = "button" + Math.floor(Math.random() * 54);

        
    while (currentPhase == 3 && buttonid == phase3_prevButtonid) {
        buttonid = "button" + Math.floor(Math.random() * 54);
        console.log("Generated the same button as before. Regenerating...");
    }

    correctButton = buttonid;

    // Make the button highlighted red
    let button = document.getElementById(buttonid);
    button.firstChild.style.backgroundColor = "rgba(255, 0, 0, 1)";
    button.firstChild.style.boxShadow = "0 0 5vh 1vh rgba(255, 0, 0, 1), inset 0 0 5vh 1vh rgba(255, 0, 0, 1)";
    
    // Save previous button id to avoid duplicates
    phase3_prevButtonid = buttonid;

    return buttonid;
}

// Timer function that is called every 10 milliseconds decrementing the "timer" variable. Returns a string in 0.00 format
function Timer() {
    timer--;
    let seconds = Math.floor(timer / 100);
    let milliseconds = timer % 100;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (milliseconds < 10) {
        milliseconds = "0" + milliseconds;
    }
    return seconds + "." + milliseconds;
}

// Progresses the game to the next phase/round
function ButtonClicked(buttonid) {
    canClickButtonGlobal = false;

    // Only proceed if the button clicked is the correct one
    if (buttonid == correctButton) {
        clearInterval(gameTimer);

        // Handle animations
        FlashBoard(undefined, 0, 700, 50, 255, 50);  // green 
        ChangeHeaderColor(50, 255, 50, 0); // green
        ChangeHeaderColor(40, 40, 40, 500); // default
        anime({
            targets: document.getElementById(buttonid).firstChild,
            backgroundColor:  ['rgba(50, 255, 50, 1)', 'rgba(20, 20, 20, 0)'], // green -> default
            duration: 1000,
            easing: 'easeInCubic',
        })

        // Button pressed in phase 1
        if (currentPhase == 1) {

            // Update the flowchart
            let dots = document.getElementsByClassName('fc-ph1-item');
            let dotColor;
            if (timer < currentTimeToClick/3) {dotColor = "orange"}
            else if (timer < currentTimeToClick/3*2) {dotColor = "yellow"}
            else {dotColor = "green"}
            dots[phase1_roundRequirement - phase1_remainingRounds].style.color = dotColor;

            phase1_timeCollection.push(currentTimeToClick - timer);
            document.getElementById("avr-time-span").innerHTML = TimerString(Math.floor(Average(phase1_timeCollection)));
            phase1_remainingRounds--;
            if (phase1_remainingRounds == 0) {
                // Player passed phase 1

                Title([GetCompliment()], 1000, "#fff", ContinueAfterAnim);

                // Calculate score 
                let timeCollectionSum = phase1_timeCollection.reduce((a, b) => a + b, 0);
                phase1_score = Math.round(100 - (timeCollectionSum / (phase1_timeCollection.length * currentTimeToClick) * 100));
                if (IsHighscore(phase1_score_highscore, phase1_score)) {phase1_score_highscore = phase1_score;}
                // Display score
                MarkFC(1, 1, phase1_score + "pts");

                // Start the next phase
                setTimeout(() => {StartPhase_2()}, 1100);
            }
            else {
                // Player still has rounds to go

                Title([phase1_remainingRounds + " LEFT"], 1000, "#fff", ContinueAfterAnim); // white
                
                function ContinueAfterAnim() {
                    Countdown();
                
                    // Loop that sets all buttons to transparent background
                    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
                        document.getElementsByClassName("grid-elem")[i].firstChild.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    }
                }
            }
        }

        // Button pressed in phase 2
        else if (currentPhase == 2) {
            let dots = document.getElementsByClassName('fc-ph2-item');
            let dotColor;
            dotColor = "green";
            dots[phase2_currentCombo].style.color = dotColor;
            
            if(currentTimeToClick - timer <= phase2_comboRequirement) {
                // Player keeps the combo
                phase2_currentCombo++;
                Title(["COMBO×" + phase2_currentCombo], 1000, "#0f0"); // green
            }
            else {
                // Player breaks the combo
                phase2_comboResets++;
                if (phase2_remainingResets == 0) {
                    // Player gets no point for this phase
                    Title(["NO POINTS", "THIS PHASE"], 1000, "#f00"); // red
                    document.getElementById("combo-resets-span").innerHTML = "NO POINTS!";
                }
                else {
                    phase2_remainingResets--;
                    document.getElementById("combo-resets-span").innerHTML = phase2_remainingResets;
                    Title(["TOO", "SLOW!"], 1000, "#fff"); // white
                }

                
                for (let i = 0; i < dots.length; i++) {
                    if (phase2_currentCombo == i) {
                        dots[i].style.color = "red";
                    }
                    else {
                        dots[i].style.color = "inherit";
                    }
                }
                phase2_currentCombo = 0;
            }
            
            
            if (phase2_currentCombo == phase2_comboPass) {
                // Player passed phase 2
                
                // Calculate score
                phase2_score = phase2_remainingResets / phase2_resetRequirement * 100;
                if (IsHighscore(phase2_score_highscore, phase2_score)) {phase2_score_highscore = phase2_score;}
                // Display score
                MarkFC(2, 1, phase2_score + "pts");

                // Start the next phase
                setTimeout(() => {
                    Title(["PASSED!"], 1000, "#0f0"); // green
                    setTimeout(() => {
                        StartPhase_3();
                    }, 1600);
                }, 1200);
            }
            else {
                // Player still has rounds to go
                setTimeout(() => {
                    Countdown();
            
                    // Loop that sets all buttons to transparent background
                    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
                        document.getElementsByClassName("grid-elem")[i].firstChild.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    }
                }, 1000);
            }
        }
    }

    // End the game if the wrong button is clicked
    else {
        EndGame(false, buttonid);
    }
}
// Same as ButtonClicked, but for ButtonRush
function phase3_ButtonClicked(buttonid) {
    canClickButtonGlobal = false;
    
    // Remove event listeners from all buttons
    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
        document.getElementsByClassName("grid-elem")[i].outerHTML = document.getElementsByClassName("grid-elem")[i].outerHTML;
    }
    

    // If player has more than one lives and clicked the wrong button, continue by making it correct again.
    if (lives > 1 && buttonid != correctButton) {
        buttonid = correctButton;
        lives--;
        Title(["MISS"], 300, "#f00");
        FC_UpdateElem("fc-lives-span", lives);
    }

    // Only proceed if the button clicked is the correct one
    if (buttonid == correctButton) {
        
        // Update the flowchart
        phase3_buttonsPressed++;
        FC_UpdateElem("buttons-hit-span", phase3_buttonsPressed);
        
        // Remove button outlines and backgrounds
        for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
            document.getElementsByClassName("grid-elem")[i].firstChild.style.boxShadow = "0 0 2vh 0 rgba(0, 0, 0, 0), inset 0 0 2vh 0 rgba(0, 0, 0, 0)";
            document.getElementsByClassName("grid-elem")[i].firstChild.style.backgroundColor = "";
        }
        
        ChangeHeaderColor(50, 255, 50, 0); // green
        ChangeHeaderColor(40, 40, 40, 500); // default
        anime({
            targets: document.getElementById(buttonid).firstChild,
            backgroundColor:  ['rgba(50, 255, 50, 1)', 'rgba(20, 20, 20, 0)'], // green -> default
            duration: 300,
            easing: 'easeInCubic',
        })

        phase3_Action();
    }

    // End the game if the wrong button is clicked
    else {
        EndGame(false, buttonid);
    }
}


function EndGame(endedByTimer, buttonId) {
    clearInterval(gameTimer);
    lives--;
    if (document.querySelector('.invert').style.opacity == 1) {InvertColors(300);}

    // Update the flowchart
    if (currentPhase == 1) {
        let dots = document.getElementsByClassName('fc-ph1-item');
        let dotColor = "red";
        dots[phase1_roundRequirement - phase1_remainingRounds].style.color = dotColor;
    }
    else if (currentPhase == 2) {
        let dots = document.getElementsByClassName('fc-ph2-item');
        let dotColor = "red";
        dots[phase2_currentCombo].style.color = dotColor;
    }

    if (lives == 0) {
        anime({
            targets: document.getElementsByClassName("fc-item")[currentPhase - 1],
            backgroundColor: "rgb(40, 40, 40)",
            color: "rgb(255, 255, 255)",
            duration: 400,
            easing: 'easeInOutCubic',
        });
    }
    
    

    // Loop that removes event listeners, backgrounds and boxShadows from all the buttons
    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
        document.getElementsByClassName("grid-elem")[i].outerHTML = document.getElementsByClassName("grid-elem")[i].outerHTML;
        document.getElementsByClassName("grid-elem")[i].firstChild.style.backgroundColor = "";
        document.getElementsByClassName("grid-elem")[i].firstChild.style.boxShadow = "0 0 2vh 0 rgba(0, 0, 0, 0), inset 0 0 2vh 0 rgba(0, 0, 0, 0)";
    }


    // Depending on whether the game ended by the timer or by clicking a wrong button, display the appropriate message. This has some code repetition, but it's easier to read than having a bunch of if statements.
    if (endedByTimer) {
        ChangeHeaderColor(255, 0, 0, 0); // red
        ChangeHeaderColor(40, 40, 40, 500); // default
        FlashBoard(undefined, 0, 700, 255, 0, 0); // red
        BlinkHUD(400, 255, 0, 0); // red 

        Title(["TIME'S", "UP!"], 1000, "#d62929"); // red
        setTimeout(() => {
            if (lives > 0) {
                // Player has lives left
                Title(["LIVES: ", lives], 1000, "#d62929"); // red
                FC_UpdateElem("fc-lives-span", lives);
                
                livesUsedAt.push("PHASE " + currentPhase + " LEVEL " + level + " (TIME)");

                setTimeout(() => {
                    if (currentPhase != 3) {
                        ClearBoard();
                        Countdown();
                    }
                    else {
                        // At phase 3, level up instead of continuing
                        LevelUp();
                    }
                }, 1600);
            }
            else {
                // Player has no lives left
                TotalGameOver();
            }
        }, 1200);
    }


    else {

        ChangeHeaderColor(255, 0, 0, 0); // red
        ChangeHeaderColor(40, 40, 40, 500); // default
        FlashBoard(document.getElementById(buttonId), 100, 100, 255, 50, 50); // red
        BlinkButton(document.getElementById(buttonId).firstChild, 400, 255, 165, 0); // orange
        document.getElementById(correctButton).firstChild.style.backgroundColor = "rgba(255, 0, 0, 1)";

        setTimeout(() => {
            Title(["YOU", "MISSED!"], 1000, "#d62929"); // red
            setTimeout(() => {
                if (lives > 0) {
                    // Player still has lives; continue the game
                    Title(["LIVES: ", lives], 1000, "#d62929"); // red
                    FC_UpdateElem("fc-lives-span", lives);
                    
                    livesUsedAt.push("PHASE " + currentPhase + " LEVEL " + level + " (MISS)");
                    
                    setTimeout(() => {
                        if (currentPhase != 3) {
                            ClearBoard();
                            Countdown();
                        }
                        else {
                            // At phase 3, level up instead of continuing
                            LevelUp();
                        }
                    }, 1600);
                }
                else {
                    // Player has no lives; game over
                    TotalGameOver();
                }
            }, 1200);
        }, 400);
    }

    // Handle the marking of the flowchart
    if (lives > 0) {
        /*if (endedByTimer) {
            MarkFC(currentPhase, 3, "TIME");
        }
        else {
            MarkFC(currentPhase, 3, "MISS");
        }*/
    }
    else {
        if (endedByTimer) {
            MarkFC(currentPhase, 2, "TIME");
        }
        else {
            MarkFC(currentPhase, 2, "MISS");
        }
    }


    // Inner function, because there can be an EndGame() without an actual game over, hence the need for a separate function
    function TotalGameOver() {
        Title(["GAME", "OVER!"], 1000, "#d62929"); // red
        
        livesUsedAt.push("PHASE " + currentPhase + " LEVEL " + level + " (" + (endedByTimer ? "TIME" : "MISS") + ")");

        // Update highscores
        gamesPlayed++;
        if (IsHighscore(maxPhase, currentPhase) && IsHighscore(maxLevel, level)) {
            maxLevel = level;
            maxPhase = currentPhase;
        }
        else if (IsHighscore(maxPhase, currentPhase) && !IsHighscore(maxLevel, level)) {
            maxPhase = currentPhase;
        }
        else if (!IsHighscore(maxPhase, currentPhase) && IsHighscore(maxLevel, level)) {
            maxLevel = level;
        }
        SaveGame();

        // Display the game over screen
        FillSummary();
        summary.Show();
    }

}

// Phases: 0 - Game not running, 1 - Survive, 2 - Combo, 3 - ButtonRush

// Extension for all the StartPhase functions
function StartPhase(phase) {
    if (phase == 0) {
        console.log("Doing nothing. StartPhase(0)");
        return;
    }
    else if (phase == 1) {
        StartPhase_1();
    }
    else if (phase == 2) {
        StartPhase_2();
    }
    else if (phase == 3) {
        StartPhase_3();
    }
    else {
        console.error("Invalid phase at StartPhase()");
    }
}

function StartPhase_1 () {
    currentPhase = 1;
    Title(["PHASE", "1"], 1100);
    FocusBoard(0);
    OpenFC(1);

    setTimeout(() => {
        Title(["SURVIVE!"], 2200, undefined, ContinueAfterAnim);
    }, 1500);

    function ContinueAfterAnim() {
        FocusBoard(1);
        Countdown();
    }
}

function StartPhase_2 () {
    currentPhase = 2;
    Title(["PHASE", "2"], 1100);
    FocusBoard(0);
    OpenFC(2);

    setTimeout(() => {
        Title(["<small>GET A<br>COMBO×" + String(phase2_comboPass) + "</small>"], 2200, undefined, ContinueAfterAnim);
    }, 1500);

    function ContinueAfterAnim() {
        FocusBoard(1);
        Countdown();
    }
}

function StartPhase_3 () {
    currentPhase = 3;
    FocusBoard(0);
    OpenFC(3);
    
    
    Title(["PHASE", "3"], 1100, "#fff");
    
    
    setTimeout(() => {
        Title(["INVERT!"], 1000);
        InvertColors(300);
        
        setTimeout(() => {
            Title(["<small>BUTTONRUSH!</small>"], 2200, undefined, ContinueAfterAnim);
        }, 1500);
    }, 2000);
    
    function ContinueAfterAnim() {
        phase3_timeToClick = (phase1_score + phase2_score) * 5;
        FocusBoard(1);
        Countdown();
    }
}

// Function that returns a random one-word compliment to be displayed in the title
function GetCompliment() {
    let compliments = ["NICE!", "GREAT!", "GOOD!", "WOW!", "COOL!", "GJ!", "DONE!"];
    return compliments[Math.floor(Math.random() * compliments.length)];
}

// Function that constructs a string in the same style as Timer()
function TimerString(timer) {
    let seconds = Math.floor(timer / 100);
    let milliseconds = timer % 100;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (milliseconds < 10) {
        milliseconds = "0" + milliseconds;
    }
    return seconds + "." + milliseconds;
}

function ActivatePauseButton() {
    canBePaused = true;
    let pauseButton = document.getElementById("fc_pause");
    buttonWhitelist.push(pauseButton);
    document.querySelector("#fc_pause > div").style.textDecoration = "none";

    anime({
        targets: pauseButton,
        opacity: "1",
        duration: 400,
        easing: "easeInQuad",
    });

    pauseButton.addEventListener("click", () => {
        ClickHandler(fc_pause, Pause);
    })
}
function DisablePauseButton() {
    canBePaused = false;
    let pauseButton = document.getElementById("fc_pause");
    buttonWhitelist.splice(buttonWhitelist.indexOf(pauseButton), 1);
    
    anime({
        targets: pauseButton,
        opacity: "0.2",
        duration: 400,
        easing: "easeInQuad",
        complete: () => {
            document.querySelector("#fc_pause > div").style.textDecoration = "line-through";
            document.querySelector("#fc_pause > div").style.textDecorationColor = "firebrick";
            document.querySelector("#fc_pause > div").innerHTML = "■";

            pauseButton.outerHTML = pauseButton.outerHTML;
        }
    });
}

function Pause() {
    if (!canBePaused) {console.error("Cannot pause (canBePaused = false)"); return;}
    
    let pauseButton = document.getElementById("fc_pause");
    pauseButton.outerHTML = pauseButton.outerHTML;
    pauseButton = document.getElementById("fc_pause");

    clearInterval(initialCountdown);
    pauseButton.style.backgroundColor = "orange";
    document.querySelector("#fc_pause > div").innerHTML = "▶";
    ChangeHeaderColor(255, 165, 0, 500);
    UpdateHUD("PAUSED", 500);
    
    pauseButton.addEventListener("click", () =>{Resume();});
}
function Resume() {
    if (!canBePaused) {console.error("Can't resume (canBePaused = false)"); return;}

    let pauseButton = document.getElementById("fc_pause");

    pauseButton.style.backgroundColor = "rgb(40, 40, 40)";
    document.querySelector("#fc_pause > div").innerHTML = "■";
    ChangeHeaderColor(40, 40, 40, 500);
    
    pauseButton.outerHTML = pauseButton.outerHTML;
    Countdown();
}
// Above functions are a mess because of the outerHTML trickery

function LevelUp() {
    level++;
    lives++;

    // Reduce time to click by 25% and adjust the combo requirement accordingly
    currentTimeToClick = Math.round(currentTimeToClick * 0.75);
    phase2_comboRequirement = Math.round(currentTimeToClick * 0.6);

    // Notify the user
    Title(["LEVEL", level], 1500);
    FC_UpdateElem("fc-lvl-span", level);
    setTimeout(() => {
        Title(["LIVES: " + lives], 1200, "darkgoldenrod"); // "darkgoldenrod" is a color that you probably never heard of but i needed a darker yellow that is still yellow
        FC_UpdateElem("fc-lives-span", lives);

        setTimeout(() => {
            // Start the game from the beginning
            ResetValues(true);
            StartPhase(currentPhase);
        }, 1500);
    }, 2400);
}

function ResetValues(excludeLVL = false, dontclear = false) {
    timer = 0;
    currentPhase = startWithPhase;
    timerText = "";
    canBePaused = false;
    phase1_remainingRounds = phase1_roundRequirement;
    phase1_score = 0;
    phase3_timeToClick = 0;
    
    timeCollection_all.push(phase1_timeCollection);
    phase1_timeCollection = [];
    
    phase2_currentCombo = 0;
    phase2_comboResets = 0;
    phase2_remainingResets = phase2_resetRequirement;
    phase2_score = 0;
    phase3_buttonsPressed = 0;
    phase3_prevButtonid = "placeholder";

    if (!dontclear) {
        ClearFlowchart(excludeLVL);
    }
    ClearBoard();
}

function IsHighscore(highscore, score) {
    if (highscore < score) {
        console.log("New highscore: " + highscore);
        return true;
    }
    console.log("No new highscore.");
    return false;
}
/*
    Script for the visual functions
*/


// Display the given text in the middle of the screen. textArray is an array of strings.
function Title(textArray, duration, color, callback) {
    for (let i = 0; i < textArray.length; i++) {
        
        // Create the text element
        const toDisplay = textArray[i];

        const currentText = document.createElement("span")

        if (color != undefined) {currentText.style.textShadow = "0 0 6vh " + color;}
        else                    {currentText.style.textShadow = "0 0 6vh";}
        currentText.innerHTML = toDisplay
        currentText.style.position = "absolute"


        setTimeout(() => {
            // Add the text to the screen
            document.getElementById("titleOverlay").appendChild(currentText);

            // Animate the text
            anime({
                targets: currentText,
                scale: ['120%', '100%'],
                duration: duration/textArray.length + 200,
                easing: 'easeOutSine',
            })

            // Remove the text after the duration
            setTimeout(() => {
                if (i == textArray.length - 1) {
                    anime({
                        targets: currentText,
                        opacity: 0,
                        duration: 200,
                        easing: 'easeInSine',
                        complete: () => {currentText.remove()}
                    })
                    if (callback != undefined) {
                        callback();
                    }
                }
                else {
                    currentText.remove();
                }
            }, duration/textArray.length -1);
        }, i*(duration/textArray.length));
    }
}


// Flash the board either with a ripple effect (fromButton) or the entire board.
function FlashBoard(fromButton, durationIn, durationOut, colorR, colorG, colorB, callback) {
    if (fromButton != undefined) {
        let buttonNumber = fromButton.id.substring(6);
        flashTimeline = anime.timeline({
            targets: '.grid-elem > button',
            delay: anime.stagger((durationIn+durationOut)/15, {grid: [9, 6], from: parseInt(buttonNumber)}),
            easing: 'easeInOutCubic',
        });
    }
    else {
        flashTimeline = anime.timeline({
            targets: '.grid-elem > button',
        });
    }

    flashTimeline.add({
        boxShadow: ['0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0), inset 0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0)', '0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1), inset 0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1)'],
        duration: durationIn,
        easing: 'easeInCubic',
    })
    flashTimeline.add({
        boxShadow: ['0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1), inset 0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1)', '0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0), inset 0 0 2vh 0 rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0)'],
        duration: durationOut,
        easing: 'easeOutCubic',
        complete: ()=> {if (callback != undefined) {callback();}},
    })
}


// Flash the background of the body. intensity is a number between 0 and 1.
function FlashBackground(duration, intensity) {
    anime.timeline({
        targets: document.body,
        easing: 'easeOutQuad',
    }).add({
        backgroundColor: ['rgba(20, 20, 20, ' + String(1 - intensity) + ')', 'rgba(20, 20, 20, 1)'],
        duration: duration,
    })
}

// Change the color of the header
function ChangeHeaderColor(colorR, colorG, colorB, duration) {
    anime({
        targets: '#header',
        backgroundColor: 'rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1)',
        duration: duration,
        easing: "easeInOutCubic",
    })
}


// Function for blinking the given button. (smooth)
function BlinkButton(button, speed, colorR, colorG, colorB) {
    let initial = button.style.boxShadow;    
    
    blinkTimeline = anime.timeline({
            easing: 'easeInOutCubic',
            duration: speed,
            loop: true,
            direction: 'alternate',
        });
        blinkTimeline.add({
            targets: button,
            boxShadow: ['0 0 5vh 1vh rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0), inset 0 0 5vh 1vh rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 0)', '0 0 5vh 1vh rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1), inset 0 0 5vh 1vh rgba(' + colorR + ', ' + colorG + ', ' + colorB + ', 1)'],
        });
}

// Function for blinking the HUD (immediate)
function BlinkHUD(speed, colorR, colorG, colorB) {
    let toggle = true;
    let mainHUD = document.getElementById("mainHUD").firstChild;
    let initial = mainHUD.style.color;
    blinkInterval = setInterval(() => {
        if (toggle) {
            mainHUD.style.color = "rgba(" + colorR + ", " + colorG + ", " + colorB + ", 1)";
            toggle = false;
        }
        else {
            mainHUD.style.color = initial;
            toggle = true;
        }
    }, speed);
}

// Invert the colors of the page
function InvertColors(duration) {
    // Check if the page is already inverted
    let value;
    if (document.querySelector(".invert").style.opacity == 1) {
        value = 0;
    }
    else if (document.querySelector(".invert").style.opacity == 0) {
        value = 1;
    }
    else {
        console.error("Trying to invert the colors mid-transition!");
    }
    
    anime({
        targets: '.invert',
        opacity: value,
        duration: duration,
        easing: 'easeInCubic',
    })
}

// Erase any remaining effects from the board
function ClearBoard() {
    for (let i = 0; i < document.getElementsByClassName("grid-elem").length; i++) {
        let button = document.getElementsByClassName("grid-elem")[i];
        button.outerHTML = button.outerHTML;
        
        button = document.getElementsByClassName("grid-elem")[i];
        
        button.firstChild.style.boxShadow = "none";
        button.firstChild.style.backgroundColor = "transparent";
        button.firstChild.style.color = "white";
    }
}

// "Unfocus" the board by making it smaller and less opaque
// Function disabled for now
let currentlyFocused = true;
function FocusBoard(focus = false) {

    // Function disabled for now
    return;

    if (currentlyFocused && focus) {console.error("Board already in focus!");return;}
    else if (!currentlyFocused && !focus) {console.error("Board already out of focus!");return;}

    if (!focus) {
            anime({
            targets: '#main',
            opacity: 0.5,
            filter: 'blur(0.5vh)',
            duration: 500,
            easing: 'easeInOutCubic',
            complete: () => {currentlyFocused = false;},
        })
    }
    else {
        anime({
            targets: '#main',
            opacity: 1,
            filter: 'blur(0vh)',
            duration: 500,
            easing: 'easeInOutCubic',
            complete: () => {currentlyFocused = true;},
        })
    }
}

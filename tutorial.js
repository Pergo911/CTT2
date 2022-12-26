/*
    Script for operating the tutorial
*/

let tutorialTimeline;
let tutorialOpen = false;

// Close the main menu, expand the first button to be as big as the table, and fade in the tutorial.
function OpenTutorial() {
    init_tutBTNs();
    
    if (tutorialOpen) {console.error("Tutorial already open!"); return;}
    
    canClickButtonGlobal = false;

    var tutorial = document.getElementById("tutorial-main");
    var tutorialButton = document.getElementsByClassName("tutorial-butt")[0];
    var otherButtons = document.getElementsByClassName("grid-elem");
    // convert HTMLCollection to array then remove tutorial button
    otherButtons = Array.prototype.slice.call(otherButtons);
    otherButtons = otherButtons.slice(1, otherButtons.length);

    tutorialTimeline = anime.timeline({
        autoplay: false,
        duration: 1000,
        easing: 'easeInOutCubic',
    });
    tutorialTimeline.add({
        targets: tutorial,
        opacity: 1,
    });
    tutorialTimeline.add({
        targets: tutorialButton,
        height: ["90%", "590%"],
        width: ["90%", "890%"], 
    }, 0);
    tutorialTimeline.add({
        targets: otherButtons,
        opacity: 0,
        complete: () => {
            tutorialOpen = true;
            canClickButtonGlobal = true;
        }
    }, 0);

    CloseMenu("Tutorial");

    setTimeout(() => {
        tutorialTimeline.play();
    }, 500);
}

// Reverse the process of opening the tutorial
function CloseTutorial() {
    if (!tutorialOpen) {console.error("Tutorial is not open!"); return;}
    
    canClickButtonGlobal = false;

    tutorialTimeline.reverse();
    tutorialTimeline.play();

    setTimeout(() => {
        MainMenu();
        tutorialOpen = false;
    }, 500);
}

// Handle the turorial's buttons; it's a function because once the board's outerHTML is reset, the buttons need to be reinitialized
let backbutton;
function init_tutBTNs() {
    backbutton = document.querySelector("#tut-backButton");
    backbutton.outerHTML = backbutton.outerHTML;
    backbutton = document.querySelector("#tut-backButton");
	backbutton.addEventListener("click", () => {ClickHandler(backbutton.id, () => {
	    anime({
	        targets: backbutton,
	        boxShadow: ['0 0 2vh 0 rgba(255, 255, 255, 1), inset 0 0 2vh 0 rgba(255, 255, 255, 1)', '0 0 2vh 0 rgba(255, 255, 255, 0), inset 0 0 2vh 0 rgba(255, 255, 255, 0)'],
	        duration: 2000,
	        easing: "easeOutCubic",
	    })
	    CloseTutorial();
	})});
}
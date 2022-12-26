/*
    Script for the initial overlay that comes up when the page is first time ran.
*/

let ENG_button = document.getElementById("io-eng-butt");
let HUN_button = document.getElementById("io-hun-butt");

ENG_button.addEventListener("click", function () {
    anime({
        targets: this,
        boxShadow: ['0 0 2vh 0 rgba(255, 255, 255, 1), inset 0 0 2vh 0 rgba(255, 255, 255, 1)', '0 0 2vh 0 rgba(255, 255, 255, 0), inset 0 0 2vh 0 rgba(255, 255, 255, 0)'],
        duration: 2000,
        easing: "easeOutCubic",
    })

    firstTime = false;
    SetDefaultValues();
    SaveGame();
    HideIO();
    setTimeout(() => {
	    initialTimeline.play();
    }, 500);
})


/* Disabled until hungarian language is implemented */
// HUN_button.addEventListener("click", function () {
//     anime({
//         targets: this,
//         boxShadow: ['0 0 2vh 0 rgba(255, 255, 255, 1), inset 0 0 2vh 0 rgba(255, 255, 255, 1)', '0 0 2vh 0 rgba(255, 255, 255, 0), inset 0 0 2vh 0 rgba(255, 255, 255, 0)'],
//         duration: 2000,
//         easing: "easeOutCubic",
//     })
    
//     firstTime = false;
//     SetDefaultValues();
//     SaveGame();
//     HideIO();
//     initialTimeline.play();
// })

function HideIO() {
    anime({
        targets: '#io-left',
        translateX: ["0%", "-110%"],
        duration: 1000,
        easing: 'easeInOutQuart',
        complete: () => {document.getElementById("initialOverlay").style.display = "none";}
    })
    anime({
        targets: '#io-right',
        translateX: ["0%", "110%"],
        duration: 1000,
        easing: 'easeInOutQuart',
    })
}
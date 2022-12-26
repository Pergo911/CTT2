/*
    Script for animating/handling the flowchart
*/

// Declare the global variables
let openFCtimeline = [];
let FCflashInterval;
let flowchartOpen = false;
let fcTimeline;
let currentlyOpenFC = 0;

function ShowFlowchart() {
    if (flowchartOpen) {console.error("Flowchart is already open!"); return;}

    canClickButtonGlobal = false;
    fcTimeline = anime.timeline({
        duration: 700,
    })

    fcTimeline.add({
        targets: ".footerItem",
        translateX: anime.stagger("100%", {from: 1, axis: "x", grid: [3, 1]}),
        opacity: 0,
        easing: "easeInExpo",
    }, 0)
    fcTimeline.add({
        targets: "#flowchart",
        opacity: ["0", "100%"],
        left: ["50%", "0%"],
        width: ["0", "100%"],
        easing: "easeOutExpo",
        complete: ContinueAfterAnim,
    })

    function ContinueAfterAnim() {
        flowchartOpen = true;
        canClickButtonGlobal = true;
    }
}
function HideFlowchart() {
    if (!flowchartOpen) {console.error('Flowchart already hidden!'); return;}

    fcTimeline.reverse();
    fcTimeline.play();

    flowchartOpen = false;
}


// Reset all the elements in the flowchart as if it was just opened
function ClearFlowchart(excl_LVL) {
    // Get all the relevant elements
    let fc_ph1_item = document.getElementsByClassName("fc-ph1-item");
    let fc_ph2_item = document.getElementsByClassName("fc-ph2-item");

    let fc_lvl_span = document.getElementById("fc-lvl-span");
    let fc_lives_span = document.getElementById("fc-lives-span");
    let bps_span = document.getElementById("bps-span");
    let avr_time_span = document.getElementById("avr-time-span");
    let combo_resets_span = document.getElementById("combo-resets-span");
    let buttons_hit_span = document.getElementById("buttons-hit-span");
    let fc_timeToClick_span = document.getElementById("fc-timeToClick-span");
    let fc_comboTime_span = document.getElementById("fc-comboTime-span");

    let fc_bgdiv_cover = document.getElementsByClassName("fc-bgdiv-cover");
    let fc_bgdiv = document.getElementsByClassName("fc-bgdiv");
    let fc_item = document.getElementsByClassName("fc-item");

    // Set colors, backgrounds and opacities
    for (let i = 0; i < fc_item.length; i++) {
        fc_item[i].style.backgroundColor = "";
        fc_item[i].style.color = "";
    }
    for (let i = 0; i < fc_bgdiv.length; i++) {
        fc_bgdiv[i].innerHTML = "PHASE " + (i + 1);;
        fc_bgdiv[i].style.color = "";
        fc_bgdiv[i].style.opacity = "1";
    }
    for (let i = 0; i < fc_bgdiv_cover.length; i++) {
        fc_bgdiv_cover[i].style.backgroundColor = "";
        fc_bgdiv_cover[i].style.opacity = '1';
    }

    // Set colors
    for (let i = 0; i < fc_ph1_item.length; i++) {
        fc_ph1_item[i].style.color = "inherit";
    }
    for (let i = 0; i < fc_ph2_item.length; i++) {
        fc_ph2_item[i].style.color = "inherit";
    }

    // Set text
    if (!excl_LVL) {
        fc_lvl_span.innerHTML = '1';
        fc_lives_span.innerHTML = '1';
    }
    avr_time_span.innerHTML = '00.00';
    combo_resets_span.innerHTML = phase2_resetRequirement;
    buttons_hit_span.innerHTML = '0';
    fc_timeToClick_span.innerHTML = TimerString(currentTimeToClick) + "<small>s</small>";
    fc_comboTime_span.innerHTML = TimerString(phase2_comboRequirement) + "<small>s</small>";
    bps_span.innerHTML = '0.00';
}

// Open a specific phase of the flowchart
// (has a bit of chaos in it, but it works)
function OpenFC(phase, callback) {
    // Get all the relevant elements
    let fc_item = document.getElementsByClassName("fc-item");
    
    let fc_bgdiv_cover = document.getElementsByClassName("fc-bgdiv-cover");
    let fc_bgdiv = document.getElementsByClassName("fc-bgdiv");

    // Check validity of arguments
    if (phase != 1 && phase != 2 && phase != 3) {console.error("Invalid phase"); return;}


    if (currentlyOpenFC != 0 && currentlyOpenFC != phase) {
        anime({
            targets: fc_item[currentlyOpenFC - 1],
            backgroundColor: "rgb(40, 40, 40)",
            color: "rgb(255, 255, 255)",
            duration: 400,
        });
    }
    currentlyOpenFC = phase;


    let i = phase - 1;

    let newTimeline = anime.timeline({
        duration: 1000,
        easing: "linear",
    });

    openFCtimeline.push(newTimeline);
    newTimeline.add({
        targets: [fc_item[i], fc_bgdiv_cover[i]],
        backgroundColor: "rgb(255, 255, 255)",
        color: "rgb(0, 0, 0)",
        duration: 400,  
    });
    newTimeline.add({
        targets: [fc_bgdiv[i]],
        color: "rgb(0, 0, 0)",  
    }, 0);
    newTimeline.add({
        targets: [fc_bgdiv_cover[i], fc_bgdiv[i]],
        opacity: 0,
        complete: callback,
    });
}


// Mark the current phase on the flowchart
function MarkFC(phase, status, message) {
    // status = 1: success, 2: fail, 3: survived with extra life

    // Check for invalid values
    if (phase != 1 && phase != 2 && phase != 3) {console.error("MarkFC: Invalid phase"); return;}
    if (status != 1 && status != 2 && status != 3) {console.error("MarkFC: Invalid status"); return;}

    // Get all the relevant elements
    let fc_item = document.getElementsByClassName("fc-item");
    let fc_bgdiv_cover = document.getElementsByClassName("fc-bgdiv-cover");
    let fc_bgdiv = document.getElementsByClassName("fc-bgdiv");

    let i = phase - 1;
    // circle, tick and cross symbol reference: ⬤ ✓ ✖

    let color = "";
    let text = "";
    
    if (message == undefined) {message = "";}
    if (status == 1) {
        text = "✓  " + message;
        color = "rgb(0, 255, 0)";
    }
    else if (status == 2) {
        text = "✖  " + message;
        color = "rgb(255, 0, 0)";
    }
    else if (status == 3) {
        text = "⬤  " + message;
        color = "rgb(255, 255, 0)";
    }

    fc_bgdiv[i].innerHTML = text;
    fc_bgdiv[i].style.color = "white";

    anime({
        targets: fc_bgdiv[i],
        opacity: "1",
        duration: 400,
        easing: "easeInCubic",
    })
    anime({
        targets: fc_bgdiv_cover[i],
        backgroundColor: color,
        opacity: "0.6",
        duration: 400,
        easing: "easeInCubic",
    })
}

// Return the average of an array
function Average(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

// Calculate buttons per second
function CalculateBPS() {
    let bps = phase3_buttonsPressed / (phase3_timeToClick - timer) * 100;
    bps = bps.toFixed(2);
    return bps;
}


// Update a text element on the flowchart with a spinning animation. Does not work with <span> elements.
function FC_UpdateElem(id, text) {
    let elem = document.getElementById(id);
    if (id == "buttons-hit-span") {
        // special case for buttons-hit-span
        elem.style.display = "inline-block";
    }

    // Use rotate to hide the text change
    anime({
        targets: elem,
        rotate: "360deg",
        duration: 400,
        easing: "easeInOutCubic",
        complete: () => {
            elem.style.transform = "rotate(0deg)";
            
            if (id == "buttons-hit-span") {
                // special case for buttons-hit-span
                elem.style.display = "";
            }
        }
    })

    // Change the text at the halfway point
    setTimeout(() => {
        elem.innerHTML = text;
    }, 200);
}
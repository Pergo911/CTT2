/*
    Script for handling the menu.
*/



let toBeExtended = [];
let toBeExtended_text = [];
let menuOpen = false;
// Extend the menu. menuItems is an array of the button labels, callbacks is an array of the functions to be called when the buttons are clicked.
function OpenMenu(menuItems, callbacks, HUDtext, next) {
    
    if (menuOpen) {console.error("Menu already open!"); return;}
    if (menuItems.length != 6 && callbacks.length != 6) {
        console.error("Argument arrays do not have appropriate lengths! (menuItems: " + menuItems.length + ", callbacks: " + callbacks.length + ")");
        return;
    }
    menuOpen = true;
    canClickButtonGlobal = false;

    for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];
        const callback = callbacks[i];
        const currentButton = document.getElementsByClassName("spec-butt")[i];

        if (menuItem != "") {
            currentButton.innerHTML = "<span>" + menuItem + "</span>";
            currentButton.style.backgroundColor = "rgb(20,20,20)"
            currentButton.style.cursor = "pointer"

            currentButton.addEventListener("click", ()=> {
                if (ClickHandler(currentButton, callback)) {
                    // FlashBoard(currentButton.parentElement, 200, 200, 255, 255, 255)
                    anime({
                        targets: currentButton,
                        boxShadow: ['0 0 2vh 0 rgba(255, 255, 255, 1), inset 0 0 2vh 0 rgba(255, 255, 255, 1)', '0 0 2vh 0 rgba(255, 255, 255, 0), inset 0 0 2vh 0 rgba(255, 255, 255, 0)'],
                        duration: 2000,
                        easing: "easeOutCubic",
                    })
                };
            });

            toBeExtended.push(currentButton)
            toBeExtended_text.push(currentButton.firstChild)
        }
    }
    anime({
        targets: toBeExtended,
        width: ["90%", "290%"],
        duration: 1000,
        delay: anime.stagger(100),
        easing: "easeInOutCubic",
    })

    anime({
        targets: toBeExtended_text,
        opacity: ["0", "100%"],
        duration: 1000,
        delay: anime.stagger(100),
        easing: "easeInCubic",
        complete: ContinueAfterAnim,
    })

    

    function ContinueAfterAnim() {
        if (next != undefined) {
            next();
        }
        canClickButtonGlobal = true;

        toBeExtended = [];
        toBeExtended_text = [];
    }

    if (HUDtext != "") {
        UpdateHUD(HUDtext, 1000)
    }
}

// Close the menu
function CloseMenu(HUDtext = "", next) {
    if (!menuOpen) {console.error("Menu is closed!"); return;}

    canClickButtonGlobal = false;

    const menuItems = [];
    const menuItemsInnerHTML = [];

    for (let i = 0; i < document.getElementsByClassName("spec-butt").length; i++) {
        const currentButton = document.getElementsByClassName("spec-butt")[i];
        if (currentButton.innerHTML != "") {
            menuItems.push(currentButton)
        }
    }

    for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];
        menuItemsInnerHTML.push(menuItem.firstChild)
    }

    anime({
        targets: menuItems,
        width: ["290%", "90%"],
        duration: 1000,
        delay: anime.stagger(100),
        easing: "easeInOutCubic",
    })
    anime({
        targets: menuItemsInnerHTML,
        opacity: ["100%", "0%"],
        duration: 1000,
        delay: anime.stagger(100),
        easing: "easeOutCubic",
        complete: ContinueAfterAnim,
    })


    function ContinueAfterAnim() {
        for (let i = 0; i < menuItems.length; i++) {
            const menuItem = menuItems[i];
            document.getElementById(menuItem.id).outerHTML = menuItem.outerHTML;
            document.getElementById(menuItem.id).innerHTML = "";
            document.getElementById(menuItem.id).style.backgroundColor = "transparent";
            document.getElementById(menuItem.id).style.cursor = "";
        }

        menuOpen = false;
        canClickButtonGlobal = true;
        if (next != undefined) {
            setTimeout(() => {
                next();
            }, 20);
        }
    }
    
    if (HUDtext != "") {
        UpdateHUD(HUDtext, 1000)
    }
}

// Change the text on the header
let canUpdateHUD = true;
function UpdateHUD(text, duration = 1000, callback) {    
    if (!canUpdateHUD) {console.error("Multiple HUD updates at once!");console.log(this);return;}
    canUpdateHUD = false

    const parent = document.getElementById("mainHUD")
    const oldSpan = document.getElementById("mainHUD").firstChild
    const newSpan = document.createElement("span")

    newSpan.innerHTML = text
    newSpan.style.display = "block"
    newSpan.style.textAlign = "center"
    newSpan.style.width = "100%"
    newSpan.style.flexGrow = "0"
    newSpan.style.flexShrink = "0"
    parent.appendChild(newSpan)
    
    anime({
        targets: [oldSpan, newSpan],
        translateY: ["0", "-100%"],
        easing: "easeInOutCubic",
        duration: duration,
        complete: ()=>{ContinueAfterAnim()},
    })
    function ContinueAfterAnim() {oldSpan.remove();newSpan.style.transform = "translateX(0)";canUpdateHUD = true;if (callback != undefined) {callback()}}
}


// Animations when the "EXIT" button is clicked
function ClosePage() {
    CloseMenu("&nbsp;", ContinueAfterAnim);
    
    
    function ContinueAfterAnim() {
        initialTimeline.reverse();
        initialTimeline.play();
    }
}



let canClickButtonGlobal = true;
let buttonBlacklist = [];
let buttonWhitelist = [];
// Check if user is allowed to click a button
function ClickHandler(button, callback) {
    let whitelistCheck = false;
    
    if (canClickButtonGlobal) {
        for (let i = 0; i < buttonBlacklist.length; i++) {
            const currentButton = buttonBlacklist[i];
            if (currentButton == button) {console.log("A button was clicked, but it was on the blacklist. Taking no action...");return false;}
        }
        callback();
        return true;
    }
    else {
        console.log("A button was clicked while global restrictions were active. Checking whitelist...")
        for (let i = 0; i < buttonWhitelist.length; i++) {
            const currentButton = buttonWhitelist[i];
            if (currentButton == button) {whitelistCheck = true;}
        }
        if (whitelistCheck) {console.log("Exception found. Executing callback...");callback(); return true;}
        else {console.log("The button was not on the whitelist. Taking no action..."); return false;}
    }
}


// Open the menu with the default values. Extracted this function here to avoid code duplication.
function MainMenu() {
    OpenMenu([
        "PLAY",
        "TUTORIAL",
        "OPTIONS",
        "",
        "",
        "EXIT"
    ], [
        () => {PrepareForGame()},
        () => {OpenTutorial()},
        () => {Options()},
        () => {},
        () => {},
        () => {ClosePage()},
    ], "Main Menu",)
}
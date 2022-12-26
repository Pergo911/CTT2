/*
    Script for the "summary" functionality at the end of the game
*/

let summary = {
    Show: function () {
        if (this._visible) {console.error("Summary is already visible"); return;}

        canClickButtonGlobal = false;

        anime({
            targets: '#summary',
            translateX: ["-110%", "0%"],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeInOutQuart',
            complete: () => {this._visible = true; canClickButtonGlobal = true;}
        });
    },
    Hide: function () {
        if (!this._visible) {console.error("Summary is already hidden"); return;}

        canClickButtonGlobal = false;

        anime({
            targets: '#summary',
            translateX: ["0%", "-110%"],
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeInOutQuart',
            complete: () => {this._visible = false; canClickButtonGlobal = true;}
        });
    },
    restartButton: document.getElementsByClassName("sum-option-butt")[0],
    menuButton: document.getElementsByClassName("sum-option-butt")[1],

    _visible: false,

    Clear: function () {
        // Clear summary content
        items = document.querySelectorAll('.sum-thread dl')
        for (let i = 0; i < items.length; i++) {
            items[i].remove();
        }
    }
}

summary.restartButton.addEventListener("click", () => {ClickHandler(this.id, () => {
    anime({
        targets: summary.restartButton,
        boxShadow: ['0 0 2vh 0 rgba(255, 255, 255, 1), inset 0 0 2vh 0 rgba(255, 255, 255, 1)', '0 0 2vh 0 rgba(255, 255, 255, 0), inset 0 0 2vh 0 rgba(255, 255, 255, 0)'],
        duration: 2000,
        easing: "easeOutCubic",
    })

    ClearBoard();
    ResetValues();
    UpdateHUD("&nbsp;", 1000);
    SetDifficulty(difficulty);
    currentPhase = 0;
    lives = 1;
    level = 1;
    PrepareForGame();

    summary.Hide();
})});

summary.menuButton.addEventListener("click", () => {ClickHandler(this.id, () => {
    anime({
        targets: summary.menuButton,
        boxShadow: ['0 0 2vh 0 rgba(255, 255, 255, 1), inset 0 0 2vh 0 rgba(255, 255, 255, 1)', '0 0 2vh 0 rgba(255, 255, 255, 0), inset 0 0 2vh 0 rgba(255, 255, 255, 0)'],
        duration: 2000,
        easing: "easeOutCubic",
    })

    ClearBoard();
    ResetValues(false, true);
    SetDifficulty(difficulty);
    currentPhase = 0;
    lives = 1;
    level = 1;
    HideFlowchart();
    UpdateFooter();
    setTimeout(() => {ClearFlowchart();}, 1500);
    MainMenu();

    summary.Hide();
})});

// Called by 'play.js' on game over.
function FillSummary() {

    // Create summary item with title, append to summary and return.
    function CreateBpItem(title, appendTo) {
        let item = document.createElement("dl");
        item.classList.add("bp-item");
        
        let header = document.createElement("dt");
        header.innerHTML = title;
        item.appendChild(header);

        appendTo.appendChild(item);
        return item;
    }

    let currentBPitem;
    let currentContent;

    // Reached
    currentBPitem = CreateBpItem("Reached:", document.getElementById("sum-content-title"));
    currentContent = document.createElement("dd");
    currentContent.innerHTML = "LVL " + level + " PHASE " + currentPhase;
    currentBPitem.appendChild(currentContent);
    currentBPitem = null;
    currentContent = null;

    // Lives used
    currentBPitem = CreateBpItem("Lives used: (" + livesUsedAt.length + ")", document.getElementById("sum-content-title"));
    for (let i = 0; i < livesUsedAt.length; i++) {
        currentContent = document.createElement("dd");
        currentContent.innerHTML = livesUsedAt[i];
        currentBPitem.appendChild(currentContent);
    }
    currentBPitem = null;
    currentContent = null;
}
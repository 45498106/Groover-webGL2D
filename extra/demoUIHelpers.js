// Global event handler for UI events
function UIClicked(event){
    event.stopPropagation();
    if(typeof this.dataDetails.func === "function"){
        this.dataDetails.func();
    }
    updateStats();     
}

// Creates UI
function createUI(){
    addCommonUI();
    var uiC = document.getElementById("uiContainer");
    UIInfo.forEach(s=>{
        var span = document.createElement("span");
        span.textContent = s.name;
        span.dataDetails = s;
        span.className = "btn overFX Light";
        span.addEventListener("click",UIClicked);
        uiC.appendChild(span);
        s.element = span;
    });   
}

// Global stats
var statsElement;
function updateStats(message){
    statsElement.textContent = message;
}


function addCommonUI(){
    UIInfo.unshift({
        name : "Home",
        func : function(){
            location.href = "GrooverWebGL2D.html";
        }
    });
}
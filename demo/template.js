
function renderer(){  
    var canvas = canvasMouse.canvas;
    var ctx = canvasMouse.ctx;
    var w = canvas.width;
    var h = canvas.height;
    var gl = canvasMouse.webGL.gl;
    var mouse = canvasMouse.mouse;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.composite.over();
    gl.enable(gl.BLEND);
    
    var frames = Math.floor(canvasMouse.globalTime / (1000/60)) % 60;
    var secs = Math.floor(canvasMouse.globalTime / 1000) % 60;
    var mins = Math.floor(canvasMouse.globalTime / (1000 * 60)) % 60;
    frames = (frames < 10 ? "0" :"") + frames;
    secs = (secs < 10 ? "0" :"") + secs;
    mins = (mins < 10 ? "0" :"") + mins;
    
    updateStats(`${mins}:${secs}:${frames}`);

}

// Called when canvas resized.
function resizedCanvas(){
    fullScreenRender.canvasResized(canvasMouse.webGL);
    spriteRender.canvasResized(canvasMouse.webGL);

}

// the UI controls at bottom of page
var UIInfo = [
    {
        name : "Home",
        func : function(){
            location.href = "GrooverWebGL2D.html";
        },
    }
];

// Global event handler for UI events
function UIClicked(event){
    event.stopPropagation();
    if(typeof this.dataDetails.func === "function"){
        this.dataDetails.func();
    }
}

// Creates UI
function createUI(){
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


// Startup.
window.addEventListener("load",function(){
    statsElement = document.getElementById("statsElement");
    statsElement.textContent = "Loading...";
    canvasMouse.create();
    createUI();
    canvasMouse.onresize = resizedCanvas;    
    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
     if(frameRate){
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }   
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   
});
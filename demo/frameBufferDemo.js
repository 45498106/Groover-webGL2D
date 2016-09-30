var testImages = {
    urls : ["../Images/GrooverCut509530.png"], 
    names : ["test"],
    images : {},
    textures : {},    
    
}


var ready = false;
const ACCELERATION = 0.4;
const DRAG = 0.1; 
var scale = new Chaser(0.001,ACCELERATION,DRAG);

function renderer(){  
    if(!ready){
        return;
    }
    var canvas = canvasMouse.canvas;
    var ctx = canvasMouse.ctx;
    var w = canvas.width;
    var h = canvas.height;
    var gl = canvasMouse.webGL.gl;
    var mouse = canvasMouse.mouse;
    
    var renderTarget = renderTargets.textures.test;
    renderTargets.setTarget(renderTarget);
  
    gl.clearColor(233.0, 0.0, 0.0, 232.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.composite.over();
    gl.enable(gl.BLEND);
    
    
    fullScreenRender.setRenderTarget(renderTarget);
    fullScreenRender.prepRender(fullScreenRender.shaders.backgroundImage,testImages.textures.test);
    scale.value =  1 + Math.sin(canvasMouse.globalTime / 1000) * 0.2 + Math.sin(canvasMouse.globalTime / 130) * 0.2;
    scale.update();
    fullScreenRender.draw(0,0,-1);//-scale.real);



    renderTargets.setDefaultTarget();    
    fullScreenRender.setRenderTarget(null);
    fullScreenRender.prepRender(fullScreenRender.shaders.backgroundImage,renderTarget.texture);
    fullScreenRender.draw(mouse.x,mouse.y,0.1);
    
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
    
    var l = logs.start();
    l.style.zIndex = 1000;
    l.style.left = "10px";
    l.style.width = "200px";
    l.style.height = "300px";
    l.style.top = "20px";
    logs.log("Hi there :)");    
    
    spriteTile.loadImageSet(testImages);
    testImages.allLoaded = function(){
        ready = true;
    }
    
    
    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    renderTargets.setupWebGL(canvasMouse.webGL);   
    renderTargets.createTarget("test",512,512);  // creates a 512,512 texture to render to
     if(frameRate){
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }   
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   
});
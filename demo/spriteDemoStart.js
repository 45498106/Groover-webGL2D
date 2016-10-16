// the sprite sheet image taken from a game "Rocks and a Blaster" I wrote last year.
var gameSprites = {
    url : "../Images/GrooverCut92692.png", // image has GrooverSprite data encoded in it but that is not used in this demo
    image : null,
    texture : null,
    sprites : [ // location of sprites in image
        [0, 0, 117, 123], // big rock
        [118, 0, 84, 81], // big shock wave
        [203, 0, 76, 80],  // UFO
        [0, 133, 38, 72], 
        [39, 133, 66, 71], // ship
        [106, 133, 34, 63], 
        [203, 81, 39, 49], 
        [118, 82, 49, 49], // small shockwave
        [141, 133, 55, 48], 
        [197, 133, 42, 47], 
        [168, 82, 28, 39], 
        [243, 81, 36, 35], 
        [141, 182, 53, 30], // thrust
        [197, 181, 30, 29], // green bullet
        [240, 133, 29, 26], // purple bullet
        [240, 160, 22, 25], 
        [240, 186, 22, 24], 
        [270, 133, 29, 24], 
        [270, 158, 18, 18], // gold 1
        [106, 197, 16, 17], // gold 2
        [228, 181, 11, 13], //blob green
        [228, 195, 11, 13], // blob purple
    ],
};
var rockShader = null;  // holds the batch sprite shader
const ROCK_SPRITES = [0   , 3,   8   ,    5,    9,    6,   11,   17,   10,   16,  15];  // sprite index for rocks.
var sc1 = 1.0;
const ROCK_SCALE_MIN = [1  *sc1 , 1.3*sc1,  1.25*sc1   ,    1.1*sc1,    1.09*sc1,    1*sc1,  1.06*sc1,   1.2*sc1,   0.9*sc1,   1.16*sc1,  1*sc1]; // set the min rock sprite scale
var rock = {  // define a single rock sprite
    x : 0, y : 0, dx : 0, dy : 0, r : 0, dr : 0, s : 1,
    sprite : 0,
    size : 0,
    dead : false,
};
var rocks = []; // array of rocks   
rocks.fastStack(1024*8*8,rock,"dead");  // thought 8000 would max out then 10000 now up to 16000 and still at 60FPS and there is some room for more optimisation. 32000 WOW 64000 :( Not on my machine 
var rockCount = 0;
function addRockCount(number){
    while(number > 0){
        number -= 1;
        addRock();
    };
}
function addRock(){
    var w = canvasMouse.canvas.width;
    var h = canvasMouse.canvas.height;    
    var r = rocks.fNextFree();
    if(r === undefined){
        return;
    }    
    rockCount += 1;
    r.x = Math.random() * w;
    r.y = Math.random() * h;
    r.r = Math.random() * Math.PI * 2;
    r.dx = (Math.random() -0.5)*4;
    r.dy = (Math.random() -0.5)*4;
    r.dr = (Math.random() -0.5)*0.1;
    var rockId = Math.floor(Math.random() * ROCK_SPRITES.length);
    r.sprite = ROCK_SPRITES[rockId];
    r.s = ROCK_SCALE_MIN[rockId] + (Math.random() -0.5) * 0.1;    
    r.dead = false;
}
function updateAndDisplayRocks(){
    rocks.fEachCustom(); 
}

// Dont really need  these to be chasers but leaving them in for now
const ACCELERATION = 0.8;
const DRAG = 0.1; 
var originX = new Chaser(0,ACCELERATION,DRAG);
var originY = new Chaser(0,ACCELERATION,DRAG);
var scale = new Chaser(1,ACCELERATION,DRAG);

// Render function
function renderer(){
    var gl = canvasMouse.webGL.gl;
    gl.composite.over();
    gl.enable(gl.BLEND);
    originX.update();
    originY.update();
    scale.update();
    fullScreenRender.prepRender(fullScreenRender.shaders.grid);
    fullScreenRender.drawGrid(Math.round(originX.real),Math.round(originY.real),scale.real);   
    // if the sprites have loaded and the batch sprite shader rockShader is ready then draw the sprites.
    if(gameSprites.ready && rockShader !== null){
        spriteRender.prepRender(rockShader, gameSprites);    
        updateAndDisplayRocks();
        spriteRender.flush();
    }    
}
function resizedCanvas(){
    fullScreenRender.canvasResized(canvasMouse.webGL);
    spriteRender.canvasResized(canvasMouse.webGL);
    originX.value = (canvasMouse.canvas.width/2);
    originY.value = (canvasMouse.canvas.height/2);
}
var UIInfo = [{    // the page bottom of screen UI
        name : "Reset", 
        func : function(){
            rocks.fEach(r => { r.dead = undefined; });
            rockCount = 0;
            addRockCount(128);     
        }            
    },{
        name : "Double sprite count",
        func : function(){
            addRockCount(rockCount);            
        },
        data : "double",
    }   
    
]
// over ride stats display 
var statsElement;
function updateStats(message){
    if(frameRate){
        statsElement.textContent = frameRate.frameRate.toFixed(0) + "FPS "+ rockCount +" sprites";
    }else{
        statsElement.textContent = message;
    }
}


// setup
window.addEventListener("load",function(){
    statsElement = document.getElementById("statsElement");
    canvasMouse.create();
    createUI();
    canvasMouse.onresize = resizedCanvas;    
    originX.value = canvasMouse.canvas.width/2;
    originY.value = canvasMouse.canvas.height/2;

    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);  // add composite filters
    fullScreenRender.setupWebGL(canvasMouse.webGL); // setup fullscreen render
    spriteRender.setupWebGL(canvasMouse.webGL);    //setup sprite render
    
    fullScreenRender.shaders.grid.prep([0.91,0.91,0.91, 0.982,0.982,0.982, 0,0,0, 1,1,1,1,1,0]);  // set the grid renderer settings
    imageLoader.imagesLoadedCallback = function(){  // image loaded call back
        // create a custom batch sprite renderer 
        rockShader = spriteRender.addSpriteBatchShader([],"rocks",gameSprites.locations);
        addRockCount(128);  // add some rocks
        updateStats(); 
        
    };
    
    imageManager.loadSpriteSheet(gameSprites);   // load the sprite sheet
    if(frameRate){  
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }    
    canvasMouse.renderStack.push(renderer);  // add the render to the render stack
    canvasMouse.start();   // startup Canvas and mouse UI

});
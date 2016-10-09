var lastMx;
var lastMy;
var tiles = {
    url : "../images/GrooverCut427222.png",
    image : null,
    texture : null,
    tilesX : 16,  // tiles across. This example is 8 by 8 pixel tiles s image is 8*8 64 by 32 * 8 256 pixels in size
    tilesY : 11,
    tiles : [],  // must have this array or tiles will not be created
    options : {
        sampler : "clampNear",    
    }
};
var map = null;  
function Chaser(value,accel,drag){
    this.value = value;
    this.real = value;
    this.chase = 0;
    this.accel = accel;
    this.drag = drag;
}
Chaser.prototype = {
    update : function(){
        if(this.accel === 1){
            this.chase = 0;
            this.real = this.value;            
        }else{
            this.chase += (this.value-this.real) * this.accel;
            this.chase *= this.drag;
            this.real += this.chase;
        }
    },
    snap : function(value){
        this.chase = 0;
        this.value = value !== undefined ? value : this.value;
        this.real = this.value;
    }
}
const ACCELERATION = 1;
const DRAG = 1; 
var originX = new Chaser(0,ACCELERATION,DRAG);
var originY = new Chaser(0,ACCELERATION,DRAG);
var mouseRX = 0;
var mouseRY = 0;
var scale = new Chaser(1,ACCELERATION,DRAG);

var UIColour = "black";
var gridSteps = 4;
var currentPaint = 0;
var currentPaintRange = 1;
var supressDraw = 0; // to stop mouse down being acted upon when UI controls clicked
function renderer(){
    var canvas = canvasMouse.canvas;
    var ctx = canvasMouse.ctx;
    var w = canvas.width;
    var h = canvas.height;
    var gl = canvasMouse.webGL.gl;
    var mouse = canvasMouse.mouse;

 

    if(mouse.w !== 0){
        mouseRX = ((mouse.x-originX.value)*scale.value);
        mouseRY = ((mouse.y-originY.value)*scale.value);   
        if(scale.value > 1024){
            scale.value = 1024;
            mouse.w = 0;
            showCanvasInfo = 120;
            canvasMessage = "Zoom in limit!";    
        }else{
            while(Math.abs(mouse.w) > 0.25){
                if(mouse.w > 0){
                    scale.value *= 1/1.01;
                }else{
                    scale.value *= 1.01;
                }
                mouse.w *= 0.5;
            }
        }
        originX.value = mouse.x-mouseRX/scale.value;
        originY.value = mouse.y-mouseRY/scale.value;
    }
    if(mouse.buttonRaw & 4){
        originX.value += (mouse.x - lastMx);
        originY.value += (mouse.y - lastMy);
    }
    gl.composite.over();
    gl.enable(gl.BLEND);
    
    mouseXR = ((mouse.x-originX.real)*scale.real);
    mouseYR = ((mouse.y-originY.real)*scale.real);    
    originX.update();
    originY.update();
    scale.update();      
    
    if(tiles.ready){
        fullScreenRender.prepRender(fullScreenRender.shaders.tileGrid,tiles.texture,map.texture);
        fullScreenRender.draw(originX.real,originY.real,scale.real);   
    }
    if(mouse.buttonRaw === 1 && supressDraw === 0){
        drawToMap(mouseXR / 8,mouseYR / 8, 1,map);
    }
    if(map.dirty){
        map.update(gl);
        map.dirty = false;
    }
    lastMx = mouse.x;
    lastMy = mouse.y;
    if(supressDraw > 0){
        supressDraw -= 1;
    }
}
function drawToMap(x,y,value,map){
    y = ((Math.floor(y) % map.height) + map.height) % map.height;
    x = ((Math.floor(x) % map.width) + map.width) % map.width;
    var ind = (y * map.width + x) * map.bytesPerTile; 
    map.map[ind] = value < 0 ? 0 : value >= map.maxTiles ? map.maxTiles-1 : value;
    map.dirty = true;
    fixMapTiles(x,y,map)
}

function fixMapTiles(x,y,map){
    var bitM = [0,0b1111,0b0011,0b1010,0b1100,0b0101,0b0001,0b0010,0b1000,0b0100,0b1110,0b1101,0b0111,0b1011,0b0110,0b1001];
    var mapIds = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    var pos = [[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]];
    var shape = [0b0001,0b0011,0b0010,0b0101,0b1111,0b1010,0b0100,0b1100,0b1000];    
    var cp;
    var xx = x;
    var yy = y;    
    function ind(){
        var yy = ((Math.floor(y) % map.height) + map.height) % map.height;
        var xx = ((Math.floor(x) % map.width) + map.width) % map.width;
        var tSet = xx % 2;
        tSet += (yy % 2)* 2;
        cp = (currentPaint + Math.floor((tSet/4)  * currentPaintRange)) * 16;           
        return (yy * map.width + xx) * map.bytesPerTile; 
    }
    function set(t){
        var i = ind();
        var f = map.map[i] % 16;
        var ii = mapIds.indexOf(f);
        if(ii > -1){
            f = bitM[ii];
        }else{
            f = 0;
        }
        var r = bitM.indexOf(t | f);
        if(r > -1){
            map.map[i] = mapIds[r] +  cp;
        }
    }



    for(var i = 0; i <pos.length; i ++){
        x = xx + pos[i][0];
        y = yy + pos[i][1];
     
        set(shape[i]);
    }
}
function clearMap(map,value = 0,x = 0,y = 0,w = map.width,h = map.height){
    x = x < map.width ? ( x >= 0 ? x : 0 ): map.width-1;
    y = y < map.width ? ( y >= 0 ? y : 0 ): map.height-1;
    w = x + w >= map.width ? map.width-1 - x : w;
    h = y + h >= map.height ? map.height-1 - y: h;
    value = value < 0 ? 0 : value >= map.maxTiles ? map.maxTiles-1 : value;
    if(map.width * map.height === map.map.length / map.bytesPerTile){
        map.map.fill(value);
    }else if(w * h === 0){
        return;
    }else{
        mw = map.width * map.bytesPerTile;
        x = (y * map.width + x) * map.bytesPerTile;
        for(var i = 0; i < h; i ++){
            map.map.fill(value,x,x+w);
            x += mw;
        }
    }
    map.dirty = true;
}        
function resizedCanvas(){
    fullScreenRender.canvasResized(canvasMouse.webGL);
    spriteRender.canvasResized(canvasMouse.webGL);
    originX.value = (canvasMouse.canvas.width/2)-mouseRX*scale.value;
    originY.value = (canvasMouse.canvas.height/2)-mouseRY*scale.value;
}
var UIInfo = [{
        name : "clear",
        func : function(){
            clearMap(map,0);
        },
    },{
        name : "Road",
        func : function(){
            currentPaint = 0;
            currentPaintRange = 1;
            updateStats("Paint road");
        },
    },{
        name : "Path",
        func : function(){
            currentPaint = 1;
            currentPaintRange = 4;
            updateStats("Paint path");
        },
    },{
        name : "Water",
        func : function(){
            currentPaint = 7;
            currentPaintRange = 4;
            updateStats("Paint water");
        },
    },{
        name : "Map Home",     
        func : function(){
            scale.value = 1;
            originX.value = Math.floor(canvasMouse.canvas.width /2);
            originY.value = Math.floor(canvasMouse.canvas.height /2);            
        },
   }    
]

window.addEventListener("load",function(){
    statsElement = document.getElementById("statsElement");
    statsElement.textContent = "Loading...";
    canvasMouse.create();
    createUI();
    canvasMouse.onresize = resizedCanvas;    
    originX.value = canvasMouse.canvas.width/2;
    originY.value = canvasMouse.canvas.height/2;

    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);      
    imageLoader.imagesLoadedCallback = function(){ 
        fullScreenRender.shaders.tileGrid.prep({map : map, tiles : tiles});
        updateStats("loaded images"); 
    };
    imageManager.loadSpriteSheet(tiles);    
    map = imageManager.createTileMap(1024,1024,16*11);
    if(frameRate){
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   
});
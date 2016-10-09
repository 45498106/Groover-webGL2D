var lastMx;
var lastMy;
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

/* WARNING this extends the Javascript Array prototype and should not be used in publicly scoped 
   environments unless you know what you are doing. This has nothing to do with the Groover-WebGL2D 
   demo and you should use alternative object management scheme if unsure 
*/
if (Array.prototype.fastStack === undefined) {
     Object.defineProperty(Array.prototype, 'fMaxLength', { // internal and should not be used
        writable : true,
        enumerable : false,
        configurable : false,
        value : undefined
     });
     Object.defineProperty(Array.prototype, 'fLength', { // internal do not use
        writable : true,
        enumerable : false,
        configurable : false,
        value : 0
     });
     Object.defineProperty(Array.prototype, 'flag', {  // internal and do not use;
        writable : true,
        enumerable : false,
        configurable : false,
        value : undefined
     });
    Object.defineProperty(Array.prototype, 'fNextFree', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (item) {
            if(this.fLength < this.fMaxLength){
                this.fLength += 1;
                return this[this.fLength-1];
            }
            return undefined;
        }
    });
    Object.defineProperty(Array.prototype, 'fPush', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (item) {
            var o,i;
            if(this.fLength < this.fMaxLength){
                o = this[this.fLength];
                for(i in item){
                    o[i] = item[i];
                }
                this.fLength += 1;
            }
            return o;
        }
    });
    Object.defineProperty(Array.prototype, 'fEach', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            var i, tail,count,o,len;
            len = this.fLength;
            i = 0;
            tail = 0;
            count = 0;
            while( i < len ) {
                if( this[i][this.flag] !== undefined) {
                    count += 1;
                    func(this[i], i);
                    if(this[i][this.flag] === undefined) {
                        tail += 1;
                    }else{ // swap unused
                        if(tail > 0){
                            o = this[i - tail];
                            this[i - tail] = this[i];
                            this[i] = o;
                        }
                    }
                }
                i++;
            }
            this.fLength = count-tail;
        }
    });
    Object.defineProperty(Array.prototype, 'fEachCustom', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            var w = canvasMouse.canvas.width + 100;
            var h = canvasMouse.canvas.height + 100;              
            var i, len;
            var r;
            len = this.fLength;
            i = 0;
            tail = 0;
            count = 0;
            while( i < len ) {
                r = this[i];
                r.x += r.dx;
                r.y += r.dy;
                r.r += r.dr;
                r.x %= w;
                r.y %= h;
                spriteRender.drawSpriteBatch(r.sprite,r.x-50,r.y-50,r.s,r.r,1);
                i++;
            }
            
        }
    });
    Object.defineProperty(Array.prototype, 'fEachQ', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            var i,len;
            len = this.fLength;
            i = 0;
            while( i < len ) {
                if( this[i][this.flag] !== undefined) {
                    func(this[i], i);
                }
                i++;
            }
        }
    });
    Object.defineProperty(Array.prototype, 'fastStack', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (size,item,flag) {
            var i, o, j;
            if(this.fMaxLength === undefined){
                this.fMaxLength = this.length;
            }
            if(item[flag] === undefined){
                throw new ReferanceError("FastArray item descriptor missing matching flag property '"+flag+"'");
            }
            this.flag = flag;
            if(this.fMaxLength < size){
                for(i = this.fMaxLength; i < size; i++){
                    o = {};
                    for(j in item){
                        o[j] = undefined;
                    }
                    this.push(o);
                }
            }
            
            this.fLength = 0;
            return this.fMaxLength = this.fMaxLength < size ? size : this.fMaxLength;
        }
    });

}

const ROCK_SPRITES = [0   , 3,   8   ,    5,    9,    6,   11,   17,   10,   16,  15]; 
var sc1 = 1.0;
const ROCK_SCALE_MIN = [1  *sc1 , 1.3*sc1,  1.25*sc1   ,    1.1*sc1,    1.09*sc1,    1*sc1,  1.06*sc1,   1.2*sc1,   0.9*sc1,   1.16*sc1,  1*sc1]; // old v [0,3,5,6,9,10];

var rock = {
    x : 0, y : 0, dx : 0, dy : 0, r : 0, dr : 0, s : 1,
    sprite : 0,
    onScreen : false,
    size : 0,
    pickup : 0,
    timer : 0,
    safe : 100,
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
    rocks.fEachCustom(); /* to get a few more in */
    /*var w = canvasMouse.canvas.width + 100;
    var h = canvasMouse.canvas.height + 100;    
    rocks.fEach(r => {
       r.x += r.dx;
       r.y += r.dy;
       r.r += r.dr;
       r.x %= w;
       r.y %= h;
       spriteRender.drawSpriteBatch(r.sprite,r.x-50,r.y-50,r.s,r.r,1);
    });*/
    
}

function Chaser(value,accel,drag){
    this.value = value;
    this.real = value;
    this.chase = 0;
    this.accel = accel;
    this.drag = drag;
}
Chaser.prototype = {
    update : function(){
        this.chase += (this.value-this.real) * this.accel;
        this.chase *= this.drag;
        this.real += this.chase;
    },
    snap : function(value){
        this.chase = 0;
        this.value = value !== undefined ? value : this.value;
        this.real = this.value;
    }
}
const ACCELERATION = 0.8;
const DRAG = 0.1; 
var originX = new Chaser(0,ACCELERATION,DRAG);
var originY = new Chaser(0,ACCELERATION,DRAG);
var mouseRX = 0;
var mouseRY = 0;
var scale = new Chaser(1,ACCELERATION,DRAG);

var UIColour = "black";
var countOutInfo = 40;
var infoCount = 0;
var gridSteps = 4;

function renderer(){

    //var canvas = canvasMouse.canvas;
    //var ctx = canvasMouse.ctx;
    //var w = canvas.width;
    //var h = canvas.height;
    var gl = canvasMouse.webGL.gl;
    //var mouse = canvasMouse.mouse;
    //gl.clearColor(0.0, 0.0, 0.0, 0.0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    gl.composite.over();
    gl.enable(gl.BLEND);


   // mouseXR = ((mouse.x-originX.value)/scale.value);
   // mouseYR = ((mouse.y-originY.value)/scale.value);
    originX.update();
    originY.update();
    scale.update();


    fullScreenRender.prepRender(fullScreenRender.shaders.grid);
    fullScreenRender.drawGrid(Math.round(originX.real),Math.round(originY.real),scale.real);   
    if(gameSprites.ready){
        spriteRender.prepRender(spriteRender.shaders.batchSprite, gameSprites);    
        updateAndDisplayRocks();
        spriteRender.flush();
    }
    
    
    
    
    //lastMx = mouse.x;
    //lastMy = mouse.y;


    
}



function resizedCanvas(){
    fullScreenRender.canvasResized(canvasMouse.webGL);
    spriteRender.canvasResized(canvasMouse.webGL);
    originX.value = (canvasMouse.canvas.width/2)-mouseRX*scale.value;
    originY.value = (canvasMouse.canvas.height/2)-mouseRY*scale.value;


}

var UIInfo = [{   
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

var statsElement;
function updateStats(message){
    if(frameRate){
        statsElement.textContent = frameRate.frameRate.toFixed(0) + "FPS "+ rockCount +" sprites";
    }else{
        statsElement.textContent = message;
    }
}

window.addEventListener("load",function(){
    statsElement = document.getElementById("statsElement");
    canvasMouse.create();
    createUI();
    canvasMouse.onresize = resizedCanvas;    
    originX.value = canvasMouse.canvas.width/2;
    originY.value = canvasMouse.canvas.height/2;

    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    fullScreenRender.shaders.grid.prep([0.91,0.91,0.91, 0.982,0.982,0.982, 0,0,0, 1,1,1,1,1,0]);    
    imageLoader.imagesLoadedCallback = function(){
        addRockCount(128);
        updateStats();
        
    };
    
    imageManager.loadSpriteSheet(gameSprites);    
    if(frameRate){
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }    
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   

});
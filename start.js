var lastMx;
var lastMy;


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
var transition = {
    position : 0,
    dataFrom  : [0.91,0.91,0.91,0.982,0.982,0.982,0,0,0,1,1,1],
    dataTo : [0.91,0.91,0.91,0.982,0.982,0.982,0,0,0,1,1,1,1,1,1],
    data : [0.91,0.91,0.91,0.982,0.982,0.982,0,0,0,1,1,1,1,1,1],
}
var UIColour = "black";


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
    if(mouse.w !== 0){
        mouseRX = ((mouse.x-originX.value)/scale.value);
        mouseRY = ((mouse.y-originY.value)/scale.value);         
        while(Math.abs(mouse.w) > 0.25){
            if(mouse.w < 0){
                scale.value *= 1.01;
            }else{
                scale.value *= 1/1.01;
            }
            mouse.w *= 0.5;//Math.sign(mouse.w) * 20;;
        }
        originX.value = mouse.x-mouseRX*scale.value;
        originY.value = mouse.y-mouseRY*scale.value;
   

    }
    if(mouse.buttonRaw & 1){
        originX.value += (mouse.x - lastMx);
        originY.value += (mouse.y - lastMy);
       
    }


    mouseXR = ((mouse.x-originX.value)/scale.value);
    mouseYR = ((mouse.y-originY.value)/scale.value);
    originX.update();
    originY.update();
    scale.update();
    
    if(transition.position > 0){
        var t = transition;
        t.position -= 0.02;
        t.position = Math.max(0,t.position);
        for(var i = 0; i < t.dataFrom.length; i ++){
            t.data[i] = (t.dataTo[i]-t.dataFrom[i]) * (1-t.position) + t.dataFrom[i];
        }
        fullScreenRender.shaders.grid.prep(t.data);  
    }
    
    fullScreenRender.prepRender(fullScreenRender.shaders.grid);
    fullScreenRender.drawGrid(Math.round(originX.real),Math.round(originY.real),scale.real);   

    lastMx = mouse.x;
    lastMy = mouse.y;
    var gridStep = Math.floor(Math.log(256.0 / scale.real) / Math.log(8.0) - 1.0);
    var startGridSize = Math.pow(8.0,gridStep);
ctx.clearRect(0,0,w,h);
    //var a = 1.0-(((startGridSize * scale.x)-4.0)/28.0);
    var  m = (8) * startGridSize * scale.real;    
    ctx.lineWidth = 3;
    ctx.fillStyle = ctx.strokeStyle = UIColour;
    ctx.beginPath();
    ctx.moveTo(Math.round(originX.real),-10000);
    ctx.lineTo(Math.round(originX.real),10000);
    ctx.moveTo(-10000,Math.round(originY.real));
    ctx.lineTo(10000,Math.round(originY.real));
    ctx.stroke();
   // ctx.clearRect(0,h-40,w,40);
    ctx.font = "16px arial";    
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(w * 0.5 - m, h-20);
    ctx.lineTo(w * 0.5 + m, h-20);
    ctx.moveTo(w * 0.5 - m, h-25);
    ctx.lineTo(w * 0.5 - m, h-15);    
    ctx.moveTo(w * 0.5 + m, h-25);
    ctx.lineTo(w * 0.5 + m, h-15);     
    ctx.stroke();    
    var dis = 16  * Math.pow(8.0,gridStep);;
    if(gridStep < 0){
        dis = dis.toFixed(-gridStep);
    }else{
        dis = dis.toFixed(0);
    }
    ctx.fillText(dis+ " Pix",w * 0.5,h-25);
    //fullScreenRender.shaders.grid.setCheckerColor(0,[Math.random(),Math.random(),Math.random()]);
    //fullScreenRender.shaders.grid.setCheckerColor(1,[Math.random(),Math.random(),Math.random()]);
    //fullScreenRender.shaders.grid.setLineColor([Math.random(),Math.random(),Math.random()]);
   // fullScreenRender.shaders.grid.setLineWidth(Math.random()*5);
    //fullScreenRender.shaders.grid.setCheckerAlpha(null,Math.random());
  
    
   // ctx.clearRect(0,0,w,h);
    //drawCanvasTitle();
    //ctx.fillText("X : " + ((mouse.x-originX)/scaleV).toFixed(2) + " Y : " + ((mouse.y-originY)/scaleV).toFixed(2),mouse.x,mouse.y);
    
}

var drawCanvasTitle = function(){
    var ctx = canvasMouse.ctx;
    ctx.font = "64px arial black";
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    ctx.fillStyle = "White";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeText("Groover-WebGL2D",ctx.canvas.width/2,64);
    ctx.fillText("Groover-WebGL2D",ctx.canvas.width/2,64);
    ctx.font = "24px arial black";
    ctx.strokeStyle = "White";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1.3;    
    ctx.strokeText("Full screen 2D grid shader",ctx.canvas.width/2,64+30);
    ctx.fillText("Full screen 2D grid shader",ctx.canvas.width/2,64+30);
    
}

function resizedCanvas(){
    fullScreenRender.canvasResized(canvasMouse.webGL);
    spriteRender.canvasResized(canvasMouse.webGL);
    originX.value = (canvasMouse.canvas.width/2)-mouseRX*scale.value;
    originY.value = (canvasMouse.canvas.height/2)-mouseRY*scale.value;
    drawCanvasTitle();

}

var styles = [
    {
        name : "Home",
        
    },{
        name : "Light",
        data : [0.91,0.91,0.91, 0.982,0.982,0.982, 0,0,0, 1,1,1, 1,1,0],
        color : "black",        
    },{
        name : "Terminal",
        data : [0.1,0.4,0.1, 0.2,0.6,0.2, 0.4,0.9,0.4, 1,1,1, 1,1,0],
        color : "#0f0",
    },{
        name : "Ocean",
        data : [0.1,0.6,0.4, 0.2,0.8,0.8, 0.7,0.9,1, 1,1,1, 1,1,0],
        color : "white",
    },{
        name : "Midnight",
        data : [0.1,0.1,0.1, 0.2,0.2,0.2, 0.9,0.9,0.9, 1,1,1,1,1,0],
        color : "white",
    },{
        name : "Lines",
        data : [0.1,0.1,0.1, 0.2,0.2,0.2, 0.0,0.0,0.0, 0,0,1.4, 0.5,1,0],
        color : "black",
    },{
        name : "Blue",
        data : [1.0,1.0,1.0, 0.99,0.99,1.0, 0.0,0.0,1.0 ,1,1,1.2, 1,2,0],
        color : "#00F",
    },     
    
]
function setStyle(event){
    var info = document.getElementById("infoContainer");
    info.className = "info " + this.dataStyle.name;
    if(this.dataStyle.name === "Home"){
        originX.value = canvasMouse.canvas.width/2;
        originY.value = canvasMouse.canvas.height/2;
        scale.value = 1;
        
        
    }else{
        UIColour = this.dataStyle.color;
        var t = transition;   
        t.position = 1;
        t.dataFrom = t.dataTo;
        t.dataTo = this.dataStyle.data;
        styles.forEach(s=>{
            s.element.className = "btn overFX " + this.dataStyle.name;
        });
    }
    
}
function createUI(){
    var uiC = document.getElementById("uiContainer");

    styles.forEach(s=>{
        var span = document.createElement("span");
        span.textContent = s.name;
        span.dataStyle = s;
        span.className = "btn overFX Light";
        span.addEventListener("click",setStyle);
        uiC.appendChild(span);
        s.element = span;
        
    });
    
    
}


window.addEventListener("load",function(){

    canvasMouse.create();
    createUI();
    canvasMouse.onresize = resizedCanvas;    
    originX.value = canvasMouse.canvas.width/2;
    originY.value = canvasMouse.canvas.height/2;
    drawCanvasTitle();
    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    fullScreenRender.shaders.grid.prep([0.91,0.91,0.91, 0.982,0.982,0.982, 0,0,0, 1,1,1,1,1,0]);    
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   
});
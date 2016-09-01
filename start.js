var lastMx;
var lastMy;
var screenBounds = {top : 0, bottom : 0, left : 0, right : 0};
var gridBounds = {top : 0, bottom : 0, left : 0, right : 0};

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
var countOutInfo = 40;
var infoCount = 0;
var gridSteps = 4;
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
        if(countOutInfo > 0){
            countOutInfo -= 1;
        }else{
            if(countOutInfo === 0){
                countOutInfo = -1;
                document.getElementById("infoContainer").className = "hide";
                infoCount += 1;
            }
        }
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
    ctx.clearRect(0,0,w,h);
    draw2DCanvasGrid();
    
}

// draws origin lines, ticks, and numbers
function draw2DCanvasGrid(){
    var canvas = canvasMouse.canvas;
    var ctx = canvasMouse.ctx;
    var w = canvas.width;
    var h = canvas.height;    
    var sb = screenBounds;
    var gb = gridBounds;
    
    
    var gridExp = Math.floor(Math.log((gridSteps*32) / scale.real) / Math.log(gridSteps) - 1.0);
    var startGridSize = Math.pow(gridSteps,gridExp); 
    var size = startGridSize * scale.real*gridSteps; // size of ticks in screen space
  

    // get the bounds in screen and grid space
    sb.left = 20;
    sb.top = 20;
    sb.right = w - 20;
    sb.bottom = h - 20;
    gb.left = ((sb.left - originX.real) / scale.real);
    gb.top = ((sb.top - originY.real) / scale.real);
    gb.right = ((sb.right - originX.real) / scale.real);
    gb.bottom = ((sb.bottom - originY.real) / scale.real);
    
    var ox = originX.real; // origin in screen space
    var oy = originY.real;
    
    // get the tick start and ends for origin lines
    var ticStartX = Math.floor((sb.left - ox) / size) * size;
    var ticEndX = (Math.floor((sb.right - ox) / size) + 1) * size;
    var ticStartY = -Math.floor((oy - sb.top) / size) * size;
    var ticEndY = (Math.floor((sb.bottom - oy) / size) + 1) * size    


    // draw the origin lines and ticks
    ctx.lineWidth = 1.5;
    ctx.fillStyle = ctx.strokeStyle = UIColour;
    ctx.beginPath();
    if(ox > sb.left && ox < sb.right){
        ctx.moveTo(Math.round(ox),20);
        ctx.lineTo(Math.round(ox),h-20);   
        for(var i = ticStartY; i < ticEndY; i += size){
            ctx.moveTo(ox - 5,i+oy);
            ctx.lineTo(ox + 5,i+oy);   
        }      
    }
    if(oy > sb.top && oy < sb.bottom){
        ctx.moveTo(20,Math.round(oy));
        ctx.lineTo(w-20,Math.round(oy));
        for(var i = ticStartX; i < ticEndX; i += size){
            ctx.moveTo(i + ox,oy - 5);
            ctx.lineTo(i + ox,oy + 5);   
        }         
    }
    ctx.stroke();
    
    // draw the origin values
    var numStep = gridSteps  * Math.pow(gridSteps,gridExp);
    var dig = 0;
    gridExp += 1; // don't add decimal points to early
    if(gridExp < 0){
        dig = -gridExp;
    }    
    
    size *= 2;
    numStep *= 2;
    var ticStartX = Math.floor((sb.left - ox) / size) * size;
    var ticEndX = (Math.floor((sb.right - ox) / size) + 1) * size;
    var ticStartY = -Math.floor((oy - sb.top) / size) * size;
    var ticEndY = (Math.floor((sb.bottom - oy) / size) + 1) * size      
    ctx.font = "16px arial";  
    ctx.textBaseline = "hanging";
    ctx.textAlign = "center";   
    if(ox > sb.left && ox < sb.right){
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";   
        for(var i = ticStartY; i < ticEndY; i += size){
            var num = (numStep * (i/size)).toFixed(dig);
            ctx.fillText(num,ox-5,i+oy);
        }      
        
    }
    if(oy > sb.top && oy < sb.bottom){
        ctx.textBaseline = "hanging";
        ctx.textAlign = "center";   
        for(var i = ticStartX; i < ticEndX; i += size){
            if(Math.abs(i) >size /2){
                var num = (numStep * (i/size)).toFixed(dig);                
                ctx.fillText(num,i + ox,oy + 6);
            }
        }         
    }
    
    
}


function resizedCanvas(){
    fullScreenRender.canvasResized(canvasMouse.webGL);
    spriteRender.canvasResized(canvasMouse.webGL);
    originX.value = (canvasMouse.canvas.width/2)-mouseRX*scale.value;
    originY.value = (canvasMouse.canvas.height/2)-mouseRY*scale.value;
    drawCanvasTitle();

}

var styles = [
    {   name : "Steps +", 
        data : "control",
    },{
        name : "Steps -",
        data : "control",
    },{
        name : "Home",
        data : "control",        
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
        data : [0.1,0.1,0.1, 0.2,0.2,0.2, 0.0,0.0,0.0, 0,0,1.4, 1.5,1,0],
        color : "black",
    },{
        name : "Blue",
        data : [1.0,1.0,1.0, 0.99,0.99,1.0, 0.0,0.0,1.0 ,1,1,1.2, 1,2,0],
        color : "#00F",
    },{
        name : "Plans",
        data : [0,0.4,0.8, 0.0,0.3,0.8, 0.7,0.8,1.0 ,1,1,1.2, 1,2,0],
        color : "#AFF",
    },     
    
]
function setStyle(event){
    var info = document.getElementById("infoContainer");
    if(infoCount === 1 && this.dataStyle.data !== "control"){
        // hide first info text
        var e = document.querySelectorAll(".firstInfo");
        for(var i = 0; i < e.length; i ++){
            e[i].className = "hide";
        }
        // show second info text
        var e = document.querySelectorAll(".secondInfo");
        for(var i = 0; i < e.length; i ++){
            e[i].className = "firstInfo";
        }
        info.className = "info " + this.dataStyle.name;
        countOutInfo = 40;
    }
    if(this.dataStyle.name === "Home"){
        originX.value = canvasMouse.canvas.width/2;
        originY.value = canvasMouse.canvas.height/2;
        scale.value = 1; 
    }else if(this.dataStyle.data === "control"){
        if(this.dataStyle.name === "Steps +"){
            gridSteps += 1;
        }else{
            gridSteps -= 1;
        }
        gridSteps = Math.max(2, Math.min(16, gridSteps));
        fullScreenRender.shaders.grid.setSteps(gridSteps);
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

    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    fullScreenRender.shaders.grid.prep([0.91,0.91,0.91, 0.982,0.982,0.982, 0,0,0, 1,1,1,1,1,0]);    
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   
});
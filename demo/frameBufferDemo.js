var testImages = {
    urls : ["../Images/MapTest.png","../Images/GrooverCut639551.png","../Images/owl.jpg"], 
    names : ["map","normals","owl"],
    textOptions : [{sampler : "repeatLinear"},{sampler : "repeatLinear"},{sampler : "repeatLinear"}],
    images : {},
    textures : {},    
    
}
var imageURLS = [  // not used just as a reference
"../images/NormalsMapStd.png",
"../images/NormalMapZFull.png",
"../images/NormalMapAlphaSigned.png",
"../images/SlopeMap.png",
"../images/LevelColourStrip.png",
"../images/CliffColourStrip.png",
"../images/EleveationColourStrip.png",
"../images/LevelColour.png",
"../images/CliffColour.png",
"../images/ElevationColour.png",
"../images/ColourCombined.png",
"../images/OcclusionDirectional.png",
"../images/Shadow.png",
"../images/River.png",
"../images/FlowMap4.png",
"../images/StackedHeigth.png",
"../images/MapTest.png",
]

var ready = false;
const ACCELERATION = 0.9;
const DRAG = 0.5; 
var scale = new Chaser(0.001,ACCELERATION,DRAG);
var mx = new Chaser(0.001,ACCELERATION,DRAG);
var my = new Chaser(0.001,ACCELERATION,DRAG);
var firstRender = true;
var bufferSwap = [];
var bufferToUse = 0;
var waitForIt = 0;
var useThreshold = false;
var iterations = 1;

function renderer(){  
    if(!ready){
        logs.log("Waiting");
        return;
    }
    var canvas = canvasMouse.canvas;
    var ctx = canvasMouse.ctx;
    var w = canvas.width;
    var h = canvas.height;
    var gl = canvasMouse.webGL.gl;
    var mouse = canvasMouse.mouse;
    mx.value = mouse.x/w;
    my.value = mouse.y/h;
    mx.update();
    my.update();
    
    if(firstRender){
        firstRender = false;
        bufferSwap[0] = renderTargets.textures.test;
        bufferSwap[1] = renderTargets.textures.test1;
        bufferToUse = 1;
    }
    var fBTB = fullScreenRender.shaders.frameBufferTestB;
    var fBTBMouse= fBTB.mouse;

    var renderTarget = bufferSwap[(bufferToUse) % 2];
    var renderSource = bufferSwap[(bufferToUse + 1) % 2];
    // var renderTarget = bufferSwap[0];
    //var renderSource = bufferSwap[1];
    bufferToUse += 1;
    renderTargets.setTarget(renderTarget);
    // console.log(bufferToUse);
    // gl.clearColor(233.0, 0.0, 0.0, 232.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    gl.composite.over();
    gl.enable(gl.BLEND);

    fullScreenRender.setRenderTarget(renderTarget);
    // fullScreenRender.prepRender(fullScreenRender.shaders.frameBufferTestB, testImages.textures.test);
    fullScreenRender.prepRender(fullScreenRender.shaders.frameBufferTestB);//, renderSource.texture, testImages.textures.test);
    //fullScreenRender.setMultiTexture([renderSource.texture, testImages.textures.test,testImages.textures.direction]);
    fullScreenRender.setMultiTexture([renderSource.texture, testImages.textures.normals,testImages.textures.direction]);
    fBTBMouse.shadow[0] =(canvasMouse.globalTime/100) +  Math.sin(canvasMouse.globalTime/100000) * 100+Math.sin(canvasMouse.globalTime/10000) * 10+Math.sin(canvasMouse.globalTime/1000) * 1;///1000;
    fBTBMouse.shadow[1] = (mx.real -0.5) * 0.01;
    fBTBMouse.shadow[2] = (my.real -0.5) * 0.01;
    fBTBMouse.set(gl);
//        fullScreenRender.shaders.frameBufferTestB.mouseShadow[0] = canvasMouse.globalTime / 1000;
//      fullScreenRender.shaders.frameBufferTestB.mouseShadow[1] = mx.real;
//    fullScreenRender.shaders.frameBufferTestB.mouseShadow[2] = my.real;
    //gl.uniform3fv(fullScreenRender.shaders.frameBufferTestB.mouse, fullScreenRender.shaders.frameBufferTestB.mouseShadow);
  //  fullScreenRender.shaders.frameBufferTestB.mouse(gl);

    scale.value = 1 + Math.sin(canvasMouse.globalTime / 1000) * 0.2 + Math.sin(canvasMouse.globalTime / 130) * 0.2;
    scale.update();
    var ss = Math.sin(canvasMouse.globalTime/6000)*0.021 + Math.sin(canvasMouse.globalTime/94972)*0.021;
    var ss1 =  Math.sin(canvasMouse.globalTime/8560)*0.021 + Math.sin(canvasMouse.globalTime/13946)*0.021;
    fullScreenRender.drawScale(1/(1.0+ss), 1/-(1.0+ss1)); //-scale.real);
 //   fBTBMouse.shadow[0] = canvasMouse.globalTime/1340;//Math.sin(canvasMouse.globalTime/1000) * 10;///1000;
   // fBTBMouse.shadow[1] = 0.5 - (mx.real -0.5) * 0.03;
    //fBTBMouse.shadow[2] = 0.5 - (my.real -0.5) * 0.03;
  //  fBTBMouse.set(gl);
    if(iterations > 1){
        for(var i = 1; i < iterations; i += 2){
            fullScreenRender.draw(0, 0, 1/(1.0-ss), 1/-(1.0-ss1)); //-scale.real);
            fullScreenRender.draw(0, 0, (1.0-ss), -(1.0-ss1)); //-scale.real);
        }
    }

    renderTargets.setDefaultTarget();    
    fullScreenRender.setRenderTarget(null);
    if(useThreshold){
        fullScreenRender.prepRender(fullScreenRender.shaders.bgThreshold,renderTarget.texture);
    }else{
        fullScreenRender.prepRender(fullScreenRender.shaders.backgroundImage,renderTarget.texture);
    }
    fullScreenRender.drawScale(1.2);
    
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
        name : "Threshold",
        func : function(){
            useThreshold = true;
            logs.log("FrameBuffer display Threshold");
        },
        
    },
    {
        name : "32RGBA",
        func : function(){
            useThreshold = false;
            logs.log("FrameBuffer display RGBA");
        },
        
    },{
        name : "Single pass",
        func : function(){
            iterations = 1;
            logs.log("Single pass set")
        }
    },{
        name : "Triple pass",
        func : function(){
            iterations = 1;
            logs.log("Does northing ATM")
        }
    },
];




// Startup.
window.addEventListener("load",function(){
    statsElement = document.getElementById("statsElement");
    statsElement.textContent = "Loading...";
    canvasMouse.create();
    createUI();
    canvasMouse.onresize = resizedCanvas;    
    
    logs.setPosition("10px","20px","200px","300px");
    var l = logs.start({closeBox:true,clear:true});
    logs.log("Hi there :)");    
    
    spriteTile.loadImageSet(testImages);
    
    
    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    renderTargets.setupWebGL(canvasMouse.webGL);   
    var size = 512;
    renderTargets.createTarget("test",size,size);  // creates a 512,512 texture to render to
    renderTargets.createTarget("test1",size,size);  // creates a 512,512 texture to render to
    fullScreenRender.addShader("frameBufferTestB",[{name:"textureSize",value:"8192.0"}]);
    fullScreenRender.addShader("bgThreshold",[{name:"level",value:"0.95"}]);
     if(frameRate){
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }   
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   

    testImages.allLoaded = function(){
        renderTargets.putImageInBuffer(canvasMouse.webGL.gl,"test",testImages.images.map);
        renderTargets.putImageInBuffer(canvasMouse.webGL.gl,"test1",testImages.images.map);

        //webGLHelper.setTextureData(canvasMouse.webGL.gl,renderTargets.textures.test.texture,testImages.images.nude,"RGBA","UNSIGNED_BYTE");
        //webGLHelper.setTextureData(canvasMouse.webGL.gl,renderTargets.textures.test1.texture,testImages.images.nude,"RGBA","UNSIGNED_BYTE");
        ready = true;
        logs.log("Ready");
    }
    
    
});
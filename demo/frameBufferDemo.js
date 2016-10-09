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
    var fBTB = fullScreenRender.shaders.swirl;
    var fBTBMouse= fBTB.mouse;

    var renderTarget = bufferSwap[(bufferToUse) % 2];
    var renderSource = bufferSwap[(bufferToUse + 1) % 2];

    bufferToUse += 1;
    renderTargets.setTarget(renderTarget);

    gl.composite.over();
    gl.enable(gl.BLEND);

    fullScreenRender.setRenderTarget(renderTarget);
    fullScreenRender.prepRender(fullScreenRender.shaders.swirl);
    fullScreenRender.setMultiTexture([renderSource.texture, testImages.textures.normals,testImages.textures.direction]);
    fBTBMouse.shadow[0] =(canvasMouse.globalTime/106) +  Math.sin(canvasMouse.globalTime/105600) * 100+Math.sin(canvasMouse.globalTime/14040) * 10+Math.sin(canvasMouse.globalTime/1350) * 10;///1000;
    fBTBMouse.shadow[1] = Math.sin(canvasMouse.globalTime/6325)*1.021;
    fBTBMouse.shadow[2] = Math.sin(canvasMouse.globalTime/6456)*1.021;
    fBTBMouse.set(gl);
    scale.value = 1 + Math.sin(canvasMouse.globalTime / 1000) * 0.2 + Math.sin(canvasMouse.globalTime / 130) * 0.2;
    scale.update();
    var ss =   Math.sin(canvasMouse.globalTime/6000)*0.0021 + Math.sin(canvasMouse.globalTime/94972)*0.0021+ Math.sin(canvasMouse.globalTime/43946)*0.0006;
    var ss1 =  Math.sin(canvasMouse.globalTime/8560)*0.0021 + Math.sin(canvasMouse.globalTime/63946)*0.0021+ Math.sin(canvasMouse.globalTime/46946)*0.0004;
    fullScreenRender.drawScale(1/(1.0+ss), 1/-(1.0+ss1)); 

    if(iterations > 1){
        for(var i = 1; i < iterations; i += 2){
            fullScreenRender.draw(0, 0, 1/(1.0-ss), 1/-(1.0-ss1)); 
            fullScreenRender.draw(0, 0, (1.0-ss), -(1.0-ss1)); 
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
    }
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
    
    imageManager.loadImageSet(testImages);
    
    
    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    renderTargets.setupWebGL(canvasMouse.webGL);   
    var size = 512;
    renderTargets.createTarget("test",size,size);  // creates a 512,512 texture to render to
    renderTargets.createTarget("test1",size,size);  // creates a 512,512 texture to render to
    fullScreenRender.addShader("swirl",[{name:"textureSize",value:"8192.0"}]);
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
    console.log(webGLHelper.queryExtensions(canvasMouse.webGL.gl).join(","));
    
    
});
/*
ANGLE_instanced_arrays,
EXT_blend_minmax,
EXT_color_buffer_half_float,
EXT_frag_depth,
EXT_shader_texture_lod,
EXT_texture_filter_anisotropic,
OES_element_index_uint,
OES_standard_derivatives,
OES_texture_float,
OES_texture_float_linear,
OES_texture_half_float,
OES_texture_half_float_linear,
OES_vertex_array_object,
WEBGL_color_buffer_float,
WEBGL_compressed_texture_etc1,
WEBGL_compressed_texture_s3tc,
WEBGL_depth_texture,
WEBGL_draw_buffers,
WEBGL_lose_context,
MOZ_WEBGL_lose_context,
MOZ_WEBGL_compressed_texture_s3tc,
MOZ_WEBGL_depth_texture*/

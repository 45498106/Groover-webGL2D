var testImages = imageManager.createImageSet(
        ["../Images/MapTest.png","../Images/GrooverCut639551.png","../Images/owl.jpg","../Images/StackedHeigth.png","../Images/NormalMapZFull.png","../Images/SlopeMap.png","../Images/stripes.png"], 
        ["map","normals","owl","hMap","nMap","sMap","stripes"],
        "repeatLinear"
);
var fxShaderNames = [];
var currentFXShaderIndex = 0;
var fxShader;
var shaderNames = [];
var currentShader = 0;
var currentShader1 = 0;
var currentShader2 = 0;
var shader;
var shader1;
var shader2;
var bgImage = null;
var secondFX;
var bgIndex = 0;
var lookupIndex = 0;
var lookupName = 0;
var lookupElement;
var lookupVal = 0.0;


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
var localTime;
var useLocalTime = false;

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
        bufferSwap[2] = renderTargets.textures.test2;
        bufferToUse = 1;
    }
    var fBTB = shader;
    var fBTBMouse= shader.mouse;
    var settings = shader.settings;
    var buffCount = Math.max(iterations,2);

    var renderTarget = bufferSwap[(bufferToUse) % buffCount];
    var renderSource = bufferSwap[(bufferToUse + 1) % buffCount];

    bufferToUse += 1;
    renderTargets.setTarget(renderTarget);

    gl.composite.over();
    gl.enable(gl.BLEND);

    fullScreenRender.setRenderTarget(renderTarget);
    fullScreenRender.prepRender(shader);
    if(useLocalTime){
    }else{
        localTime = canvasMouse.globalTime;
    }
    fullScreenRender.setMultiTexture([renderSource.texture, bgImage,testImages.textures.direction]);
    fBTBMouse.shadow[0] =(localTime/106) +  Math.sin(localTime/105600) * 100+Math.sin(localTime/14040) * 10+Math.sin(localTime/1350) * 10;///1000;
    fBTBMouse.shadow[1] = Math.sin(localTime/6325)*1.021;
    fBTBMouse.shadow[2] = Math.sin(localTime/6456)*1.021;
    fBTBMouse.set(gl);
    if(settings !== undefined){
        if(mouse.buttonRaw === 2){
            lookupVal += 16;
            if("textureSize".indexOf(lookupName) > -1){
                settings.shadow[settings.lookups[lookupName]] = Math.pow((mouse.x / w) *160,2);;
            }else if("oomOccScale".indexOf(lookupName) > -1){
                settings.shadow[settings.lookups[lookupName]] = ((mouse.x / w)-0.5) * 0.1 + (mouse.y / h) * (0.1 / h);
                
            }else{
                settings.shadow[settings.lookups[lookupName]] = ((mouse.x / w)-0.5) *128 + (mouse.y / h) * (128 / h) ;;
            }
            lookupElement.textContent = "Setting : " + lookupName + " = " + settings.shadow[settings.lookups[lookupName]];
            settings.set(gl);
        }
    }
    scale.value = 1 + Math.sin(localTime / 1000) * 0.2 + Math.sin(localTime / 130) * 0.2;
    scale.update();
    var ss =   Math.sin(localTime/6000)*0.0021 + Math.sin(localTime/94972)*0.0021+ Math.sin(localTime/43946)*0.0006;
    var ss1 =  Math.sin(localTime/8560)*0.0021 + Math.sin(localTime/63946)*0.0021+ Math.sin(localTime/46946)*0.0004;
    fullScreenRender.drawScale(1/(1.0+ss), 1/-(1.0+ss1)); 

    if(iterations >= 2){
        var renderTarget = bufferSwap[(bufferToUse) % buffCount];
        var renderSource = bufferSwap[(bufferToUse + (buffCount-1)) % buffCount];
        var fBTB = shader1;
        var fBTBMouse= shader1.mouse;

        bufferToUse += 1;
        renderTargets.setTarget(renderTarget);        
        fullScreenRender.setRenderTarget(renderTarget);
        fullScreenRender.prepRender(shader1);
        fullScreenRender.setMultiTexture([renderSource.texture, renderSource.texture,testImages.textures.direction]);
        fBTBMouse.shadow[0] =(localTime/206) +  Math.sin(localTime/55600) * 100+Math.sin(localTime/7040) * 10+Math.sin(localTime/3350) * 10;///1000;
        fBTBMouse.shadow[1] = Math.sin(localTime/8325)*1.021;
        fBTBMouse.shadow[2] = Math.sin(localTime/10456)*1.021;
        fBTBMouse.set(gl);
        fullScreenRender.drawScale(1/(1.0+ss), 1/-(1.0+ss1)); 
    }
    if(iterations === 3){
        var renderTarget = bufferSwap[(bufferToUse) % buffCount];
        var renderSource = bufferSwap[(bufferToUse + 2) % buffCount];
        var fBTB = shader2;
        var fBTBMouse= shader1.mouse;

        //bufferToUse += 1;
        renderTargets.setTarget(renderTarget);        
        fullScreenRender.setRenderTarget(renderTarget);
        fullScreenRender.prepRender(shader2);
        fullScreenRender.setMultiTexture([renderSource.texture, renderSource.texture,testImages.textures.direction]);
        fBTBMouse.shadow[0] =(localTime/107) +  Math.sin(localTime/25600) * 100+Math.sin(localTime/4040) * 10+Math.sin(localTime/2350) * 10;///1000;
        fBTBMouse.shadow[1] = Math.sin(localTime/8325)*1.021;
        fBTBMouse.shadow[2] = Math.sin(localTime/10456)*1.021;
        fBTBMouse.set(gl);
        fullScreenRender.drawScale(1/(1.0+ss), 1/-(1.0-ss1)); 
    }


    renderTargets.setDefaultTarget();    
    fullScreenRender.setRenderTarget(null);
    fullScreenRender.prepRender(fxShader,renderTarget.texture);
    if(fxShader.powVal){
        if(mouse.buttonRaw === 2){
            fxShader.powVal.shadow[0] = ((mouse.x / w) * 4) + 1;

        }
        fxShader.powVal.set(gl);
    }
    if(fxShader.lightPos){
        if(mouse.buttonRaw === 2){
            fxShader.lightPos.shadow[0] = mouse.x / w -0.5;
            fxShader.lightPos.shadow[1] = mouse.y / h -0.5;

        }
        fxShader.lightPos.set(gl);
        
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
var fxShaderNames = [];
var currentFXShaderIndex = 0;
var fxShader;

// the UI controls at bottom of page
var UIInfo = [
    {
        name : "Background",
        title : "The final output rendering shader used.",
        func : function(){
            currentFXShaderIndex += 1;
            currentFXShaderIndex %= fxShaderNames.length;
            fxShader = fullScreenRender.shaders[fxShaderNames[currentFXShaderIndex]];
            if(fxShaderNames[currentFXShaderIndex] === "bgColourCurve"){            
                logs.log("Middle click and drag left to right to set this shader.");
            }
            return fxShaderNames[currentFXShaderIndex];
        },
        
    },
    {
        name : "Image",
        title : "Click to change the source image. basicly changes the colours.",
        func : function(){
            bgIndex += 1;
            bgIndex %= testImages.names.length;
            bgImage = testImages.textures[testImages.names[bgIndex]];
            return testImages.names[bgIndex];
            

        },
        
    },
    {
        name : "Single pass",
        title : "Click to change from single pass to double pass rendering. The second pass is set by the 2nd button to the right",
        func : function(){
            if(iterations === 1){                
                iterations = 2;
                secondFX = fxShader;
                return "2 FX " + fxShaderNames[currentFXShaderIndex];
            }
            if(iterations === 2){                
                iterations = 3;
                secondFX = fxShader;
                return "3 FX " + fxShaderNames[currentFXShaderIndex];
            }
            iterations = 1;
            return "1 FX pass";
        }
    },
    {
        name : "Swirl",
        title : "Click to change 1st pass shader",
        func : function(){
            currentShader += 1;
            currentShader %= shaderNames.length;
            shader = fullScreenRender.shaders[shaderNames[currentShader]];
            if(currentShader === 2){
                logs.log("Swirl2 needs extra settings.");
            }

            return shaderNames[currentShader];
        }
    } ,
    {
        name : "Swirl",
        title : "Click to change 2nd pass shader",
        func : function(){
            currentShader1 += 1;
            currentShader1 %= shaderNames.length;
            shader1 = fullScreenRender.shaders[shaderNames[currentShader1]];
            if(currentShader1 === 2){
                logs.log("Swirl2 needs extra settings.");
            }

            return shaderNames[currentShader1];
        }
    } ,
    {
        name : "Swirl",
        title : "Click to change 3rd pass shader",
        func : function(){
            currentShader2 += 1;
            currentShader2 %= shaderNames.length;
            shader2 = fullScreenRender.shaders[shaderNames[currentShader1]];
            if(currentShader2 === 2){
                logs.log("Swirl2 needs extra settings.");
            }

            return shaderNames[currentShader2];
        }
    } ,
    {
        name : "Settings",
        title : "VERY experimental and only apply to Swirl2. Click to select property then center button and drag mouse left to right to change value",
        func : function(element){
            if(shader.settings){
                lookupIndex += 1;
                lookupIndex %= shader.settings.lookupNames.length;
                lookupName = shader.settings.lookupNames[lookupIndex];
                lookupElement = element;

                return "Setting : " + lookupName + " = " + shader.settings.shadow[shader.settings.lookups[lookupName]];
            }
        }
    },
    {
        name : "Vary On",
        title : "If on render setting are slowly varied over time, if off they are fixed to the moment you click this button.",
        func : function(element){
            useLocalTime = !useLocalTime;
            if(useLocalTime){
                return "Vary Off";
            }
            return "Vary On.";
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
    logs.log("Log display.");    
    logs.log("This page is under development.");    
    
    imageManager.loadImageSet(testImages);
    
    
    webGLHelper.createCompositeFilters(canvasMouse.webGL.gl);
    fullScreenRender.setupWebGL(canvasMouse.webGL);
    spriteRender.setupWebGL(canvasMouse.webGL);   
    renderTargets.setupWebGL(canvasMouse.webGL);   
    var size = 512;
    renderTargets.createTarget("test",size,size);  // creates a 512,512 texture to render to
    renderTargets.createTarget("test1",size,size);  // creates a 512,512 texture to render to
    renderTargets.createTarget("test2",size,size);  // creates a 512,512 texture to render to
    fullScreenRender.addShader("swirl");
    fullScreenRender.addShader("swirl1");
    fullScreenRender.addShader("swirl2");
    fullScreenRender.addShader("swirl3");
    fullScreenRender.addShader("bgThreshold",[{name:"level",value:"0.95"}]);
    fullScreenRender.addShader("bgColourStretch");
    fullScreenRender.addShader("bgColourCurve");
    fullScreenRender.addShader("bgColourStretchCurve");
    fullScreenRender.addShader("bgLight");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteSharpen"}],"sharpen");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteEmbos"}],"embos");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteEmbosColour"}],"embosColour");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteEdge"}],"edge");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteEdgeStrong"}],"edgeStrong");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteEdgeColour"}],"edgeColour");
    fullScreenRender.addShader("bgConvolute",[{name:"type",value:"convoluteBlur"}],"blur");
    
    fxShaderNames.push("backgroundImage");
    fxShaderNames.push("bgThreshold");
    fxShaderNames.push("bgColourCurve");
    fxShaderNames.push("bgColourStretchCurve");
    fxShaderNames.push("bgLight");
    fxShaderNames.push("bgColourStretch");
    fxShaderNames.push("sharpen");
    fxShaderNames.push("embos");
    fxShaderNames.push("embosColour");
    fxShaderNames.push("edge");
    fxShaderNames.push("edgeStrong");
    fxShaderNames.push("edgeColour");
    fxShaderNames.push("blur");
    currentFXShaderIndex = 0;
    fxShader = fullScreenRender.shaders[fxShaderNames[currentFXShaderIndex]];
    
    
    shaderNames.push("swirl");
    shaderNames.push("swirl1");
    shaderNames.push("swirl2");
    shaderNames.push("swirl3");
    shader = fullScreenRender.shaders[shaderNames[0]];    
    shader1 = fullScreenRender.shaders[shaderNames[1]];    
    shader2 = fullScreenRender.shaders[shaderNames[2]];    
    
    
    if(shader2.constants !== undefined){
        logs.log("Vertex constants");    
        shader2.constants.vertex.forEach(c => {
            if(!isNaN(c.value)){
                logs.nameVal(c);
            }
         })

        logs.log("Fragment constants");    
        shader2.constants.fragment.forEach(c => {
            if(!isNaN(c.value)){
                logs.nameVal(c);
            }
         })

    }
    
    
    
    currentShader = 0;
     if(frameRate){
        frameRate.displayCallback = updateStats;
        canvasMouse.renderStack.push(frameRate.update);
    }   
    canvasMouse.renderStack.push(renderer);
    canvasMouse.start();   

    testImages.allLoaded = function(){
        renderTargets.putImageInBuffer(canvasMouse.webGL.gl,"test",testImages.images.map);
        renderTargets.putImageInBuffer(canvasMouse.webGL.gl,"test1",testImages.images.map);
        renderTargets.putImageInBuffer(canvasMouse.webGL.gl,"test2",testImages.images.map);
        ready = true;
        bgImage = testImages.textures[bgIndex];        
        logs.log("Image loaded and Ready");
    }

    
    
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

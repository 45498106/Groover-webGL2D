

// this needs to be renamed..
var fullScreenRender = (function(){
    var shaders = {};
    var id = 0;
    var gl;
    var w,h; // width and height of canvas
    var setBuffer= function (buffer, name, data, size){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(name);
        gl.vertexAttribPointer(name, size, gl.FLOAT, false, 0, 0);        
    }       

    var cs;
    var gridColours = new Float32Array([0.8,0.8,0.8, 0.9,0.9,0.9, 0,0,0, 0.95,0.95,1, 1,1,0]);
    var gridAlphas = new Float32Array([0.8,0.8,0.8,4]);
    var gridSteps = 4;
    var setColours = function(data,offset){
        if(data !== undefined){
             if(cs === null || cs.id !== shaders.grid.id){
                cs = this.currentShader = shaders.grid;
                gl.useProgram(cs.program);  
            }           
            if(Array.isArray(data)){
                gridColours.set(data,offset);
            }else{
                gridSteps = data.steps !== undefined ? data.steps : gridSteps;
            }
        }
        gl.uniform3fv(cs.colours, gridColours);
    }
    var tileSize = new Float32Array([0,0,0,0]);
    var tileMap = new Float32Array([0,0,0,0,0,0]);
    var tileGridPrep = function(data,offset){
        if(data !== undefined){

            if(cs === null || cs.id !== shaders.tileGrid.id){
                cs = this.currentShader = shaders.tileGrid;
                gl.useProgram(cs.program);  
                console.log(cs);                
            }

            tileMap[0] = data.tiles.tileWidth;
            tileMap[1] = data.tiles.tileHeight;
            tileMap[2] = data.map.width;
            tileMap[3] = data.map.height; 
            tileMap[4] = w/data.tiles.image.width;
            tileMap[5] = h/data.tiles.image.height;  
            tileSize[0] = data.tiles.tilesX;
            tileSize[1] = data.tiles.tilesY;
            tileSize[2] = (1/w)*(w/data.tiles.image.width) * data.tiles.tileWidth;
            tileSize[3] = (1/h)*(h/data.tiles.image.height) *data.tiles.tileHeight ;
            gl.uniform2fv(cs.tileSize,tileSize);
            gl.uniform2fv(cs.tiles,tileMap);
            
        }else{
            gl.uniform1i(cs.texture0, 0);  // texture unit 0
            gl.uniform1i(cs.map, 1);  // texture unit 1        
            gl.uniform2fv(cs.tileSize,tileSize);
            gl.uniform2fv(cs.tiles,tileMap);
        }
        
    }
    var textureBuffer = null;
    var positionBuffer = null;
    var textureQuad = webGLHelper.createQuad();
    var positionQuad = webGLHelper.createQuad(2,0.5);
    var origin = new Float32Array([0,0]);
    var scale = new Float32Array([1,1]);
    var screen = new Float32Array([1/512,1/512]);
    var API = {
        shaders : shaders,
        currentShader : null,
        canvasResized : function(webGL){
            w = webGL.width;
            h = webGL.height;
            gl = webGL.gl;
            screen[0] = 1/w;
            screen[1] = 1/h;            
        },
        setRenderTarget : function(target){ // a renderTargets texture object (not a true GL texture) or null
            if(target ===  null){
                w = gl.drawingBufferWidth;
                h = gl.drawingBufferHeight;
                screen[0] = 1/w;
                screen[1] = 1/h;                 
            }else{
                w = target.width;
                h = target.height;
                screen[0] = 1/w;
                screen[1] = 1/h;                 
            }            
        },

        addShader : function(name,consts,as){
            if(webGLHelper.doesProgramSourceExist(name)){
                cs = webGLHelper.createProgram(gl,name,consts);
                if(typeof as === "string"){                    
                    shaders[as] = cs; 
                    cs.name = as;
                }else{
                    shaders[cs.name] = cs;
                }
                this.currentShader = cs = null;
            }else{
                throw new RangeError("fullScreenRender No source code found for program '"+name+"'");
            }
        },
        setupWebGL : function(webGL){
            w = webGL.width;
            h = webGL.height;
            gl = webGL.gl;
            cs = webGLHelper.createProgram(gl,"backgroundImage");
            shaders[cs.name] = cs; 
            //cs = webGLHelper.createProgram(gl,"fillScreen");
            //shaders[cs.name] = cs; 
            cs = webGLHelper.createProgram(gl,"grid");
            shaders[cs.name] = cs;
            cs.prep = setColours;
            cs = webGLHelper.createProgram(gl,"tileGrid");
            shaders[cs.name] = cs;
            cs.prep = tileGridPrep;
            
            this.currentShader = cs = null;
            textureBuffer = gl.createBuffer();
            positionBuffer = gl.createBuffer();            
        },
        prepRender : function (shader = this.currentShader,texture,texture1){
            cs = this.currentShader = shader;
            gl.useProgram(cs.program);
            if(texture !== undefined){
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }
            if(texture1 !== undefined){
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture1);
            }
            setBuffer(textureBuffer,cs.texCoords,textureQuad,2);
            setBuffer(positionBuffer,cs.position,positionQuad,2);
            screen[0] = 1/w;
            screen[1] = 1/h;
            gl.uniform2fv(cs.screen, screen);
            if(cs.prep !== undefined){
                cs.prep();
            }else{
                if(texture !== undefined){
                    gl.uniform1i(cs.texture0, 0);  // texture unit 0
                }
                if(texture1 !== undefined){
                    gl.uniform1i(cs.texture1, 1);  // texture unit 1                 
                }
            }
        },   
        setMultiTexture : function(textures){
            for(var i = 0; i < textures.length; i ++){
                gl.activeTexture(gl["TEXTURE"+i]);
                gl.bindTexture(gl.TEXTURE_2D, textures[i]);
                gl.uniform1i(cs["texture"+i], i);  // texture unit 0
            }
            
            
        },
        drawGrid : function(originX,originY,scaleXY){
            var startGridSize = Math.pow(gridSteps,Math.floor(Math.log((32 * gridSteps) / scaleXY) / Math.log(gridSteps) - 1.0));
            var fade = Math.pow(((startGridSize * scaleXY)-(gridSteps/2))/(32-gridSteps/2),gridColours[12]);
            gridAlphas[0] = startGridSize * scaleXY;
            gridAlphas[1] = fade;
            gridAlphas[2] = Math.pow(0.5,gridColours[12]);
            gridAlphas[3] = gridSteps;
            
            origin[0] = (-originX) * screen[0];
            origin[1] = (h-originY) * screen[1];
            scale[0] = scaleXY;
            scale[1] = scaleXY;
            gl.uniform2fv(cs.origin, origin);
            gl.uniform2fv(cs.scale, scale);
            gl.uniform4fv(cs.desc, gridAlphas);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        
    
        draw : function(originX,originY,scaleXY,scaleY){
            origin[0] = (-originX) * screen[0];
            origin[1] = (h-originY) * screen[1];            
            scale[0] = scaleXY;
            scale[1] = scaleY === undefined ? scaleXY :scaleY;
            gl.uniform2fv(cs.origin, origin);
            gl.uniform2fv(cs.scale, scale);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        drawScale : function(scaleXY,scaleY){
            scale[0] = scaleXY;
            scale[1] = scaleY === undefined ? scaleXY :scaleY;
            gl.uniform2fv(cs.scale, scale);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        
        
    };
    return API;
})();


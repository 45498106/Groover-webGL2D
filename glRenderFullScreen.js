
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
    var setColours = function(data,offset){
        if(data !== undefined){
            gridColours.set(data,offset);
        }
        gl.uniform3fv(cs.colours, gridColours);
    }
    var tileSize = new Float32Array([0,0,0,0]);
    var tileMap = new Float32Array([0,0,0,0,0,0]);
    var tileGridPrep = function(data,offset){
        if(data !== undefined){

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
            log(tileSize)
            gl.uniform2fv(cs.tileSize,tileSize);
            gl.uniform2fv(cs.tiles,tileMap);
            
        }else{
            gl.uniform1i(cs.texture, 0);  // texture unit 0
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
    var screen = new Float32Array([1/512,-1/512]);
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
        setupWebGL : function(webGL){
            w = webGL.width;
            h = webGL.height;
            gl = webGL.gl;
            cs = webGLHelper.createProgram(gl,"fillScreen");
            shaders[cs.name] = cs; 
            cs = webGLHelper.createProgram(gl,"grid");
            shaders[cs.name] = cs;
            cs.prep = setColours;
            cs = webGLHelper.createProgram(gl,"tileGrid");
            shaders[cs.name] = cs;
            cs.prep = tileGridPrep;
            
            this.currentShader = cs;
            textureBuffer = gl.createBuffer();
            positionBuffer = gl.createBuffer();            
        },
        prepRender : function (shader = this.currentShader,texture,texture1){
            cs = this.currentShader = shader;
            gl.useProgram(cs.program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if(texture1 !== undefined){
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture1);
            }
            setBuffer(textureBuffer,cs.texCoord,textureQuad,2);
            setBuffer(positionBuffer,cs.position,positionQuad,2);
            screen[0] = 1/w;
            screen[1] = 1/h;
            gl.uniform2fv(cs.screen, screen);
            if(cs.prep !== undefined){
                cs.prep();
            }
        },   
        draw : function(originX,originY,scaleXY){
            origin[0] = -originX;
            origin[1] = h-originY;
            scale[0] = scaleXY;
            scale[1] = scaleXY;
            gl.uniform2fv(cs.origin, origin);
            gl.uniform2fv(cs.scale, scale);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        
    };
    return API;
})();
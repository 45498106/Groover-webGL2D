
var spriteRender = (function(){
    var spriteUniform = new Float32Array([0,0,1,1,0,0,1,1,0,1,0,0,0,0,0,0]);
    var tileUniform = new Float32Array([0,0,1,1,2,4]);
    var textureBuffer;
    var positionBuffer;    
    var textureQuad = webGLHelper.createQuad(1);
    var positionQuad = webGLHelper.createQuad(1,0.5);
    var setBuffer= function (buffer, name, data){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(name);
        gl.vertexAttribPointer(name, 2, gl.FLOAT, false, 0, 0);        
    }    
    
    var linePositionBuffer;
    var linePositionQuad = webGLHelper.createQuad(0.0,-0.5,1,0.5);
    var linePrep = function(){
         setBuffer(linePositionBuffer,cs.position,linePositionQuad);  
    };
    var spriteLocations = null;            
    var batchSize = 128;
    var batch = new Float32Array(batchSize*5);
    var batched = 0;
    var batchSpritePosBuffer;
    var batchSpritePos =  webGLHelper.createQuickSpriteArray(batchSize);
    var batchSpritePrep = function(data){
        setBuffer(batchSpritePosBuffer,cs.position,batchSpritePos);   
        gl.uniform4iv(cs.loc,spriteLocations);  
        batched = 0;
    };     

    var sw,sh,gl,spr;
    var shaders ={};
    var cs;
    var w,h;
    var API = {

        shaders : shaders,
        currentShader : null,
        canvasResized : function(webGL){
            w = webGL.width;
            h = webGL.height;
            gl = webGL.gl;
        },        
        setupWebGL : function(webGL){
            w = webGL.width;
            h = webGL.height;            
            gl = webGL.gl;

            
            cs = webGLHelper.createProgram(gl,"tiles");
            shaders[cs.name] = cs;
            cs = webGLHelper.createProgram(gl,"sprite");
            shaders[cs.name] = cs;
            cs = webGLHelper.createProgram(gl,"lines");
            shaders[cs.name] = cs;
            cs.prep = linePrep;
            cs = webGLHelper.createProgram(gl,"batchTileSprite");
            shaders[cs.name] = cs;
            cs.prep = batchSpritePrep;
            cs = webGLHelper.createProgram(gl,"batchSprite");
            shaders[cs.name] = cs;
            cs.prep = batchSpritePrep;
            linePositionBuffer = gl.createBuffer();
            batchSpritePosBuffer  = gl.createBuffer();   
            positionBuffer = gl.createBuffer();    
            textureBuffer = gl.createBuffer();                

        },
        prepRender : function (shader = this.currentShader,sprite){
            cs = this.currentShader = shader;
            gl.useProgram(cs.program);
            if(sprite !== undefined){
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
                sw = sprite.image.width;
                sh = sprite.image.height;
                spr = sprite.sprites;          
                if(sprite.tiles !== undefined){
                    spriteLocations= sprite.locations;
                    //spriteUniform[12] = -1 ;
                }else if(sprite.sprites !== undefined){
                    spriteLocations= sprite.locations;
                    //spriteUniform[12] = sprite.sprites.length ;
                }
                spriteUniform[14] = sw;
                spriteUniform[15] = sh;    
            }
            if(cs.prep !== undefined){
                cs.prep();
           }else{
                setBuffer(textureBuffer, cs.texcoord, textureQuad);
                setBuffer(positionBuffer, cs.position, positionQuad);                         
            }
            spriteUniform[9] = w/h;
            tileUniform[4] = 1;
            tileUniform[5] = 1;
        },
        setSpriteLocationBuffer : function(sprite){
            /*
            if(sprite.tiles !== undefined){
                spriteLocations= sprite.locations;
                spriteUniform[12] = -1 ;
            }else if(sprite.sprites !== undefined){
                spriteLocations= sprite.locations;
                spriteUniform[12] = sprite.sprites.length ;
            }
            spriteUniform[14] = sw;
            spriteUniform[15] = sh; */

        },
        setCenter : function(cx = 0,cy = 0){
            var su = spriteUniform;
            su[12] = cx;
            su[13] = cy;
        },
        flush : function(){
            if(batched > 0){
                gl.uniform2fv(cs.desc, spriteUniform);
                gl.uniform1fv(cs.pos, batch);
                gl.drawArrays(gl.TRIANGLES, 0, (batched / 5 )*6);
                batched = 0;
            }            
        },
        drawSpriteBatch : function (index,x,y,scale,rot,alpha){
            var su = spriteUniform;
            var s = spr[index];
            if(batched === 0){
                su[4] = s[4];
                su[5] = s[5];
                su[6] = s[6];
                su[7] = s[7];
                su[10] = alpha;
                su[11] = 1;
                //su[12] = 0.05;
                //su[13] = 0.0;                
            }
            batch[batched++] = x/w;
            batch[batched++] = y/-h;
            batch[batched++] = s[2]/w*scale;
            batch[batched++] = rot;      
            batch[batched++] = index;      
            if(batched === batchSize*5){
                gl.uniform2fv(cs.desc, su);
                gl.uniform1fv(cs.pos, batch);
                gl.drawArrays(gl.TRIANGLES, 0, batchSize*6);
                batched = 0;
            }
        },        
        drawLineScale : function (index,x,y,x1,y1,scaleX,scale,alpha){
            var su = spriteUniform;
            var tu = tileUniform;
            var s = spr[index];
            tu[0] = s[4]; // normalised sprite sheet pos
            tu[1] = s[5];
            tu[2] = s[6];
            tu[3] = s[7];            
            su[6] = s[2]/w * scaleX; // normalised sprite screen pixel
            su[7] = (s[3]/w); 
            su[10] = alpha;
            su[11] = scale;
            su[0] = x/w;
            su[1] = y/-h;
            su[2] = x1/w;
            su[3] = y1/-h;      
            gl.uniform2fv(cs.tile, tu);
            gl.uniform2fv(cs.desc, su);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },                
        drawLine : function (index,x,y,x1,y1,scale,alpha){
            var su = spriteUniform;
            var tu = tileUniform;
            var s = spr[index];
            tu[0] = s[4]; // normalised sprite sheet pos
            tu[1] = s[5];
            tu[2] = s[6];
            tu[3] = s[7];            
            su[6] = s[2]/w; // normalised sprite screen pixel
            su[7] = (s[3]/w); 
            su[10] = alpha;
            su[11] = scale;
            su[0] = x/w;
            su[1] = y/-h;
            su[2] = x1/w;
            su[3] = y1/-h;      
            gl.uniform2fv(cs.tile, tu);
            gl.uniform2fv(cs.desc, su);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },        
        drawTile : function (index,x,y,tx,ty,scale,alpha){
            var su = spriteUniform;
            var tu = tileUniform;
            var s = spr[index];
            tu[4] = su[4] = tx;
            tu[5] = su[5] = ty;
            tu[0] = s[4];
            tu[1] = s[5];
            tu[2] = s[6];
            tu[3] = s[7];
            su[10] = alpha;
            su[11] = scale;
            su[0] = x/w;
            su[1] = y/-h;
            su[2] = s[2]/w;
            su[3] = s[3]/w;      
            gl.uniform2fv(cs.tile, tu);
            gl.uniform2fv(cs.desc, su);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        drawSprite : function (index,x,y,scale,rot,alpha){
            var su = spriteUniform;
            var s = spr[index];
            su[4] = s[4];
            su[5] = s[5];
            su[6] = s[6];
            su[7] = s[7];
            su[8] = rot;
            su[10] = alpha;
            su[11] = scale;
            su[0] = x/w;
            su[1] = y/-h;
            su[2] = s[2]/w;
            su[3] = s[3]/w;     
            gl.uniform2fv(cs.desc, su);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        },
        drawSpriteCenter : function (index,x,y,cx,cy,scale,alpha){
            var su = spriteUniform;
            var s = spr[index];
            su[4] = s[4];
            su[5] = s[5];
            su[6] = s[6];
            su[7] = s[7];
            su[8] = rot;
            su[12] = -cx;
            su[13] = cy;
            su[10] = alpha;
            su[11] = scale;
            su[0] = x/w;
            su[1] = y/-h;
            su[2] = s[2]/w;
            su[3] = s[3]/w;      
            gl.uniform2fv(cs.desc, su);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    };
    return API;
})();
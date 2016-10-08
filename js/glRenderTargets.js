/* Utility for creating named frame buffers */
var renderTargets = (function(){
    var textures = {};
    var gl;
    var API = {        
        textures : textures,
        createTarget : function(name,width,height){
            var tex = textures[name];
            if(tex === undefined){
                tex = {};
                textures[name] = tex;
                tex.name = name;
                tex.width = width;
                tex.height = height;
                tex.buffer = webGLHelper.createFrameBuffer(gl,width,height);
                tex.texture = webGLHelper.createEmptyTexture(gl,width,height);
        
                tex.renderBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, tex.renderBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,width,height);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex.texture, 0);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, tex.renderBuffer);
            }else{
                throw new ReferanceError("Render texture '"+name+"' already exists!!");
            }
            return tex;
        },
        setTarget : function(tex){
            gl.bindFramebuffer(gl.FRAMEBUFFER,tex.buffer);
            gl.viewport(0, 0, tex.width,tex.height);    
        },
        setDefaultTarget : function(){
            gl.bindFramebuffer(gl.FRAMEBUFFER,null);
            gl.viewport(0, 0, gl.canvas.width,gl.canvas.height);    
        },
        putImageInBuffer : function(gl,tex,image){
            if(typeof tex === "string"){
                tex = this.textures[tex];
            }
            if(tex === undefined || tex === null || tex.texture === undefined){
                throw new ReferenceError("renderTargets.putImageInBuffer requires a valid renderTargets.texture container");
            }
            if(tex.width !== image.width || tex.height !== image.height){
                console.warn("Can not put image in buffer. Image size does not match. Stay tuned, will have options to deal with this soon.");
                return;
            }
            webGLHelper.setTextureData(gl,tex.texture,image,"RGBA","UNSIGNED_BYTE");
        },
        canvasResized : function(webGL){
            gl = webGL.gl;
        },
        setupWebGL : function(webGL){
            gl = webGL.gl;
        },
    };
    return API;
})();
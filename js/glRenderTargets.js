/* This object is just a place holder and has none of the required functionality yet. */


// this interface provides a way of managing render targets. 
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
        canvasResized : function(webGL){
            gl = webGL.gl;
        },
        setupWebGL : function(webGL){
            gl = webGL.gl;
        },
    };
    return API;
})();
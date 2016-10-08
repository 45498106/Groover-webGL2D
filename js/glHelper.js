// The simple rule for using this interface. NEVER USE WHILE RENDERING
// This is only for set up and when time does not matter. 


var webGLHelper = (function(){
    /* ***************************************************************************************************
    The following functions are helpers for Shader variables. Rather than having to type all the mumbo
    jumbo to locate shader variable and then store the location ID getVariables and getLocations does
    it for you. uniform and attribute variable that are prefixed with # are can used via the gl.locs.name
    (no space between # and variable type #attribute is good  # attribute is bad)
    For example
      #uniform vec3 myVec;  // the shader source code
    Is located and given the name myVec in gl.locs  and can be set in javascript
      gl.uniform3f(gl.locs.myVec, 0.3, 0.5, 0.8);  //
    Please not that this makes shaders source code none standard and will not compile as is without these
    functions . Just remove the #
    *************************************************************************************************** */
    const VAR_TYPES = ["attribute","uniform","name","shadow","include"]; // all have #pre fix
    const VAR_KEYWORDS = ["names","linkNames","program","id","name","prep",]; // list of keywords
    const VAR_LOCATE_FUNC = {attribute : "getAttribLocation", uniform : "getUniformLocation"};
    const SHADER_TYPE_NAMES = ["vertex","fragment"];
    function isKeyWord(word){ return VAR_KEYWORDS.indexOf(word) > -1;}
    
   
    
    
    // Gl types constants and more
    var GLVersion = 2;
    const GL = {
        imageFormats : "ALPHA,RGB,RGBA,LUMINANCE,LUMINANCE_ALPHA".split(","),
        imageTypes : ["UNSIGNED_BYTE","UNSIGNED_SHORT_5_6_5","UNSIGNED_SHORT_4_4_4_4","UNSIGNED_SHORT_5_5_5_1"],
    }
    const GL2 = {
        imageFormats : "R8,R16F,R32F,R8UI,RG8,RG16F,RG32F,RGUI,RGB8,SRGB8,RGB565,R11F_G11F_B10F,RGB9_E5,RGB16F,RGB32F,RGB8UI,RGBA8,SRGB_APLHA8,RGB5_A1,RGBA4444,RGBA16F,RGBA32F,RGBA8UI".split(","),
        imageTypes :["BYTE","UNSIGNED_SHORT","SHORT","UNSIGNED_INT","INT","HALF_FLOAT","FLOAT","UNSIGNED_INT_2_10_10_10_REV","UNSIGNED_INT_10F_11F_11F_REV","UNSIGNED_INT_5_9_9_9_REV","UNSIGNED_INT_24_8","FLOAT_32_UNSIGNED_INT_24_8_REV"],
    }
    
    const extensions = {
        WEBGL_depth_texture : {
            ImageFormates : ["DEPTH_COMPONENT","DEPTH_STENCIL"],
        },
        EXT_sRGB : {
            imageFormats : ["SRGB_EXT","SRGB_ALPHA_EXT"],
        }
    }
    function vetGL(gl,functionName){
        if(gl === undefined){
            if(canvasMouse === undefined || canvasMouse.webGL === undefined || canvasMouse.webGL.gl === undefined){
                throw new ReferenceError("webGLHelper." + functionName + " requires a valid gl context");
            }
            return canvasMouse.webGL.gl;
        }
        return gl;
    }
    const qS = { // quick setting functions
         clampX : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); },
         clampY : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); },
         mirrorX : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); },
         mirrorY : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); },
         repeatX : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); },
         repeatY : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); },
         minNear : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); },
         magNear : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); },
         minLinear : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); },
         magLinear : function(gl){ gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); },
         clampNear : function(gl){ qS.clampX(gl);qS.clampY(gl);qS.minNear(gl);qS.magNear(gl); },
         clampLinear : function(gl){ qS.clampX(gl);qS.clampY(gl);qS.minLinear(gl);qS.minLinear(gl); },
         mirrorNear : function(gl){ qS.mirrorX(gl);qS.mirrorY(gl);qS.minNear(gl);qS.magNear(gl); },
         mirrorLinear : function(gl){ qS.mirrorX(gl);qS.mirrorY(gl);qS.minLinear(gl);qS.minLinear(gl); },
         repeatNear : function(gl){ qS.repeatX(gl);qS.repeatY(gl);qS.minNear(gl);qS.magNear(gl); },
         repeatLinear : function(gl){ qS.repeatX(gl);qS.repeatY(gl);qS.minLinear(gl);qS.minLinear(gl); },
    };    
    function vetImageFormat(gl,format,caller,useDefault){
        gl = vetGL(gl,caller);
        if(format !== null && format !== undefined){
            if(typeof format === "string"){
                if(GL.imageFormats.indexOf(format) > -1){
                    return gl[format];
                }
                if(GLVersion >= 2){
                    if(GL2.imageFormats.indexOf(format) > -1){
                        return gl[format];
                    }
                }
            }else{
                if(GL.imageFormats.find(name => gl[name] === format) !== undefined){
                    return format;
                }
                if(GLVersion >= 2){
                    if(GL2.imageFormats.find(name => gl[name] === format) !== undefined){
                        return format;
                    }
                }
            }
        } else if(useDefault === true){

            if(API.debug){
                console.warn("webGLHelper." + caller + " unknown image format. Default RGBA used");
            }
            return gl.RGBA;
        }
        throw new ReferenceError("webGLHelper." + caller + " requires a valid image format");
    }
    function vetImageType(gl,type,caller,useDefault){
        gl = vetGL(gl,caller);
        if(type !== null && type !== undefined){
            if(typeof type === "string"){
                if(GL.imageTypes.indexOf(type) > -1){
                    return gl[type];
                }
                if(GLVersion >= 2){
                    if(GL2.imageTypes.indexOf(type) > -1){
                        return gl[type];
                    }
                }
            }else{
                if(GL.imageTypes.find(name => gl[name] === type) !== undefined){
                    return type;
                }
                if(GLVersion >= 2){
                    if(GL2.imageTypes.find(name => gl[name] === type) !== undefined){
                        return type;
                    }
                }
            }
        }
        if(useDefault === true){
            if(API.debug){
                console.warn("webGLHelper." + caller + " unknown image type. Default UNSIGNED_BYTE used.");
            }
            return gl.UNSIGNED_BYTE;
        }
        throw new ReferenceError("webGLHelper." + caller + " requires a valid image type");
    }
        
        

    

    


    var currentLinkerWorkingOn;
    var glWarnings = [];
    var glErrors = [];
    var id = 0;
    var programSource = {};
    var library = {};
    function getSourceDirectives(source,name){
        var items = {
            source : null,
            list : [],
        };
        items.source = source.replace(new RegExp("#" + name+".+;","g"), str => {
            var line = str.split(";");
            var directive = line.shift();
            var data = directive.replace(/  /g," ").split(" ");
            var com = data.shift();
            if(com === "#" + name){
                items.list.push(data.join(" "));
                return line.join(";");
            }
            return str;
        });
        return items;
    }
    function includeLibrary(script,type){
        script = script.replace(new RegExp("#include.+;","g"), str => {
            
            var lib = str.replace(/  /g," ").split(" ")[1].split(";")[0];
            if(library[lib] === undefined){
                throw new SyntaxError("CreateProgram could not find the include library '"+lib+"'");
            }

            if(type === "vertex"){
                if(library[lib].vertexSource !== undefined){
                    return library[lib].vertexSource;
                }
                if(library[lib].source !== undefined){
                    return library[lib].source;
                }
            }
            if(type === "fragment"){
                if(library[lib].fragSource !== undefined){
                    return library[lib].fragSource;
                }
                if(library[lib].source !== undefined){
                    return library[lib].source;
                }
            }
            return "";
        });

        return script;
        
    }
    function setConstants(script,consts = []){
        var foundC = [];
        script = script.replace(new RegExp("#%.+;","g"), str => {
            var con = str.substr(2,str.length-3).replace(/ /g,"").split("=");
            foundC.push({name : con[0], value : con[1]});

            return "";
        });
        foundC.forEach(fc => {
            consts.forEach(c => {
                if(fc.name === c.name){
                    fc.value = c.value;
                }
            });
        });
        consts.forEach(c => {
            script = script.replace(new RegExp("<%"+c.name+">","g"),c.value);

        });
        foundC.forEach(c => {
            script = script.replace(new RegExp("<%"+c.name+">","g"),c.value);

        });
        return script;
            
            
        
        
    }
    function getVariables(script,variables){    // get # delimited variables from shader source
        var name = null;
        var items = [];
        VAR_TYPES.forEach(f => {
            //if(variables.items === undefined){  variables.items = []; }
            script = script.replace(new RegExp("#" + f+".+;","g"), str => {
                var data = str.replace(/  /g," ").split(" ");
                if(data[0] === "#name"){
                    name = data[1].replace(";","").trim();
                    if(isKeyWord(name)){
                        throw new SyntaxError(currentLinkerWorkingOn+" : Protected keyword. '"+name+"' is a keyword and can not be used to name a shader.");
                    }
                    return "";
                }else if(data[0] === "#shadow"){
                    name = data[3].replace(/\[[0-9]+?\]|;/g,"");
                    var shadow = null;
                    var arrayItemCount = 1;
                    var size = 1;
                    var type = null;
                    var func = "uniform"
                    if(data[3].indexOf("[") > -1){
                        arrayItemCount = Number(data[3].split("[")[1].split("[")[0].trim());
                        if(isNaN(arrayItemCount)){
                            throw new SyntaxError(currentLinkerWorkingOn+" : Shadow variable'"+name+"' Array length is not a number");
                        }
                    }
                    if(data[2].indexOf("vec") > -1){
                        size = Number(data[2].substr(3));
                        if(isNaN(arrayItemCount)){
                            throw new SyntaxError(currentLinkerWorkingOn+" : Shadow variable'"+name+"' vec size  is not a number");
                        }
                        type = "float";
                    }
                    if(data[2].indexOf("ivec") > -1){
                        size = Number(data[2].substr(4));
                        if(isNaN(arrayItemCount)){
                            throw new SyntaxError(currentLinkerWorkingOn+" : Shadow variable'"+name+"' ivec size  is not a number");
                        }
                        type = "int";
                    }                    
                    if(data[2] === "float"){
                        type = "float";
                    }                    
                    if(data[2] === "int"){
                        type = "int";
                    }
                    
                    if(type === null){
                        throw new SyntaxError(currentLinkerWorkingOn+" : Shader directive #shadow '"+name+"' unknown type '"+data[2]+"'");                        
                    }
                    if(type === "float"){
                         shadow = new Float32Array(size * arrayItemCount);
                         func += size + "fv" 
                    }                   
                    if(type === "int"){
                         shadow = new Int32Array(size * arrayItemCount);
                         func += size + "iv" 
                    }                   
                    
                    if(shadow === null){
                        throw new SyntaxError(currentLinkerWorkingOn+" : Shader directive #shadow '"+name+"' type '"+ data[2]+"' not supported");
                    }
                    var funcStr = `
                        return function(gl){
                            gl.${func}(this.location,this.shadow);
                        }
                    `;

                    items.push({use : data[1] ,shadow : shadow,func : funcStr, type : data[2] , name : name});
                    return str.substr(7);  // remove shadow token
                }
                items.push({use : f , type : data[1] , name : data[2].replace(/\[[0-9]+?\]|;/g,"")});
                return str.substr(1);
            })
        })
        if(name === null && items.length > 0){
            throw new SyntaxError(currentLinkerWorkingOn+" : Found "+items.length+" variables in unnamed shader. missing (#name shaderName) directive ")
        }
        if(variables.linkNames === undefined){
            variables.linkNames = [];
        }
        variables.linkNames.push(name);
        if(variables.names === undefined){
            variables.names = [];
        }
        variables.names.push(name);
        if(variables[name] === undefined){
            variables[name] = [];
        }
        items.forEach(i => variables[name].push(i));
        return  script;
    }
    function getLocations(gl,shaders,vars = {}){    // get location IDs for shader variables
        while(shaders.variables.linkNames.length > 0){
            var name = shaders.variables.linkNames.shift();
            shaders.variables[name].forEach(v => { 
                if(v.shadow !== undefined){
                    var location = gl[VAR_LOCATE_FUNC[v.use]](shaders.program, v.name); 
                    v.func = v.func.replace("#location#",location);
                    vars[v.name] = {};
                    vars[v.name].set = (new Function("owner",v.func))(vars);
                    vars[v.name].shadow = v.shadow;
                    vars[v.name].location = location;
                    
                }else{
                    vars[v.name] = gl[VAR_LOCATE_FUNC[v.use]](shaders.program, v.name); 
                }
            });
        }
        return vars;
    }
    function report(gl,item,type,name,source){
        var str = type === "shader" ? gl.getShaderInfoLog(item):gl.getProgramInfoLog(item);;
        var error = false;
        str = str.split("\n")
        str.forEach(l => {
            if(l.substr(0,5) === "ERROR"){
                glErrors.push({message : l,type : type,name : name});
                var line;
                if(source !== undefined){
                    var lines = source.split("\n");
                    line = Number(l.replace(/  /g," ").split(" ")[1].split(":")[1]);
                    line = "Line "+line+" >> " + lines[line-1];
                }
                if(typeof log === "function"){
                    log(l.replace("ERROR:","Error in: " + name + " "));
                    if(line){
                        log(line);
                    }
                }else{
                    console.error(l.replace("ERROR:","Error in: " + name + " "));
                    if(line){
                        console.log(line);
                    }
                }
                error = true;
            }
            if(l.substr(0,7) === "WARNING"){
                glWarnings.push({message : l,type : type,name : name});
            }
        });
        return error;
    }
     
     var API = {
        debug : true,
        createTexture : function (gl,image,options){
            var texture,format,iType;
            gl = vetGL(gl,"createTexture");
            gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
            
            if(options === undefined){
                qS.clampX(gl);
                qS.clampY(gl);
                qS.minLinear(gl);
                qS.magLinear(gl);
            }else{
                options.sampler.split(",").forEach(name=>qS[name](gl));
                format = options.format;
                iType = options.type;
            }            
            format = vetImageFormat(gl,format,"createTexture",true);
            iType = vetImageType(gl,iType,"createTexture",true);

            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, iType, image);
            return texture;
        },
        createImageFromData : function(gl,width,data,options){
            var iType;
            gl = vetGL(gl,"createImageFromData");
            var pixelWidth = 4;
            var format = vetImageFormat(gl,options.format,"createImageFromData",true);
            switch(format){
                case gl.RGBA:
                    pixelWidth = 4;
                    break;
                case gl.LUMINANCE:
                    pixelWidth = 1;
                    break;
                case gl.RGB:
                    pixelWidth = 3;
                    break;
            }
            if((data.length % (pixelWidth * width)) !== 0){
                throw TypeError("Create image from data. Image width does not match pixel count.");
            }
            var height = data.length / (pixelWidth * width);
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if(options === undefined){
                qS.clampX(gl);
                qS.clampY(gl);
                qS.minNear(gl);
                qS.magNear(gl);
            }else{
                iType = options.type;
                options.sampler.split(",").forEach(name=>qS[name](gl));
            }
            iType = vetImageType(gl,iType,"createImageFromData",true);

            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, iType, data);
            return texture;
        },
        createEmptyTexture : function(gl,width,height,options){
            var texture,format,iType;
            gl = vetGL(gl,"createEmptyTexture");
            
            gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
            if(options === undefined){
                qS.repeatX(gl);
                qS.repeatY(gl);
                qS.minLinear(gl);
                qS.magLinear(gl);
            }else{
                options.sampler.split(",").forEach(name=>qS[name](gl));
                format = options.format;
                iType = options.type;
            }            
            format = vetImageFormat(gl,format,"createEmptyTexture",true);
            iType = vetImageType(gl,iType,"createEmptyTexture",true);
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, iType, null);
            return texture;
        },
        createFrameBuffer : function(gl,width,height){
            var frameBuffer;
            gl = vetGL(gl,"createFrameBuffer");
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer = gl.createFramebuffer());
            frameBuffer.width = Math.floor(width);
            frameBuffer.height = Math.floor(height);   
            return frameBuffer;
        },
        setTextureData : function(gl,texture,image,format,type){
            gl = vetGL(gl,"setTextureData");
            if(texture === undefined || texture === null){
                throw new ReferanceError("setTextureData requires a valid webGL texture.");
            }
            if(image === undefined || image === null){
                throw new ReferanceError("setTextureData requires a valid image or data source.");
            }
            format = vetImageFormat(gl,format,"createEmptyTexture",true);
            type = vetImageType(gl,type,"createEmptyTexture",true);
            
            gl.bindTexture(gl.TEXTURE_2D, texture);            
            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, image);   
            return texture;
        },
        updateTexture : function(gl,spriteTile){  /* old and depreciated soon */
            gl = vetGL(gl,"updateTexture");
            var format = spriteTile.options.format            
            var type = spriteTile.options.type            
            format = vetImageFormat(gl,format,"updateTexture",true);
            type = vetImageType(gl,type,"updateTexture",true);
            gl.bindTexture(gl.TEXTURE_2D, spriteTile.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, format, spriteTile.width,spriteTile.height,0,format, type, spriteTile.map);            
            
        },
        createCompositeFilters : function(gl){
            gl = vetGL(gl,"createCompositeFilters");
            gl.composite = {};
            gl.composite.over = function(){
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            };
            gl.composite.dark = function(){
                gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
            };
            gl.composite.light = function(){
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            };
            gl.enable(gl.BLEND);
        },
        defaultBindings : function(gl){ 
            gl = vetGL(gl,"defaultBindings");
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);                
        },        
        createQuad : function (size = 1,offset = 0,right,bottom){
            var top,left,right,bottom;
            if(right !== undefined){
                left = size;
                top = offset;
            }else{
                top = -size * offset;
                left = -size * offset;
                right = size - size * offset;
                bottom = size - size * offset;
            }
            return new Float32Array([left,top,right,top,left,bottom,right,top,right,bottom,left,bottom]);
        },
        createBatchSpriteIndexingVerts : function(quadCount){ // array of verts for batched sprites
            var arr = new Float32Array(quadCount * 6 * 2);
            for(var i = 0; i < quadCount; i++){
                var k = 0;
                var j = 0;
                arr[i * 6 * 2 + k++] = i ;
                arr[i * 6 * 2 + k++] = 0;
                arr[i * 6 * 2 + k++] = i ;
                arr[i * 6 * 2 + k++] = 1;
                arr[i * 6 * 2 + k++] = i ;
                arr[i * 6 * 2 + k++] = 2;
                arr[i * 6 * 2 + k++] = i ;
                arr[i * 6 * 2 + k++] = 2;
                arr[i * 6 * 2 + k++] = i ;
                arr[i * 6 * 2 + k++] = 3;
                arr[i * 6 * 2 + k++] = i ;
                arr[i * 6 * 2 + k++] = 0;
            }
            return arr;
        },
        createQuickSpriteArray : function(quadCount){ // array of verts for batched sprites
            return API.createBatchSpriteIndexingVerts(quadCount);
        },
        addVertexBuffer : function (gl,name, size, data){
            gl = vetGL(gl,"addVertexBuffer");         
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            if(data !== undefined){
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            }
            gl.enableVertexAttribArray(name);
            gl.vertexAttribPointer(name, size, gl.FLOAT, false, 0, 0);
        },
        setBuffer : function (gl, buffer,name, data){
            gl = vetGL(gl,"setBuffer");               
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(name);
            gl.vertexAttribPointer(name, size, gl.FLOAT, false, 0, 0);
        },
        createBuffer : function (gl, data,name){
            gl = vetGL(gl,"createBuffer");                
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            return buffer;
        },
        addShader : function(shaderName,source){
            var types = getSourceDirectives(source,"type");
            source = types.source;
            if(types.list.length === 0){
                throw new SyntaxError("   '"+shaderName+"' Shader source code missing #type directive.");
            }
            var type = types.list.pop();
            var ind;
            while((ind = SHADER_TYPE_NAMES.indexOf(type)) === -1 && types.list.length > 0){
                type = types.list.pop();
            }
            if(ind === -1){
                throw new RangeError(" '"+shaderName+"' Shader source code missing correct #type directive. Must be `vertex` or `fragment`");
            }
            if(programSource[shaderName] === undefined){
                programSource[shaderName] = {};
            }
            programSource[shaderName][type] = {
                source : source,
                type : type.toUpperCase() + "_SHADER",
            }
            return programSource;
        },
        addUtillity : function(shaderName,functions){
            if(programSource[shaderName] === undefined){
                programSource[shaderName] = {};
                
            }
            if(programSource[shaderName].utilities === undefined){
                programSource[shaderName].utilNames = [];
                programSource[shaderName].utilities = {};
                
            }
            functions.forEach(f => {
                if(programSource[shaderName].utilNames.indexOf(f.name) === -1){
                    programSource[shaderName].utilNames.push(f.name);
                }
                programSource[shaderName].utilities[f.name] = f.func;
                
                
            })
            return programSource;
        },        
        addLib : function(libName,source){
            if(library[libName] === undefined){
                library[libName] = {};                
            }else{
                if(API.debug){
                    console.warn("webGLHelper is replacing an existing library '"+libName+"' with a new one.");
                }
            }
            var vsource = source.split("#Vertex")[1].split("#Fragment")[0];
            var fsource = source.split("#Fragment")[1];
            if(vsource !== undefined){
                library[libName].vertexSource = vsource;
            }
            if(fsource !== undefined){
                library[libName].fragSource = fsource;
            }
            if(fsource === undefined && vsource === undefined){
                library[libName].source = source;
            }
            return library;
        },        
        doesProgramSourceExist  : function(name){
            if( programSource[name] !== undefined){
                return true;
            }
            return false;
        },
        setShaderOption : function(shaderName,options){
            var ps;
            if((ps = programSource[shaderName]) === undefined){
                ps = programSource[shaderName] = {};
            }
            if(ps.options === undefined){
                ps.options = {};
            }            
            for(var i in options){
                ps.options[i] = options[i];
            }
        },
        createProgram : function (gl, pname, consts) {// creates vertex and fragment shaders
            gl = vetGL(gl,"createProgram");            
            var shaders = [];
            var variables = {};
            var s = programSource[pname];
            if(s === undefined){
                throw new RangeError("  Can not create program. No program named '"+pname+"' found.");
            }
            SHADER_TYPE_NAMES.forEach(n=>{
                var script = s[n];
                if (script !== undefined) {
                    currentLinkerWorkingOn = script;
                    var shader = gl.createShader(gl[script.type]);
                    var source = includeLibrary(script.source,n);  // link in libs
                    source = setConstants(source, consts);   // set constants
                    source = getVariables(source, variables);  // get variables
                    if(s.options !== undefined && s.options.showPreCompile){
                        console.log("Showing pre compiled "+n+" source for "+pname);
                        console.log(source);
                    }
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if(report(gl,shader,"shader", n, source)){throw new ReferenceError("WEBGL Shader error : Program : '"+pname+"' shader : " + n); }
                    shaders.push(shader);
                }
            });
            var program = gl.createProgram();
            shaders.forEach((shader) => {  gl.attachShader(program, shader); });
            gl.linkProgram(program);
            var name = variables.names[0];
            var vars = getLocations(gl,{ program : program,variables : variables});
            if(report(gl,program,"program",pname)){throw new ReferenceError("WEBGL Program error : " + pname);}
            vars.program = program;
            vars.name = name;
            vars.id = id ++;
            if(s.utilNames !== undefined){
                s.utilNames.forEach(f=>{
                    vars[f] = s.utilities[f];
                });
            }
            return vars;
        },
    };
    return API;
})();

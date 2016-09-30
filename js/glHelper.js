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
    const VAR_TYPES = ["attribute","uniform","name"];
    const VAR_KEYWORDS = ["names","linkNames","program","id","name","prep"]; // list of keywords
    const VAR_LOCATE_FUNC = {attribute : "getAttribLocation", uniform : "getUniformLocation"};
    const SHADER_TYPE_NAMES = ["vertex","fragment"];
    var currentLinkerWorkingOn;
    function isKeyWord(word){ return VAR_KEYWORDS.indexOf(word) > -1;}
    var glWarnings = [];
    var glErrors = [];
    var id = 0;
    var programSource = {};
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
            script = script.replace("<%"+c.name+">",c.value);

        });
        foundC.forEach(c => {
            script = script.replace("<%"+c.name+">",c.value);

        });
        return script;
            
            
        
        
    }
    // get # delimited variables from shader source
    function getVariables(script,variables){
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
    // get location IDs for shader variables
    var getLocations = function(gl,shaders,vars = {}){
        while(shaders.variables.linkNames.length > 0){
            var name = shaders.variables.linkNames.shift();
            shaders.variables[name].forEach(v => { vars[v.name] = gl[VAR_LOCATE_FUNC[v.use]](shaders.program, v.name); });
        }
        return vars;
    }
    var report = function(gl,item,type,name,source){
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
     function vetGL(gl,functionName){
         if(gl === undefined){
             if(canvasMouse === undefined || canvasMouse.webGL === undefined || canvasMouse.webGL.gl === undefined){
                 throw new ReferenceError("webGLHelper." + functionName + " requires a valid gl context");
             }
             return canvasMouse.webGL.gl;
         }
         return gl;
     }
     var API = {
        createTexture : function (gl,image){
            var texture;
            gl = vetGL(gl,"createTexture");
            gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            return texture;
        },
        createImageFromData : function(gl,width,format,data){
            gl = vetGL(gl,"createImageFromData");
            var pixelWidth = 4;
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
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, data);
            return texture;
        },
        createEmptyTexture : function(gl,width,height){
            var texture;
            gl = vetGL(gl,"createEmptyTexture");
            
            gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
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
        updateTexture : function(gl,spriteTile){
            gl = vetGL(gl,"updateTexture");
            gl.bindTexture(gl.TEXTURE_2D, spriteTile.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, spriteTile.format, spriteTile.width,spriteTile.height,0,spriteTile.format, gl.UNSIGNED_BYTE, spriteTile.map);            
            
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
        addShader : function(programName,source){
            var types = getSourceDirectives(source,"type");
            source = types.source;
            if(types.list.length === 0){
                throw new SyntaxError("   '"+programName+"' Shader source code missing #type directive.");
            }
            var type = types.list.pop();
            var ind;
            while((ind = SHADER_TYPE_NAMES.indexOf(type)) === -1 && types.list.length > 0){
                type = types.list.pop();
            }
            if(ind === -1){
                throw new RangeError(" '"+programName+"' Shader source code missing correct #type directive. Must be `vertex` or `fragment`");
            }
            if(programSource[programName] === undefined){
                programSource[programName] = {};
            }
            programSource[programName][type] = {
                source : source,
                type : type.toUpperCase() + "_SHADER",
            }
            return programSource;
        },
        addUtillity : function(programName,functions){
            if(programSource[programName] === undefined){
                programSource[programName] = {};
                
            }
            if(programSource[programName].utilities === undefined){
                programSource[programName].utilNames = [];
                programSource[programName].utilities = {};
                
            }
            functions.forEach(f => {
                if(programSource[programName].utilNames.indexOf(f.name) === -1){
                    programSource[programName].utilNames.push(f.name);
                }
                programSource[programName].utilities[f.name] = f.func;
                
                
            })
            return programSource;
        },        
        doesProgramSourceExist  : function(name){
            if( programSource[name] !== undefined){
                return true;
            }
            return false;
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
                    var source = setConstants(script.source,consts);
                    source = getVariables(source,variables);
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

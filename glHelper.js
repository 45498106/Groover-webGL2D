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
    var report = function(gl,item,type,name){
        var str = type === "shader" ? gl.getShaderInfoLog(item):gl.getProgramInfoLog(item);;
        var error = false;
        str = str.split("\n")
        str.forEach(l => {
            if(l.substr(0,5) === "ERROR"){
                glErrors.push({message : l,type : type,name : name});
                if(typeof log === "function"){
                    log(l.replace("ERROR:","Error in: " + name + " "))
                }else{
                    console.log(l.replace("ERROR:","Error in: " + name + " "));
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
        createTexture : function (gl,image){
            var texture;
            gl.bindTexture(gl.TEXTURE_2D, texture = gl.createTexture());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            return texture;
        },
        createImageFromData : function(gl,width,format,data){
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
        createCompositeFilters : function(gl){
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
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            if(data !== undefined){
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            }
            gl.enableVertexAttribArray(name);
            gl.vertexAttribPointer(name, size, gl.FLOAT, false, 0, 0);
        },
        setBuffer : function (gl, buffer,name, data){
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(name);
            gl.vertexAttribPointer(name, size, gl.FLOAT, false, 0, 0);
        },
        createBuffer : function (gl, data,name){
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
        createProgram : function (gl, pname) {// creates vertex and fragment shaders
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
                    var source = getVariables(script.source,variables);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    if(report(gl,shader,"shader",n)){throw new ReferenceError("WEBGL Shader error : Program : '"+pname+"' shader : " + n); }
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
            return vars;
        },
    };
    return API;
})();

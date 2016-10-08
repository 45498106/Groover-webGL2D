/*==================================================================================================
 Non standard shaders.
 Use glHelper.js interface webGLHelper to compile the shaders by name
 shader = webGLHelper.createProgram(gl,name); // gl is webGL/2 context returns a shader container.
          Errors and warning will throw or report to the console with line and error
          There are a host of syntax errors possible. These errors are development only and should 
          not be thrown in tested production
 shader.program is the program for gl.useProgram
 shader.name is the name of the shader (see #name directive)
 shader.id is a ID unquie to this instance of webGLHelper
 Shader will also have other properties as defined in the shader code.
 
 You add shaders to webGLHelper interface with webGLHekper.addShader(name,stringSource). When adding 
 nothing is done to the code. It is just as a store. The source string can come from anywhere
 
 The additional webGLHelper.addUtillity(name,arrayOfFunctions) adds javascript functions to the 
 named shader. The array contains utility objects with the following structure
    name : the name as a string of the utility function. This is added to the shader container.
    func : The javascript function that is assigned to shader name.
 
 When the shader is compiled all the utility functions are  added and bound to the shader container.
 They can be called shader.nameUtility();
 
 
 Constants
 
 The function webGLHelper.createProgram(gl,name,consts) has the optional argument consts which is an
 array of constants to add to the shader. consts contains objects with name value pairs and is a 
 simple substitution of the consts custom directives.
 For example
 
     Shader code
     
         const float HI_VAL = <%HI_VAL>;  // shader code
     
     The value of the const HI_VAL can be set with
     
         webGLHelper.createProgram(gl,"myShader",[{name:"HI_VAL",value:0.01}); 
     
     Which will modify all occurrences of <%HI_VAL> with 0.01 resulting in
     
         const float HI_VAL = 0.01;  // shader code
         
 Constants can be used anywhere and are added before directive compile and shader compile. 
 
 Example
 
      Shader source
      
      gl_FragColor = texture2D(texture,tex) <%Colour>;
      
      Javascript
      
      consts = [];
      consts[0] = {
          name : "Colour",
          value : "* vec4(255.0,0.0,0.0,1)",
      }
 
      Shader becomes
      gl_FragColor = texture2D(texture,tex) * vec4(255.0,0.0,0.0,1);
 
 Constants can also be defined in the shader with the #% directive. This provides a default value
 for the constant if not supplied with createProgram.
 
 Example
     #%Colour = * vec4(0.0,0.0,0.0,1);  // the default for <%Colour>
 Will set <%Colour> 
      gl_FragColor = texture2D(texture,tex) *vec4(255.0,0.0,0.0,1);
      
      Note that spaces are removed from #% constants
 


 Custom Directives.
 
      Custom directives are defined with a perfixed # character followed by the directive name. The
      compiled and linked shader will have all these directives removed.
      
 List of directives
 #type defines the shader type fragment or vertex
 #name defines the name of the program the shader is associated with. (use to reference shader)
 #include adds code to the shader from a named source.
       #include shaderSetup; // add the shader source code found in shaderSetup
 #uniform and #attribute automaticly add the variable location to the shader as the name given in  
       in the shader source code.
       For example 
          #uniform vec2 mouse;  // shader source code
       The location is then found and added as shader.mouse. You can then set the value with       
           gl.uniform2fv(shader.mouse,data);  // javascript
       These are generally used to define standard shared variables across common shader functions.
       For unique to shader uniforms use #shadow directive
 #shadow followed by "uniform" adds a named shadow (copy) object for easy access to variable. 
       For example 
           #shadow uniform vec3 mydata;
       Creates a named object shader.myData which has the following properties 
           shader.myData.shadow An typed array to hold the data 
           shader.myData.location The location interface
           shader.myData.set(gl) A helper function bound to shader.myData that will set the uniform
                data to the shadow values stored in the type array shader.
                
       Example usage
           #shadow uniform vec2 mouse;  // in the shader
       is compiled to 
           uniform vec2 mouse;  // in the shader
       The shader object returned by webGLHelper.createProgram(gl,name) will have the property mouse
           var shader = webGLHelper.createProgram(gl,name);  // create shader
           gl.useProgram(shader.program);                    // bind shader
           shader.mouse.shadow[0] = mouseX;                  // set shadow values
           shader.mouse.shadow[1] = mouseY;
           shader.mouse.set(gl);                             // set the shader uniform to the shadow
           
==================================================================================================*/




// curly braces are just from my folding system
{webGLHelper.addShader("backgroundImage",`
            #type vertex;    
            #name backgroundImage;
            #include simplePosTexture;
            #include screenScale;
            void main() {
                gl_Position = position * vec4(scale.x,-(screen.y / screen.x) * scale.y,1.0,1.0);
                tex = texCoords;
            }`);}
{webGLHelper.addShader("backgroundImage",`
            #type fragment;      
            #name backgroundImage;
            precision mediump float;
            #include screenScale;
            #include textures1;            
            void main() {
                gl_FragColor = texture2D(<%t1>,tex);
            }`);
}
{webGLHelper.addShader("bgThreshold",`
            #type vertex;    
            #name bgThreshold;
            #include simplePosTexture;
            #include screenScale;
            void main() {
                gl_Position = <%pos> * vec4(scale.x,-(screen.y / screen.x) * scale.y,1.0,1.0);
                tex = <%coords>;
            }`);}
{webGLHelper.addShader("bgThreshold",`
            #type fragment;      
            #name bgThreshold;
            precision mediump float;
            #include screenScale;
            #include textures1;            

            #%level = 0.9; // defined constant
            
            void main() {
                vec4 v = texture2D(<%t1>,tex);
                v.x = v.x < <%level> ? (v.x < <%level>/2.0 ? (v.x < <%level>/3.0 ? 0.0: 0.33): 0.66) : 1.0;
                v.y = v.y < <%level> ? (v.y < <%level>/2.0 ? (v.y < <%level>/3.0 ? 0.0: 0.33): 0.66) : 1.0;
                v.z = v.z < <%level> ? (v.z < <%level>/2.0 ? (v.z < <%level>/3.0 ? 0.0: 0.33): 0.66) : 1.0;
                gl_FragColor = v;
            }`);
}
//webGLHelper.setShaderOption("bgThreshold",{showPreCompile:true});
//webGLHelper.setShaderOption("backgroundImage",{showPreCompile:true});

{webGLHelper.addShader("fillScreen",`
            #type vertex;    
            #name fillScreen;
            #attribute vec4 position;
            #attribute vec2 texCoord;  
            varying vec2 u_texCoord;  
            void main() {
                gl_Position = position;
                u_texCoord = texCoord;
            }`);}
{webGLHelper.addShader("fillScreen",`
            #type fragment;      
            #name fillScreen;
            precision mediump float;
            #uniform sampler2D u_image;
            #uniform vec2 scale;
            #uniform vec2 origin; 
            #uniform vec2 screen; //screen resolution
            float sizeX = 1.0 * scale.x;// / screen.x;
            float sizeY = 1.5 * scale.y;// / screen.y;
            float lineW = (1.0 - 0.010*sqrt(scale.x));// * sizeX; 
            varying vec2 u_texCoord;  
            void main() {
                float a = 0.0;
                float py = u_texCoord.y * sizeY - origin.y;     
                float px = u_texCoord.x * sizeX + origin.x;
                float every2 = step(1.0, mod(py, 2.0)) ;    
                if(every2 > 0.5){
                    float pxa = px - every2 * step(2.0,mod(py, 4.0)) * 0.5;
                    float diag1 = mod(pxa + 0.5 + py / 2.0, 1.0);
                    float diag2 = mod(pxa + 0.5 - py / 2.0, 1.0);
                    a = (step(lineW, diag2) + step(lineW, diag1)) * every2;
                }else{
                    float every3= step(3.0, mod(py + 1.0, 4.0)) ;                
                    float pxa = px - every2 * step(2.0,mod(py, 4.0)) * 0.5;
                    a = step(lineW,mod(pxa, 1.0)) * (1.0 - every3)*(1.0 - every2);
                    a += step(lineW,mod(px + every2 * 0.5 + 0.5, 1.0)) * every3;
                }
                a = clamp(a,0.5,1.0);
                gl_FragColor = vec4(0,0,0,a);
            }`);}
{webGLHelper.addUtillity("grid",
    [{
        name : "setCheckerColor",
        func : function(id,rgb){
            id %= 2;
            if(!Array.isArray(rgb)){
                throw new RangeError("setCheckerColor requires an array [r,g,b].");
            }
            this.prep(rgb,id * 3);
        },
    },{
        name : "setCheckerAlpha",
        func : function(id,alpha){
            if(id === null){
                this.prep([alpha,alpha],9);
                
            }else{
                id %= 2;
                this.prep([alpha],9+id);
            }
        },
    },{
        name : "setLineColor",
        func : function(rgb){
            if(!Array.isArray(rgb)){
                throw new RangeError("setLineColor requires an array [r,g,b].");
            }
            this.prep(rgb,6);
        },
    },{
        name : "setLineWidth",
        func : function(width){
            if(isNaN(width) || width <= 0){
                return;
            }            
            this.prep([width],13);
        },
    },{
        name : "setSteps",
        func : function(step){
            if(isNaN(step) || step < 2 || step > 16){
                return;
            }
            this.prep({steps : Math.floor(step)});
            
        }
    }
    
    ]
)}           
{webGLHelper.addShader("grid",`
            #type vertex;      
            #name grid;
            #include simplePosTexture;
            #include origin_scaleScreen;
            void main() {
                gl_Position = <%pos>;
                <%tex> = vec2(1.0,-1.0) * <%coords> + <%origin>;
            }
        `);}
{webGLHelper.addShader("grid",`
            #type fragment;      
            #name grid;
            precision mediump float;            
            #include origin_scaleScreen;

            // input colours checker1,checker2,gridcolour,extra (checkerAlpha1,checkerAlpha2,lineAlpha)
            #uniform vec3 colours[5];
            #uniform vec4 desc; // grid size, alpha fades,
            const vec2 one = vec2(1.0,1.0);
            void main(){
                vec4 checkerColour1 = vec4(colours[0],colours[3].x);
                vec4 checkerColour = vec4(colours[1],colours[3].y);
                vec4 gridColour = vec4(colours[2],colours[3].z);
                vec4 rCol;                
                float a,aa;
                vec2 lineWidth = <%screen> * colours[4].y;
                vec2 m = <%screen> * desc.x;
                vec2 m1  = m * desc.w ;
                vec2 m2  = m1 * desc.w ;       
                vec2 gl1;  // grid lines 0-2;   
                a = desc.y;   
                // find horizontal and vertical grid lines. 
                if(colours[3].z <= 1.0){ // only 2 levels of lines
                    gl1 = (one - step(lineWidth, mod(<%tex>, m1))) * a;
                    a = 1.0-a;
                    gl1 += (one - step(lineWidth, mod(<%tex>, m2))) * a;
                }else{                
                    aa = 0.5 * desc.z;
                    gl1 = (one - step(lineWidth, mod(<%tex>, m)));
                    gl1 *=  a * aa;
                    gl1 += (one - step(lineWidth, mod(<%tex>, m1))) * (aa + (1.0 - aa) * a);
                    a = 1.0 - a;
                    gl1 += (one - step(lineWidth, mod(<%tex>, m2))) * a;
                }
                // get grid pattern
                vec2 aa1 = step(m / 2.0 , mod(<%tex>, m));
                vec2 aa2 = step(m1 / 2.0, mod(<%tex>, m1));
                vec2 aa3 = step(m2 / 2.0, mod(<%tex>, m2));
                // mix grid pattern
                rCol = mix(
                        checkerColour, 
                        checkerColour1,
                        abs(aa2.x - aa2.y) + mix(abs(aa1.x - aa1.y), abs(aa3.x - aa3.y), a)
                );
                // mix  in grid lines
                gl_FragColor = mix(rCol, gridColour, max(gl1.x, gl1.y));
            }
        `);}
{webGLHelper.addShader("sprite",`
            #type vertex;      
            #name sprite;
            #attribute vec4 position;
            #attribute vec2 texcoord;
            // pos, scale, textPos, textScale,rotation,screenAspect,alpha,scale,center,tile
            #uniform vec2 desc[8];   
            varying vec2 v_texcoord;
            varying float alpha;
            const vec2 proj = vec2(-0.5, 0.5);
            void main() {
               vec2 pos = (position.xy +  desc[6]) * desc[1] * 2.0 * desc[5].y;
               mat4 tMat = mat4(1);
               vec2 rot = vec2(cos(desc[4].x),sin(desc[4].x));
               tMat[0][0] = rot.x;
               tMat[1][0] = rot.y;
               tMat[0][1] = -rot.y * desc[4].y;
               tMat[1][1] = rot.x * desc[4].y;
               gl_Position  = (tMat * vec4(pos, position.zw)) + vec4((desc[0] + proj) * 2.0, 0, 0);
               v_texcoord = texcoord * desc[3] + desc[2];
               alpha = desc[5].x;
            }`);}
{webGLHelper.addShader("sprite",`
            #type fragment;      
            #name sprite;            
            precision mediump float;
            varying vec2 v_texcoord;
            varying float alpha;
            uniform sampler2D texture;
            void main() {
               if(alpha >= 1.){
                    gl_FragColor = texture2D(texture, v_texcoord);
               }else{
                    gl_FragColor = texture2D(texture, v_texcoord) * vec4(1.0 , 1.0 , 1.0 , alpha);
               }
            }`);}
{webGLHelper.addShader("tiles",`
            #type vertex;      
            #name tiles;
            #attribute vec4 position;
            #attribute vec2 texcoord;
            // pos, scale, textPos (also tile count), textScale,rotation,screenAspect,alpha,scale,center,tile
            #uniform vec2 desc[8];   
            varying vec2 tex;
            varying float alpha;
            const vec2 proj = vec2(-0.5, 0.5);
            void main() {
               vec2 pos = (position.xy +  desc[6]) * desc[1]* 2.0 * desc[5].y;
               mat4 tMat = mat4(1);
               vec2 rot = vec2(cos(desc[4].x),sin(desc[4].x));
               tMat[0][0] = rot.x;
               tMat[1][0] = rot.y;
               tMat[0][1] = -rot.y * desc[4].y;
               tMat[1][1] = rot.x * desc[4].y;
               gl_Position  = (tMat * vec4(pos, position.zw) * vec4(desc[2],1,1) ) + vec4((desc[0] + proj) * 2.0, 0, 0);
               tex = texcoord ;
               alpha = desc[5].x;
            }`);}
{webGLHelper.addShader("tiles",`
            #type fragment;      
            #name tiles;
            precision mediump float;
            varying vec2 tex;
            varying float alpha;
            #uniform vec2 tile[3];
            const vec2 mir = vec2(1.0,1.0);
            uniform sampler2D texture0;
            void main() {
               vec2 mirror = step(mir,mod(tex *  tile[2],tile[2]));
               vec2 tiles = abs(mirror- mod(tex *  tile[2],1.0)) * tile[1] + tile[0];
               if(alpha >= 1.){
                    gl_FragColor = texture2D(texture0, tiles);
               }else{
                    gl_FragColor = texture2D(texture0, tiles) * vec4(1.0 , 1.0 , 1.0 , alpha);
               }
            }`);}
{webGLHelper.addShader("lines",`
           #type vertex;      
           #name lines;
            #attribute vec4 position;
            #attribute vec2 texcoord;
            // pos, pos1, ??  , textScale,(??,screenAspect),(alpha,scale),??,tile
            // 0     1      2        3        4.x    4.y         5.x   5.y   6    7
            /*
            #uniform name {
                vec2 lineStart,
                vec2 lineEnd,
                vec2 empty,
                vec2 texScale,
                float empty,
                float screenAspect,
                float alpha,
                float scale,
            } as vec2;*/
            
            #uniform vec2 desc[8];  
            varying float alpha;
            varying vec2 v_texcoord;
            const vec2 proj = vec2(-0.5, 0.5);

            float  aspect = desc[4].y;
            vec2  aspectV =   vec2(1.0,aspect);
            vec2  line  = desc[1] - desc[0]; 
            vec2  lineI = normalize(line / aspectV);
            float  len  = length(line / aspectV) *2.0;
            vec2  lineJ = lineI * desc[3].y * desc[5].y;
            vec2  textX = vec2(len / desc[5].y / desc[3].x / 2.0, 1.0);
            float dep;
            mat4  tMat  = mat4(1);

            void main() {
               dep = position.x * 1.0;
               tMat[0][0] = lineI.x ;
               tMat[0][1] = lineI.y * aspect;
               tMat[1][0] = lineJ.y ;
               tMat[1][1] = -lineJ.x * aspect;
               gl_Position  = (tMat * vec4(position.xy * vec2(len,2.0), position.zw)) +  vec4((desc[0] + proj) * 2.0, dep, dep) ;
               v_texcoord = texcoord * textX  ;
               alpha = desc[5].x;
            }`);}
{webGLHelper.addShader("lines",`
            #type fragment;      
            #name lines;
            precision mediump float;
            varying vec2 v_texcoord;
            varying float alpha;
            #uniform vec2 tile[3];
            const vec2 mir = vec2(1.0,1.0);
            uniform sampler2D texture;
            varying float counter;
            void main() {
               vec2 mirror = step(mir,mod(v_texcoord,tile[2]));
               vec2 tiles = abs(mirror- mod(v_texcoord,1.0)) * tile[1] + tile[0];
               if(alpha >= 1.){
                    gl_FragColor = texture2D(texture, tiles);
               }else{
                    gl_FragColor = texture2D(texture, tiles) * vec4(1.0 , 1.0 , 1.0 , alpha);
               }
            }`);}
{webGLHelper.addShader("batchSprite",`
            #%batchCount = 640;   // pre compile settable constant default
            #%spriteCount = 21;   // pre compile settable constant default
            #type vertex;      
            #name batchSprite;
            #attribute vec4 position;
            #attribute vec2 texcoord;
            // 0 pos, 1 scale, 2 textPos, 3 textScale, 4 (rotation,screenAspect), 5 (alpha,scale), 6 center, 7 tile
            #uniform vec2 desc[8];   
            #uniform float pos[<%batchCount>];  // preCompile default value. Must have a default

            #uniform ivec4 loc[<%spriteCount>]; // preCompile default value. Must have a default
            const vec2 topLeft = vec2(-0.5,-0.5);
            const vec2 topRight = vec2(0.5,-0.5);
            const vec2 bottomRight = vec2(0.5,0.5);
            const vec2 bottomLeft = vec2(-0.5,0.5);
            varying vec2 v_texcoord;
            varying float alpha;
            void main() {
               vec2 vt; 
               int  p = int(floor(position.y)); // vertex position 0 = top left around 1,2, 3= to bottom left
               int ind = int(floor(position.x)) * 5; // sprite screen position index
               int spriteLoc = int(pos[ind + 4]); // sprite sheet position index
               vec2 tex = vec2(float(loc[spriteLoc].x),float(loc[spriteLoc].y));
               if (p == 0) {
                   vt = topLeft;
               } else if ( p == 1) {
                   vt = topRight;
                   tex.x += float(loc[spriteLoc].z);
               } else if ( p == 2) {
                   vt = bottomRight;
                   tex.x += float(loc[spriteLoc].z);
                   tex.y += float(loc[spriteLoc].w);
               } else {
                   vt = bottomLeft;
                   tex.y += float(loc[spriteLoc].w);
               }
               alpha = desc[5].x;
               v_texcoord = tex / desc[7];  // texture scaling             
    
               vec2 posV = vt  * pos[ind + 2] * 2.0 * desc[5].y;      
               vec2 rot = vec2(cos(pos[ind + 3]),sin(pos[ind + 3]));
               vt.x = posV.x * rot.x + posV.y * rot.y  + (pos[ind] - 0.5) * 2.0;
               vt.y = posV.x * (-rot.y * desc[4].y)  + posV.y * rot.x * desc[4].y + (pos[ind + 1] + 0.5) * 2.0;               
               gl_Position  = vec4(vt, position.zw);

               
            }`);}
{webGLHelper.addShader("batchSprite",`
            #type fragment;
            #name batchSprite;
            precision mediump float;
            varying vec2 v_texcoord;
            varying float alpha;
            uniform sampler2D texture;
            void main() {
               if(alpha >= 1.){
                    gl_FragColor = texture2D(texture, v_texcoord);
               }else{
                    gl_FragColor = texture2D(texture, v_texcoord) * vec4(1.0 , 1.0 , 1.0 , alpha);
               }
            }`);}
{webGLHelper.addShader("batchTileSprite",`
            #type vertex;      
            #name batchTileSprite;
            #attribute vec4 position;
            #attribute vec2 texcoord;
            // 0 pos, 1 scale, 2 textPos, 3 textScale, 4 (rotation,screenAspect), 5 (alpha,scale), 6 center, 7 tile
            #uniform vec2 desc[8];   
            #uniform float pos[640];
            #uniform ivec4 loc[21];
            const vec2 topLeft = vec2(0.0,0.0);
            const vec2 topRight = vec2(1.0,0.0);
            const vec2 bottomRight = vec2(1.0,1.0);
            const vec2 bottomLeft = vec2(0.0,1.0);
            vec2 vt;
            varying vec2 v_texcoord;
            varying float alpha;
            const vec2 proj = vec2(-0.5, 0.5);
            vec2 tex;
            void main() {
               mat4  tMat  = mat4(1);
               int  p = int(floor(position.y));
               int ind = int(floor(position.x)) * 5;
               int spriteLoc = int(pos[ind +4]);
               tex = vec2(0,0);
               tex.x = floor(mod(float(spriteLoc),float(loc[0].x))) * float(loc[0].z);
               tex.y = floor(floor(float(spriteLoc)/float(loc[0].x))) * float(loc[0].z);
                if(p == 0){
                    vt = topLeft;
               }else if( p == 1){
                   tex.x += float(loc[0].z);
                   vt = topRight;
               }else if( p == 2){
                   tex.x += float(loc[0].z);
                   tex.y += float(loc[0].z);
                   vt = bottomRight;
               }else{
                   tex.y +=float(loc[0].z);
                   vt = bottomLeft;
               }           
               tex /= desc[7];               
               vec2 posV = (vt +  desc[6]) * pos[ind + 2] * 2.0 * desc[5].y;      
               vec2 rot = vec2(cos(pos[ind + 3]),sin(pos[ind + 3]));
               tMat[0][0] = rot.x;
               tMat[1][0] = rot.y;
               tMat[0][1] = -rot.y * desc[4].y;
               tMat[1][1] = rot.x * desc[4].y;
               gl_Position  = vec4(tMat * vec4(posV, position.zw)  ) + vec4((pos[ind] -0.5)*2.0,(pos[ind+1] + 0.5)* 2.0, 0, 0);
               v_texcoord = tex;
               alpha = desc[5].x;
            }`);}
{webGLHelper.addShader("batchTileSprite",`
            #type fragment;
            #name batchTileSprite;
            precision mediump float;
            varying vec2 v_texcoord;
            varying float alpha;
            uniform sampler2D texture;
            void main() {
               if(alpha >= 1.){
                    gl_FragColor = texture2D(texture, v_texcoord);
               }else{
                    gl_FragColor = texture2D(texture, v_texcoord) * vec4(1.0 , 1.0 , 1.0 , alpha);
               }
            }`);}            
{webGLHelper.addShader("tileGrid",`
            #type vertex;      
            #name tileGrid;
            #attribute vec4 position; // base quad
            #attribute vec2 texCoords;
            varying vec2 tex;    
            varying vec2 mapTex;    
            #uniform vec2 scale;   // scale
            #uniform vec2 origin;  // origin in pixels
            #uniform vec2 screen;  // inverse screen resolution
            #uniform vec2 tiles[3]; // tile (width,height),map (width,height),tile pixel relative (width,height)
            void main() {
                gl_Position = position;
                vec2 texC = vec2(1.0,-1.0) * texCoords + origin;
                mapTex = (texC / screen / tiles[0] / tiles[1]) * scale;
                tex = texC * tiles[2] * scale;
            }
        `);}
{webGLHelper.addShader("tileGrid",`
            #type fragment;      
            #name tileGrid;
            precision mediump float;
            #uniform sampler2D texture0;  
            #uniform sampler2D map;  
            varying vec2 tex;  // incoming texture coords
            varying vec2 mapTex; // incoming map coords    
            #uniform vec2 tileSize[2]; // tiles count (width,height),tile (width,height)
            void main(){
                vec4 t = floor(texture2D(map,mapTex)*256.0);
                vec2 tile = vec2(
                            floor(mod(t.x, tileSize[0].x)),
                            floor(t.x / tileSize[0].x)
                            ) * tileSize[1];
                gl_FragColor = texture2D(texture0,mod(tex, tileSize[1]) + tile);
            }
        `);
}
{webGLHelper.addShader("smartTileGrid",`
            #type vertex;      
            #name tileGrid;
            #attribute vec4 position; // base quad
            #attribute vec2 texCoord;
            varying vec2 tex;    
            varying vec2 mapTex;    
            #uniform vec2 scale;   // scale
            #uniform vec2 origin;  // origin in pixels
            #uniform vec2 screen;  // inverse screen resolution
            #uniform vec2 tiles[3]; // tile (width,height),map (width,height),tile pixel relative (width,height)
            void main() {
                gl_Position = position;
                tex = vec2(1.0,-1.0) * texCoord + origin;
                mapTex = tex / screen / tiles[0] / tiles[1] * scale ;
                tex *= tiles[2] * scale ;
            }
        `);}
{webGLHelper.addShader("smartTileGrid",`
            #type fragment;      
            #name tileGrid;
            precision mediump float;
            #uniform int fileInfo[256]; // Max of 256 smart tiles
            #uniform sampler2D texture;  
            #uniform sampler2D map;  
            varying vec2 tex;  // incoming texture coords
            varying vec2 mapTex; // incoming map coords    
            #uniform vec2 tileSize[2]; // tiles count (width,height),tile (width,height)
            void main(){
                vec4 t = floor(texture2D(map,mapTex)*256.0);
                vec2 tile = vec2(
                            floor(mod(t.x, tileSize[0].x)),
                            floor(t.x / tileSize[0].x)
                            ) * tileSize[1];
                gl_FragColor = texture2D(texture,mod(tex, tileSize[1]) + tile);
            }
        `);
}
{webGLHelper.addShader("frameBufferTestA",`
            #type vertex;      
            #name frameBufferTestA;
            #attribute vec4 position; // base quad
            #attribute vec2 texCoord;
            varying vec2 tex;    
            void main() {
                gl_Position = position;
                tex = texCoords ;
            }
        `);
}
{webGLHelper.addShader("frameBufferTestA",`
            #type fragment;      
            #name frameBufferTestA;
            precision mediump float;
            #uniform sampler2D texture;  
            varying vec2 tex;  // incoming texture coords

            #uniform vec2 size;

            const float F = 0.0545;
            const float K = 0.062;
            const float D_a = 0.2;
            const float D_b = 0.1;

            const float TIMESTEP = 1.0;

            void main() {
                vec2 p = gl_FragCoord.xy;
                vec2 n = p + vec2(0.0, 1.0);
                vec2 e = p + vec2(1.0, 0.0);
                vec2 s = p + vec2(0.0, -1.0);
                vec2 w = p + vec2(-1.0, 0.0);

                vec2 val = texture2D(texture, p / size).xy;
                
                vec2 laplacian = texture2D(texture, n / size).xy
                                    + texture2D(texture, e / size).xy
                                    + texture2D(texture, s / size).xy
                                    + texture2D(texture, w / size).xy
                                    - 4.0 * val;

                vec2 delta = vec2(D_a * laplacian.x - val.x*val.y*val.y + F * (1.0-val.x),
                    D_b * laplacian.y + val.x*val.y*val.y - (K+F) * val.y);

                gl_FragColor = vec4(val + delta * TIMESTEP, 0, 0);
            }            
        `);
}
{webGLHelper.addShader("frameBufferTestB",`
            #type vertex;      
            #name frameBufferTestB;
            #include simplePosTexture;
            #include screenScale;
            void main() {
                gl_Position = position * vec4(scale.x,-(screen.y / screen.x) * scale.y,1.0,1.0);
                tex = texCoords;
            }            
        `);
}
{webGLHelper.addShader("frameBufferTestB",`
            #type fragment;      
            #name frameBufferTestB;
            precision mediump float;
            #include textures3;
            #include screenScale;
            #%textureSize = 512.0;
            #%atrractLen = 2212.0;
 
            
            #uniform vec2 size;
            #shadow uniform vec3 mouse; 
            const float MIX = 0.0000191;

            void main() {
                vec4 pixA = texture2D(texture0,tex);
                vec4 pixA1 = texture2D(texture0,tex+vec2(1.0/<%atrractLen>,0.0));
                vec4 pixA2 = texture2D(texture0,tex + vec2(-1.0/<%atrractLen>,0.0) );
                vec4 pixA3 = texture2D(texture0,tex + vec2(0.0,1.0/<%atrractLen>) );
                vec4 pixA4 = texture2D(texture0,tex + vec2(0.0,-1.0/<%atrractLen>) );
                vec2 likeAttr = vec2(0.0,0.0);
                float d1 = (1.0-length(pixA1-pixA))*1.0;
                float d2 = (1.0-length(pixA2-pixA))*1.0;
                float d3 = (1.0-length(pixA3-pixA))*1.0;
                float d4 = (1.0-length(pixA4-pixA))*1.0;
                likeAttr += d1*vec2(1.0/<%atrractLen>,0.0);
                likeAttr += d2*vec2(-1.0/<%atrractLen>,0.0);
                likeAttr += d3*vec2(0.0,1.0/<%atrractLen>);
                likeAttr += d4*vec2(0.0,-1.0/<%atrractLen>);
                likeAttr *= vec2(pixA.x,pixA.y)*pixA.z;
               //likeAttr = normalize(likeAttr)/(<%textureSize>/2.0);
               float lla = length(likeAttr);
                float ang = 0.01*mouse.x*lla;
                vec2 texa = tex - vec2(0.5,0.5);//+likeAttr*1.0;
                //vec2 texa = tex - vec2(mouse.y,mouse.z);
                float le = length(texa)+0.01;
                float dir = atan(texa.y,texa.x)*lla;
                le = (sin(((pixA.x-pixA.y)+1.0)/5.0)+1.2) / (le *2.0 * le);
               // if(le < 0.15){
              //      ang = 0.0;
               //}else{
                    ang = le;//-0.15;
                   ang *= 0.0015/cos(d1);
               // }
               ang *= cos(ang*10.0*pixA.z*d2)*0.6*pixA.x*(d4+d2+d3+d1);
                vec2 texT = vec2(
                   texa.x * cos(ang) + texa.y * -sin(ang),
                   texa.x * sin(ang) + texa.y * cos(ang)
               );
                texT *= 1.0/(0.9999 + cos(mouse.x + dir/(10.0*le*d3)) *0.001);
                texT +=  vec2(0.5,0.5);
                vec4 pix = texture2D(texture0,texT);
                float mm = 1.0-le*0.01*dir;;
                vec2 fromC = texT - vec2(mouse.y+0.5,mouse.z+0.5);
                float dd = atan(fromC.y,fromC.x)*14.0* sin(mouse.x *((pix.x + pix.y) * 3.14))*texT.x * texT.y;
                dd += atan(pix.y,pix.x)*14.0* sin(mouse.x *((pix.x + pix.y) * 3.14))*texT.x * texT.y;
                le = length(fromC);
                float len = sin(le * le) * 0.1;
                fromC = normalize(fromC) / <%textureSize>;
                vec2 off = vec2(-fromC.y* (texT.y-0.5),fromC.x);                
                off +=  normalize(vec2(
                        sin(mouse.x * len + dd * pix.z/d4) ,
                        cos(mouse.x * len + dd * pix.y/d4)
                   ))/<%textureSize>;
                off += vec2((pix.x -0.5)/ d4,(pix.y - 0.5)/d3)/(<%textureSize>/4.0);
              //  off += likeAttr*1.0;
                off = (normalize(off)/(<%textureSize>/4.0));///likeAttr;
                vec4 ec = vec4(
                    mm*MIX+(cos(mouse.x*21.31*pix.y*d1)*0.071*d3),
                    mm*MIX+(sin(mouse.x*31.21*pix.z*d2)*0.071*d2),
                    mm*MIX+(cos(mouse.x*11.11*pix.x*d3)*0.071*d1),
                    mm*MIX);

                gl_FragColor = texture2D(texture0,texT + off) * vec4(1.0-mm*MIX) +ec/10.0 + texture2D(texture1,texT + vec2(mouse.x*0.1,mouse.x/pix.y)) * ec;

            }`);
}
{webGLHelper.addShader("frameBufferTestB_OLD",`
            #type fragment;      
            #name frameBufferTestB_OLD;
            precision mediump float;
            #uniform sampler2D texture0;
            #uniform sampler2D texture1;
            #uniform sampler2D texture2;
            varying vec2 tex;  
            
            #uniform vec2 size;
            #shadow uniform vec3 mouse; 

            const float MIX = 0.01;

            void main() {
                float mm = 1.0;;
                vec4 pix = texture2D(texture2,tex);
                vec4 pix1 = texture2D(texture0,tex);
                //pix.x = 0.5;
                //pix.y = 0.5;
                pix1 -= vec4(0.5,0.5,0.0,0.0);
                //pix1 /= 256.0;

                float mome = pix1.z/256.0;//length(vec2(pix1.x,pix1.y))/256.0 ;
               // pix1 /= 256.0;
                //pix1 *= mome;
                pix -= vec4(0.5,0.5,0.0,0.0);
                pix /= 256.0;
                
                vec2 off = vec2(pix.x ,pix.y);
                float ll = length(off);
                off += -normalize(vec2(pix1.x* cos(mouse.x*pix.x*200.0),pix1.y* sin(mouse.x*pix.y*200.0))) * (mome + ll)  ;
                vec4 col = texture2D(texture0,tex + off);
                mome = length(off) *256.0+ 0.5;
                col.z = mome;
                vec2 o = vec2(cos(mouse.y*sin(tex.x*6.15)),sin(mouse.z*cos(tex.y*6.0))) /2.0;

                gl_FragColor = col * vec4(vec2(1.0-mm*MIX),1,1) + texture2D(texture1,tex +o ) * 
                vec4(
                    mm*MIX+(cos(mouse.x/13.*pix.y)*0.01),
                    mm*MIX+(cos(mouse.x/12.*pix.z)*0.01),
                    mm*MIX*mome,//mm*MIX+(cos(mouse.x/11.*pix.x)*0.01),
                    mm*MIX) ;
            }`);
}


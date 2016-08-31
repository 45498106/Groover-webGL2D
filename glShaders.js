
// curly braces are just from my folding system

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
            this.prep([width],13);
        },
    },
    
    ]
)}
            
{webGLHelper.addShader("grid",`
            #type vertex;      
            #name grid;
            #attribute vec4 position; // base quad
            #attribute vec2 texCoord;
            varying vec2 tex;    
            void main() {
                gl_Position = position;
                tex = vec2(1.0,-1.0) * texCoord;
            }
        `);}
{webGLHelper.addShader("grid",`
            #type fragment;      
            #name grid;
            precision mediump float;
            #uniform sampler2D texture;  
            varying vec2 tex;  // incoming texture coords

            // input colours checker1,checker2,gridcolour,extra (checkerAlpha1,checkerAlpha2,lineAlpha)
            #uniform vec3 colours[5];
            #uniform vec2 scale;   // scale
            #uniform vec2 origin;  // origin in pixels
            #uniform vec2 screen;  // inverse screen resolution

            float startGridSize = pow(8.0, floor(log(256.0 / scale.x) / log(8.0) - 1.0));
            

            vec4 checkerColour1 = vec4(colours[0],colours[3].x);
            vec4 checkerColour = vec4(colours[1],colours[3].y);
            vec4 gridColour = vec4(colours[2],colours[3].z);
            vec4 rCol;
            vec2 m = screen * startGridSize * scale;
            vec2 m1  = m * 8.0 ;
            vec2 m2  = m1 * 8.0 ;
            vec2 pix;  // scaled translated origin.
            vec2 aa1;  // grid patterns 0-2;
            vec2 aa2;
            vec2 aa3;
            vec2 gl1;  // grid lines 0-2;

            float gridLine;
            float lineWidth = colours[4].y;
            float a;

            
            void main(){
                // get text offset to origin  
                pix = tex+  origin * screen;
                // find horizontal and vertical grid lines. 
                if(colours[3].z <= 1.0){
                    a = pow((((startGridSize * scale.x)-4.0)/28.0),colours[4].x);
                    gl1.x = (1.0 - step(screen.x *  lineWidth, mod(pix.x, m1.x))) * a;
                    gl1.y = (1.0 - step(screen.y *  lineWidth, mod(pix.y, m1.y))) * a;
                    a = 1.0-a;
                    gl1.x += (1.0 - step(screen.x * lineWidth, mod(pix.x, m2.x))) * a;
                    gl1.y += (1.0 - step(screen.y * lineWidth, mod(pix.y, m2.y))) * a;
                }else{                              
                    a = pow((((startGridSize * scale.x)-4.0)/28.0),colours[4].x);
                    gl1.x = (1.0 - step(screen.x *  lineWidth, mod(pix.x, m.x)));
                    gl1.y = (1.0 - step(screen.y *  lineWidth, mod(pix.y, m.y)));
                    gl1 *=  a * 0.5;
                    gl1.x += (1.0 - step(screen.x * lineWidth, mod(pix.x, m1.x))) * (0.5 + 0.5 * a);
                    gl1.y += (1.0 - step(screen.y * lineWidth, mod(pix.y, m1.y))) * (0.5 + 0.5 * a);
                    a = 1.0-a;
                    gl1.x += (1.0 - step(screen.x * lineWidth, mod(pix.x, m2.x))) * a;
                    gl1.y += (1.0 - step(screen.y * lineWidth, mod(pix.y, m2.y))) * a;
                    
                }
                gridLine = gl1.x + gl1.y;

                // get grid pattern
                aa1 = step(m/2.0 , mod(pix, m));
                aa2 = step(m1/2.0, mod(pix, m1));
                aa3 = step(m2/2.0, mod(pix, m2));
                // mix grid pattern
                rCol = mix(
                        checkerColour, 
                        checkerColour1,
                        abs(aa2.x - aa2.y) + mix(abs(aa1.x - aa1.y), abs(aa3.x - aa3.y), a)
                );
                // mix  in grid lines
                gl_FragColor = mix(rCol, gridColour, gridLine);
            }
        
        `);}
{webGLHelper.addShader("grid1",`
            #type vertex;      
            #name grid1;
            #attribute vec4 position; // base quad
            #attribute vec2 texCoord;
            varying vec2 tex;    
            void main() {
                gl_Position = position;
                tex = vec2(1.0,-1.0) * texCoord;
            }
        `);}
{webGLHelper.addShader("grid1",`
            #type fragment;      
            #name grid1;
            precision mediump float;
            #uniform sampler2D texture;  
            varying vec2 tex;  // incoming texture coords

            // input colours checker1,checker2,gridcolour,extra (checkerAlpha1,checkerAlpha2,lineAlpha)
            #uniform vec3 colours[5];
            #uniform vec2 scale;   // scale
            #uniform vec2 origin;  // origin in pixels
            #uniform vec2 screen;  // inverse screen resolution

            float startGridSize = pow(8.0, floor(log(256.0 / scale.x) / log(8.0) - 1.0));
            

            vec4 checkerColour1 = vec4(colours[0],colours[3].x);
            vec4 checkerColour = vec4(colours[1],colours[3].y);
            vec4 gridColour = vec4(colours[2],colours[3].z);
            vec4 rCol;
            float a = pow(1.0-(((startGridSize * scale.x)-4.0)/28.0),colours[3].x);
            vec2 m = screen * startGridSize * scale;
            vec2 m1  = m * 8.0 ;
            vec2 m2  = m1 * 8.0 ;
            vec2 pix;  // scaled translated origin.
            vec2 aa1;  // grid patterns 0-2;
            vec2 aa2;
            vec2 aa3;
            vec2 gl1;  // grid lines 0-2;

            float gridLine;

            
            void main(){
                // get text offset to origin  
                pix = tex+  origin * screen;
                // find horizontal and vertical grid lines. 
                if(colours[3].z <= 1.0){
                    gl1.x = (1.0 - step(screen.x * colours[3].y, mod(pix.x, m1.x))) * (1.0 - a);
                    gl1.y = (1.0 - step(screen.y * colours[3].y, mod(pix.y, m1.y))) * (1.0 - a);
                    gl1.x += (1.0 - step(screen.x * colours[3].y, mod(pix.x, m2.x))) * a;
                    gl1.y += (1.0 - step(screen.y * colours[3].y, mod(pix.y, m2.y))) * a;
                }else{
                    gl1.x = (1.0 - step(screen.x * colours[3].y, mod(pix.x, m.x))) * (1.0 - a);
                    gl1.y = (1.0 - step(screen.y * colours[3].y, mod(pix.y, m.y))) * (1.0 - a);
                    gl1.x += (1.0 - step(screen.x * colours[3].y, mod(pix.x, m1.x)));
                    gl1.y += (1.0 - step(screen.y * colours[3].y, mod(pix.y, m1.y)));
                    gl1.x += (1.0 - step(screen.x * colours[3].y, mod(pix.x, m2.x))) * a;
                    gl1.y += (1.0 - step(screen.y * colours[3].y, mod(pix.y, m2.y))) * a;
                    
               // }
                gridLine = gl1.x + gl1.y;

                // get grid pattern
                aa1 = step(m/2.0 , mod(pix, m));
                aa2 = step(m1/2.0, mod(pix, m1));
                aa3 = step(m2/2.0, mod(pix, m2));
                // mix grid pattern
                rCol = mix(
                        checkerColour, 
                        checkerColour1,
                        abs(aa2.x - aa2.y) + mix(abs(aa1.x - aa1.y), abs(aa3.x - aa3.y), a)
                );
                // mix  in grid lines
                gl_FragColor = mix(rCol, gridColour, gridLine);
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
            varying vec2 v_texcoord;
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
               v_texcoord = texcoord ;
               alpha = desc[5].x;
            }`);}
{webGLHelper.addShader("tiles",`
            #type fragment;      
            #name tiles;
            precision mediump float;
            varying vec2 v_texcoord;
            varying float alpha;
            #uniform vec2 tile[3];
            const vec2 mir = vec2(1.0,1.0);
            uniform sampler2D texture;
            void main() {
               vec2 mirror = step(mir,mod(v_texcoord *  tile[2],tile[2]));
               vec2 tiles = abs(mirror- mod(v_texcoord *  tile[2],1.0)) * tile[1] + tile[0];
               if(alpha >= 1.){
                    gl_FragColor = texture2D(texture, tiles);
               }else{
                    gl_FragColor = texture2D(texture, tiles) * vec4(1.0 , 1.0 , 1.0 , alpha);
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
            #type vertex;      
            #name batchSprite;
            #attribute vec4 position;
            #attribute vec2 texcoord;
            // pos, scale, textPos, textScale,rotation,screenAspect,alpha,scale,center,tile
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
               if(desc[6].x > 0.0){
                   tex = vec2(float(loc[spriteLoc].x),float(loc[spriteLoc].y));
                   if(p == 0){
                        vt = topLeft;
                   }else if( p == 1){
                       tex.x += float(loc[spriteLoc].z);
                       vt = topRight;
                   }else if( p == 2){
                       tex.x += float(loc[spriteLoc].z);
                       tex.y += float(loc[spriteLoc].w);
                       vt = bottomRight;
                   }else{
                       tex.y += float(loc[spriteLoc].w);
                       vt = bottomLeft;
                   }
               }else{
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
{webGLHelper.addShader("tileGrid",`
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
                vec2 o =origin * screen;
                tex = vec2(1.0,-1.0)*texCoord+ o;
                mapTex = tex / screen / tiles[0] / tiles[1] * scale ;
                tex *= tiles[2] * scale ;
            }
        `);}
{webGLHelper.addShader("tileGrid",`
            #type fragment;      
            #name tileGrid;
            precision mediump float;
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
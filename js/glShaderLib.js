/* defines shader includes */

{webGLHelper.addLib("textures3",`
#Vertex
#Fragment            
            #uniform sampler2D texture0;
            #uniform sampler2D texture1;
            #uniform sampler2D texture2;
            #$t1 = texture0;
            #$t2 = texture1;
            #$t3 = texture2;
            `
);}
{webGLHelper.addLib("textures2",`
#Vertex
#Fragment            
            #uniform sampler2D texture0;
            #uniform sampler2D texture1;
            #$t1 = texture0;
            #$t2 = texture1;
            `
);}
{webGLHelper.addLib("textures1",`
#Vertex
#Fragment            
            #uniform sampler2D texture0;
            #$t1 = texture0;
            `
);}
{webGLHelper.addLib("simplePosTexture",`
#Vertex
            #attribute vec4 position;
            #attribute vec2 texCoords;
            #$pos = position;
            #$coords = texCoords;
#Fragment

            `
);}
{webGLHelper.addLib("screenScale",`
#Vertex
            #uniform vec2 screen;
            #uniform vec2 scale;
            varying vec2 tex;  
            #$screen = screen;
            #$scale = scale;
            #$tex = tex;
#Fragment            
            varying vec2 tex;  
            #$tex = tex;
            `
);}
{webGLHelper.addLib("screenScaleOrigin",`
#Vertex
            #uniform vec2 screen;
            #uniform vec2 scale;
            #uniform vec2 origin;
            varying vec2 tex;  
#Fragment            
            varying vec2 tex;  
            `
);}

{webGLHelper.addLib("origin_scaleScreen",`
#Vertex
            #uniform vec2 origin;
            varying vec2 tex;  
            #$origin = origin;
            #$tex = tex;
#Fragment            
            #uniform vec2 screen;
            #uniform vec2 scale;
            varying vec2 tex;  
            #$screen = screen;
            #$scale = scale;
            #$tex = tex;
            `
);}

{webGLHelper.addLib("screenScaleFull",`
#Vertex
            #include simplePosTexture;
            #include screenScale;
            void main() {
                gl_Position = $pos * vec4($scale.x,-($screen.y / $screen.x) * $scale.y,1.0,1.0);
                tex = $coords;
            }

#Fragment            
            precision mediump float;
            #include screenScale;
            #include textures1;            
            `
);}

{webGLHelper.addLib("beckmannSpecular",`
#Vertex
#Fragment            
        float beckSpecular( vec3 lightDir, vec3 viewDir, vec3 surfaceNormal, float roughness) {
          float nDotH = max(dot(surfaceNormal, normalize(lightDir + viewDir)), 0.0001);          
          nDotH *= nDotH;
          float r = roughness * roughness;
          return exp(((nDotH - 1.0) / nDotH) / r) / (3.141592653589793 * r * nDotH * nDotH);
        }
        `
);}
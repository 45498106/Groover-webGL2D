/* defines shader includes */

{webGLHelper.addLib("textures3",`
#Vertex
#Fragment            
            #uniform sampler2D texture0;
            #uniform sampler2D texture1;
            #uniform sampler2D texture2;
            #%t1 = texture0;
            #%t2 = texture1;
            #%t3 = texture2;
            `
);}
{webGLHelper.addLib("textures2",`
#Vertex
#Fragment            
            #uniform sampler2D texture0;
            #uniform sampler2D texture1;
            #%t1 = texture0;
            #%t2 = texture1;
            `
);}
{webGLHelper.addLib("textures1",`
#Vertex
#Fragment            
            #uniform sampler2D texture0;
            #%t1 = texture0;
            `
);}
{webGLHelper.addLib("simplePosTexture",`
#Vertex
            #attribute vec4 position;
            #attribute vec2 texCoords;  
            #%pos = position;
            #%coords = texCoords;
#Fragment            
            `
);}
{webGLHelper.addLib("screenScale",`
#Vertex
            #uniform vec2 screen;
            #uniform vec2 scale;
            varying vec2 tex;  
#Fragment            
            varying vec2 tex;  
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
            #%origin = origin;
            #%tex = tex;
#Fragment            
            #uniform vec2 screen;
            #uniform vec2 scale;
            varying vec2 tex;  
            #%screen = screen;
            #%scale = scale;
            #%tex = tex;
            `
);}
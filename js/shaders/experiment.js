// experimental shader file



program swirl {
    vertex {
        #include simplePosTexture;
        #include screenScale;
        void main() {
            gl_Position = $pos * vec4($scale.x,-($screen.y / $screen.x) * $scale.y,1.0,1.0);
            $tex = $coords;
        }    
    }        
    fragment {
        precision mediump float;
        #include textures3;
        #include screenScale;
        #include swirlFirstExperiment2;
        #uniform vec2 size;
        #shadow uniform vec3 mouse; 
        #$gTime = mouse.x;
        void main() {
            vec4 pixA = texture2D(texture0, $tex);
            vec4 pixA1 = texture2D(texture0, $tex + vec2(1.0 / $atrractLen, 0.0));
            vec4 pixA2 = texture2D(texture0, $tex + vec2(-1.0 / $atrractLen, 0.0));
            vec4 pixA3 = texture2D(texture0, $tex + vec2(0.0, 1.0 / $atrractLen));
            vec4 pixA4 = texture2D(texture0, $tex + vec2(0.0, -1.0 / $atrractLen));
            vec2 likeAttr = vec2(0.0, 0.0);
            float d1 = (1.0 - length(pixA1 - pixA)) * $attractorLenScale;
            float d2 = (1.0 - length(pixA2 - pixA)) * $attractorLenScale;
            float d3 = (1.0 - length(pixA3 - pixA)) * $attractorLenScale;
            float d4 = (1.0 - length(pixA4 - pixA)) * $attractorLenScale;
            likeAttr += d1 * vec2(1.0 / $atrractLen, 0.0);
            likeAttr += d2 * vec2(-1.0 / $atrractLen, 0.0);
            likeAttr += d3 * vec2(0.0, 1.0 / $atrractLen);
            likeAttr += d4 * vec2(0.0, -1.0 / $atrractLen);
            likeAttr *= vec2(pixA.x, pixA.y) * pixA.z;
            likeAttr = normalize(likeAttr) / ($textureSize / $attractorScale);
            float lla = length(likeAttr);
            float ang = 0.01 * $gTime * lla;
            vec2 texa = $tex - vec2(0.5, 0.5); 
            float le = length(texa) + 0.01;
            le = (sin(((pixA.x - pixA.y) + 1.0) / $lenSinScale) + $lenSinOffset) / (le * $lenReductionAmount * le);
            float dir = atan(texa.y, texa.x) * lla;
            ang = le * ($rotAngleStart / cos(d1));
            ang += cos(($gTime / $rotVaryFreq) * pixA.x) * ($rotVaryAmount * pixA.y);
            ang *= cos(ang * $rotVaryColfeedback * pixA.z * d2) * $rotVaryColfeedbackAmount * pixA.x * (d4 + d2 + d3 + d1);
            vec2 texT = vec2(
                    texa.x * cos(ang * $ang3) + texa.y * -sin(ang * $ang1),
                    texa.x * sin(ang * $ang4) + texa.y * cos(ang * $ang2));
            ang -= le / 200.0;
            vec2 texT1 = vec2(
                    texa.x * cos(ang * $ang4) + texa.y * -sin(ang * $ang2),
                    texa.x * sin(ang * $ang1) + texa.y * cos(ang * $ang3));
            texT *= 1.0 / (0.9999 + cos($gTime + dir / ($zoomOcc1 * le * d3)) * $zoomOccScale);
            texT1 *= 1.0 / (0.9999 + sin($gTime + dir / ($zoomOcc1 * le * d3)) * $zoomOccScale);
            texT += vec2(0.5, 0.5); 
            texT1 += vec2(0.5 , 0.5); 
            vec4 pix = texture2D(texture0, texT);
            float mm = 1.0 - le * 0.01 * dir; ;
            vec2 fromC = (texT - vec2(mouse.y + 0.5, mouse.z + 0.5));
            float dd = atan(fromC.y, fromC.x) * $directionScale * sin($gTime * ((pix.x + pix.y) * $PI)) * texT.x * texT.y;
            dd += atan(pix.y, pix.x) * $directionScale1 * sin($gTime * ((pix.x + pix.y) * $PI)) * texT.x * texT.y;
            le = length(fromC);
            float len = sin(le * le) * $lenOccilatorScale;
            fromC = normalize(fromC) / $textureSize;
            vec2 off = vec2(-fromC.y * (texT.y - 0.5), fromC.x);
            off += normalize(vec2(
                    sin(mouse.x * len + dd * pix.z / d4),
                    cos(mouse.x * len + dd * pix.y / d4))) / $textureSize;
            float dot3 = dot(normalize(fromC), normalize(off));
            off += vec2((pix.x - 0.5) / d4, (pix.y - 0.5) / d3) / ($textureSize / 4.0);
            off += likeAttr * (0.5 + sin($gTime / $attractOcc1) * $attractOccScale1 + sin($gTime / $attractOcc2) * $attractOccScale2);
            vec4 ec = vec4(
                    mm * $mix + (cos($gTime * $mixR * pix.y * off.x) * $mix1),
                    mm * $mix + (cos($gTime * $mixG * pix.z * off.y) * $mix1),
                    mm * $mix + (cos($gTime * $mixB * pix.x * off.x * off.y) * $mix1),
                    mm * $mix);
            float dot1 = dot(normalize(texT), normalize(off));
            float dot2 = dot(normalize(texa), normalize(likeAttr));
            vec4 tt = texture2D(texture0, texT + off + likeAttr);
            vec4 tt1 = texture2D(texture0, texT1 - likeAttr);
            float mi = sqrt(abs(sin(dot1 * 6.56)));
            tt = mi * tt1 + (1.0 - mi) * tt;
            float ttr = tt.x * off.x * 1.0 * dot1 / dot3;
            float ttg = tt.y * off.y * 1.0 * dot2 / dot1;
            float ttb = tt.z * likeAttr.y * 1.0 * dot3 / dot2;
            tt -= vec4(ttr, ttg, ttb, 0.0);
            tt += vec4(ttg, ttb, ttr, 0.0);
            gl_FragColor = tt * vec4(1.0 - mm * $mix) +
                texture2D(texture1, (texT + vec2($gTime * $backXMovement, $gTime * $backYMovement))*fromC*100000.0) * ec;
        }
    }
}

library swirlFirstExperiment2 {
    vertex {
        
    }
    fragment {
        #$textureSize = settings[0]; // abstract texture size
        #$atrractLen = settings[1]; // dist between attracting colours
        #$attractorScale = settings[2];
        #$attractorLenScale = settings[3];
        #$mix = 0.0051;  // mix amount of background image
        #$mix1 = 0.00042; // mix of colour change
        #$mixR = settings[7]; // mix time multiplier for red
        #$mixG = settings[8]; // green
        #$mixB = settings[9]; // blue
        #$ang1 = (sin(mouse.x/200.0)*0.4+0.5);
        #$ang2 = pixA.x*d3;
        #$ang3 = pixA.y*d2;
        #$ang4 = pixA.z*d1;
        #$lenSinScale = settings[10];
        #$lenSinOffset = settings[11];
        #$lenReductionAmount = (sin(mouse.x/200.0)*4.1+3.0+pixA.x*2.0);
        #$rotAngleStart = settings[12];
        #$rotVaryFreq = settings[13];  ////// divides time with this value
        #$rotVaryAmount = settings[14]; 
        #$rotVaryColfeedback = settings[15];
        #$rotVaryColfeedbackAmount = settings[16];
        #$directionScale = settings[17];
        #$directionScale1 = settings[18];
        #$PI = 3.1415;
        #$lenOccilatorScale = settings[4];
        #$attractOcc1 = settings[5];
        #$attractOcc2 = settings[6];
        #$attractOccScale1 = settings[19];
        #$attractOccScale2 = settings[20];
        #$backYMovement = settings[21];
        #$backXMovement = settings[22];
        #$zoomOcc1 = settings[23];
        #$zoomOccScale = settings[24];
        #shadow uniform float settings[textureSize=10000.0, atrractLen=10.4, attractorScale=3.1,attractorLenScale =4.1,lenOccilatorScale=1.1,attractOcc1= 4.0,attractOcc2=2.0,mixR = 1.0,mixG = 2.0,mixB=13.0,lenSinScale= 0.13,lenSinOffset= 1.13,rotAngleStart=0.00015,rotVaryFreq=0.0001,rotVaryAmount=0.002,rotVaryColfeedback = 2.0,rotVaryColfeedbackAmount = 0.9,directionScale = 5.0,directionScale1 = 5.0,attractOccScale1 = 0.5,attractOccScale2 = 0.5,backYMovement = 0.0005,backXMovement = 0.001,zoomOcc1 = 10.0,zoomOccScale = 0.0001]; 
    }
}
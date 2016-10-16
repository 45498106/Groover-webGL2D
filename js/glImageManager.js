var imageManager = (function(){
    var vetGL = function(gl,who){
        if(gl === undefined || gl === null ){
            if(canvasMouse !== undefined && 
                canvasMouse.webGL !== undefined &&
                canvasMouse.webGL !== null &&
                canvasMouse.webGL.gl !== undefined &&
                canvasMouse.webGL.gl !== null){
                return canvasMouse.webGL.gl;
             }
        }else{
            return gl;
        }
        throw new ReferenceError(who," can not find a webGL context.");
    }
    var updateTileMap = function(gl){
        webGLHelper.updateTexture(gl,this);
    }
    
    var API = {
        createImageSet : function(URLs,names,sampler){
            var imageSet = {
                images : {},
                textures : {},    
            }            
            if(!Array.isArray(names)){
                names = [names];
            }
            if(!Array.isArray(URLs)){
                URLs = [URLs];
            }
            imageSet.urls = [];
            imageSet.names = [];
            imageSet.options = [];
            
            URLs.forEach((url,i) => {
                imageSet.urls.push(url);
                if(names !== undefined){
                    imageSet.names.push(names[i]);
                }else{
                    imageSet.names.push(url.split("/").pop().split(".")[0]);
                }
                var option = {};
                imageSet.options.push(option);
                if(sampler !== undefined){
                    if(typeof sampler === "string"){
                        option.sampler = sampler;
                    }else if(Array.isArray(sampler)){
                        option.sampler = sampler[i];
                    }
                }
                        
            });
            return imageSet;
        },
        loadImageSet : function(imageSet){
            var i,count;
            var load = function(image){
                imageSet.textures[this.name] = webGLHelper.createTexture(canvasMouse.webGL.gl,this, imageSet.images[this.name].options);
                count -= 1;
                if(count === 0){
                    if(typeof imageSet.allLoaded === "function"){
                        imageSet.allLoaded();
                    }
                    imageSet.ready = true;
                }
            }
            count = 0;
            imageSet.images = {};
            imageSet.textures = {};
            for(i = 0; i < imageSet.urls.length; i ++){
                imageSet.images[imageSet.names[i]] = imageLoader.loadImage(imageSet.urls[i],load);
                imageSet.images[imageSet.names[i]].name = imageSet.names[i];
                imageSet.images[imageSet.names[i]].options = imageSet.options[i];
                
                count += 1;
                logs.log("loading image : " + imageSet.names[i]);
            }
            imageSet.ready = false;
            return imageSet;
        },
        createTileMap : function(width,height,maxTiles,gl){
            var tileMap;
            var map;
            gl = vetGL(gl,"createTileMap");
            tileMap = {};
            if(maxTiles <= 256){
                map = new Uint8Array(width * height);
                tileMap.options = {};
                tileMap.options.format = gl.LUMINANCE;
                tileMap.options.sampler = "repeatNear";
                tileMap.bytesPerTile = 1;
            }else
            if(maxTiles <= 256 * 256){
                throw new Error("16 bit or greater tile maps currently unsupported. Stay tuned!");                
            }else
            if(maxTiles <= 256 * 256 * 256){
                throw new Error("16 bit or greater tile maps currently unsupported. Stay tuned!");                
            }
            for(var i = 0; i < width * height * tileMap.bytesPerTile; i ++){
                map[i] = Math.floor(Math.random() * maxTiles);
            }
            tileMap.maxTiles = maxTiles;
            tileMap.width = width;
            tileMap.height = height;
            tileMap.texture = webGLHelper.createImageFromData(gl,width,map,tileMap.options);
            tileMap.ready = true;   
            tileMap.map = map;   
            tileMap.update = updateTileMap;
            
            return tileMap;
        },
        loadMapTiles : function(tileInfo){
            var loadMap = function(){
                var can = document.createElement("canvas");
                can.width = this.width;
                can.height = this.height;
                var pixCount = this.width * this.height;
                var ctx = can.getContext("2d");
                ctx.drawImage(this,0,0);
                var imgData = ctx.getImageData(0,0,this.width,this.height);
                var data = new Uint32Array(imgData.data.buffer);
                var i = 0;
                var tileId= [];
                var map = [];
                while(data[i] !== 0 && i < 256 && i < pixCount){
                    tileId.push(data[i++]);
                }
                if(i === 0){
                    throw new SyntaxError("Tile map '"+this.src+"' missing tile definition pixels.")
                }
                while(data[i] !== 0 && i < pixCount){i++}; // skip extra pixel defs
                while(data[i] === 0 && i < pixCount){i++}; // skip blank pixels
                if(i === pixCount){
                    throw new SyntaxError("Tile map '"+this.src+"' missing map pixels.")
                }
                while(data[i] !== 0 && i < pixCount){
                    map.push(tileId.indexOf(data[i++]));
                }
                map = new Uint8Array(map);
                tileInfo.width = this.width;
                tileInfo.height = Math.floor(map.length / this.width);
                tileInfo.texture = webGLHelper.createImageFromData(canvasMouse.webGL.gl,this.width,canvasMouse.webGL.gl.LUMINANCE,map);
                tileInfo.ready = true;

            }
            tileInfo.image = imageLoader.loadImage(tileInfo.url,loadMap)
            tileInfo.ready = false;
        },
        loadSpriteSheet : function (sprites){
            var load = function(image){
                sprites.image.sprites = sprites.sprites;
                if(sprites.texture === null){
                    sprites.texture = webGLHelper.createTexture(canvasMouse.webGL.gl,this,sprites.options);
                    if(sprites.sprites !== undefined){
                        var len = sprites.sprites.length;
                        sprites.locations = new Int32Array(len * 4);
                        var ind  = 0;
                        sprites.sprites.forEach(spr => {
                            spr[4] = spr[0] / this.width;
                            spr[5] = spr[1] / this.height;
                            spr[6] = spr[2] / this.width;
                            spr[7] = spr[3] / this.height;
                            sprites.locations[ind++] = spr[0];
                            sprites.locations[ind++] = spr[1];
                            sprites.locations[ind++] = spr[2];
                            sprites.locations[ind++] = spr[3];
                        });
                   
                    }else if(sprites.tiles !== null){
                        sprites.tileWidth = this.width / sprites.tilesX ;
                        sprites.tileHeight = this.height / sprites.tilesY;
                        sprites.tiles = [sprites.tilesX,sprites.tilesY,sprites.tileWidth,sprites.tileHeight];

                        sprites.locations = new Int32Array( 4);
                        sprites.locations [0] = sprites.tiles[0];
                        sprites.locations [1] = sprites.tiles[1];
                        sprites.locations [2] = sprites.tiles[2];
                        sprites.locations [3] = sprites.tiles[3];
                        sprites.sprites = [[
                         0,
                         0,
                         sprites.locations[2],
                         sprites.locations[3],
                         0,
                         0,
                         sprites.locations[2]/this.width ,
                         sprites.locations[3]/this.height,
                         ]]
                    }
                }
                sprites.ready = true;
            }
            sprites.image = imageLoader.loadImage(sprites.url,load);
            sprites.ready = false;
        },
    }
    return API;
})();
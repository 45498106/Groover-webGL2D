var spriteTile = (function(){

    var API = {
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
               // debugger
                //log("Map count " + tileId.length)
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
                //log("map size : " + map.length)
                map = new Uint8Array(map);
                tileInfo.width = this.width;
                tileInfo.height = Math.floor(map.length / this.width);
                tileInfo.texture = webGLHelper.createImageFromData(canvasMouse.webGL.gl,this.width,canvasMouse.webGL.gl.LUMINANCE,map);
                tileInfo.ready = true;
                //log("Map time loaded tiles: " +tileId.length+ " W : " +tileInfo.width+ " H : " +tileInfo.height )

            }
            tileInfo.image = imageLoader.loadImage(tileInfo.url,loadMap)
            tileInfo.ready = false;
        },
        loadSpriteSheet : function (sprites){
            var load = function(image){
                sprites.image.sprites = sprites.sprites;
                if(sprites.texture === null){
                    sprites.texture = webGLHelper.createTexture(canvasMouse.webGL.gl,this);
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
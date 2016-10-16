/* WARNING this extends the Javascript Array prototype and should not be used in publicly scoped 
   environments unless you know what you are doing. This has nothing to do with the Groover-WebGL2D 
   demo and you should use alternative object management scheme if unsure 
*/
if (Array.prototype.fastStack === undefined) {
     Object.defineProperty(Array.prototype, 'fMaxLength', { // internal and should not be used
        writable : true,
        enumerable : false,
        configurable : false,
        value : undefined
     });
     Object.defineProperty(Array.prototype, 'fLength', { // internal do not use
        writable : true,
        enumerable : false,
        configurable : false,
        value : 0
     });
     Object.defineProperty(Array.prototype, 'flag', {  // internal and do not use;
        writable : true,
        enumerable : false,
        configurable : false,
        value : undefined
     });
    Object.defineProperty(Array.prototype, 'fNextFree', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (item) {
            if(this.fLength < this.fMaxLength){
                this.fLength += 1;
                return this[this.fLength-1];
            }
            return undefined;
        }
    });
    Object.defineProperty(Array.prototype, 'fPush', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (item) {
            var o,i;
            if(this.fLength < this.fMaxLength){
                o = this[this.fLength];
                for(i in item){
                    o[i] = item[i];
                }
                this.fLength += 1;
            }
            return o;
        }
    });
    Object.defineProperty(Array.prototype, 'fEach', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            var i, tail,count,o,len;
            len = this.fLength;
            i = 0;
            tail = 0;
            count = 0;
            while( i < len ) {
                if( this[i][this.flag] !== undefined) {
                    count += 1;
                    func(this[i], i);
                    if(this[i][this.flag] === undefined) {
                        tail += 1;
                    }else{ // swap unused
                        if(tail > 0){
                            o = this[i - tail];
                            this[i - tail] = this[i];
                            this[i] = o;
                        }
                    }
                }
                i++;
            }
            this.fLength = count-tail;
        }
    });
    Object.defineProperty(Array.prototype, 'fEachCustom', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            var w = canvasMouse.canvas.width + 100;
            var h = canvasMouse.canvas.height + 100;              
            var i, len;
            var r;
            len = this.fLength;
            i = 0;
            tail = 0;
            count = 0;
            while( i < len ) {
                r = this[i];
                r.x += r.dx;
                r.y += r.dy;
                r.r += r.dr;
                r.x %= w;
                r.y %= h;
                spriteRender.drawSpriteBatch(r.sprite,r.x-50,r.y-50,r.s,r.r,1);
                i++;
            }
            
        }
    });
    Object.defineProperty(Array.prototype, 'fEachQ', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (func) {
            var i,len;
            len = this.fLength;
            i = 0;
            while( i < len ) {
                if( this[i][this.flag] !== undefined) {
                    func(this[i], i);
                }
                i++;
            }
        }
    });
    Object.defineProperty(Array.prototype, 'fastStack', {
        writable : false,
        enumerable : false,
        configurable : false,
        value : function (size,item,flag) {
            var i, o, j;
            if(this.fMaxLength === undefined){
                this.fMaxLength = this.length;
            }
            if(item[flag] === undefined){
                throw new ReferanceError("FastArray item descriptor missing matching flag property '"+flag+"'");
            }
            this.flag = flag;
            if(this.fMaxLength < size){
                for(i = this.fMaxLength; i < size; i++){
                    o = {};
                    for(j in item){
                        o[j] = undefined;
                    }
                    this.push(o);
                }
            }
            
            this.fLength = 0;
            return this.fMaxLength = this.fMaxLength < size ? size : this.fMaxLength;
        }
    });

}
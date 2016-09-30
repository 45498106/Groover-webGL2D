var frameRate = (function(){
    var lastTime = canvasMouse.globalTime;
    var lastFrameRate;
    var updateStatsCounter = 30;
    var updateFunction = function(){
        this.frameTime = canvasMouse.globalTime - lastTime;
        this.frameRate = Math.round(1000 / this.frameTime ) ;
        if(this.displayCallback !== null){
            if(this.frameRate !== lastFrameRate){
                if(updateStatsCounter === 0){
                    updateStats(this.frameRate.toFixed(0) + "FPS");
                    lastFrameRate = this.frameRate;
                    updateStatsCounter = this.displayUpdateRate;
                }
                updateStatsCounter-= 1;
            }
        }
        lastTime = canvasMouse.globalTime;    
    }
    var API = {
        frameRate : 0,
        frameTime : 0,
        displayUpdateRate : 1, // in frames
        displayCallback : null,
        update : null,
    }
    API.update = updateFunction.bind(API);
    return API;
})();
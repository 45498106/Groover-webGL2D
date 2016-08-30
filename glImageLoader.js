var imageLoader = (function(){
    var imageCount = 0;
    var imagesLoadedCallBack = null;
    var API = {
        imagesLoadedCallBack : null,
        loadImage : function (url,callback){
            imageCount += 1;
            var image = new Image();
            image.src = url;
            image.onload = function(){
                if(typeof callback === "function"){
                    (callback.bind(this))(this);
                }
                imageCount -= 1;
                if(imageCount === 0 &&  typeof imagesLoadedCallBack === "function"){
                    imagesLoadedCallBack();
                }    
            }
            image.onerror = function(event){
                image.error = true;
                throw new Error("Image load error: '" + url + "'")

            }    
            return image;
        },
    }
    return API;
})();
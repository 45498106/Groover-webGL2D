// simple file loader loads a file via ajax ( hence it must be served)
// fileLoader.loadFile(url,callback); // callback is optional
// callback has one argument the file (all that is associated)
// callback(file)
//     file.status The status "loaded", "loading", "error", "not found" 
//                  If error the error event is in file.errorEvent
//     file.ajax   The request object
//     file.name   The file URL
//     file.callback The callback function

var fileReadWriter = (function(){    
    function load(file){
        function onLoad(e){
            if(e.target.status === 404){
                file.status = "not found";
                if(typeof file.callback === "function"){
                    file.callback(file);
                }
            } else {
                file.status = "loaded";
                if(typeof file.callback === "function"){
                    file.callback(file);
                }
            }
        }
        function onError(e){
            file.errorEvent = e;
            file.status = "error";
            if(typeof file.callback === "function"){
                file.callback(file);
            }            
        }
        file.ajax.onload = onLoad;
        file.ajax.onError = onError;
        file.status = "loading";
        file.ajax.open('GET', file.name, true);
        file.ajax.setRequestHeader("Pragma","no-cache");         
        file.ajax.send();        
        
    }
    var API = {
        load : function(name,callback){
            var file = {};
            file.ajax = new XMLHttpRequest();
            file.name = name;
            file.callback = callback;    
            load(file);
            return file;
        }
    };
    return API;
})();
var jsonReadWriter = (function(){
    var callback;
    var loaded = function(file){
        if(file.status === "loaded"){
            if(typeof callback === "function"){
                callback(JSON.parse(file.ajax.responseText));
            }else{
                file.data = JSON.parse(file.ajax.responseText);
            }
        }
    }
    var API = {
        load : function(filename,_callback){
            callback = _callback;
            return fileReadWriter.load(filename,loaded);
            
        },
    }
    return API;
})();

var blockReader = (function(){ // reads nested blocks {} () [] 

    var API = {
        readBlock : function (str,name,fields = 0,type = "{}"){
            var regStr = name
            var i = fields;
            while(i-- > 0){
                 regStr += "\\s(\\w+?)";
            }            
            regStr += "\\s*?\\" + type[0];
            var re = new RegExp(regStr,"g");
            var index = str.indexOf(re);
            var depth = 0;
            var endFound = false;
            var retStr = "";
            if(start > -1){
                while(index < str.length && !endFound){
                    var c= str[index++];
                    if(c === type[0]){
                        depth += 1;
                    } else if( c === type[1]){
                        depth -= 1;
                        if(depth === 0){
                            endFound = true;
                        }
                    }
                    retStr += c;
                }
                
            }
            
            
            
            
        }
    }
    
    
})();
        
var logs = (function(){
    var logAData = "";
    var logADataS = "";
    var lastData = undefined;
    var lastLogSpan = undefined;
    var logSpanId = 0;
    var newLineLog = false;    
    var logs;
    var position = {
        top : "7px",
        left : "7px",
        width : "200px",
        height : "420px",
    }
    var classNames = {
        prefix : "cMess",
        error : "Error",
        warn : "Warn",
        errorTrace : "ErrorTrace",
        sys : "Sys",
        counter : "Counter",
        logDisplay : "logDisplay",
        controls : "logControls",
        inputText : "Input",
    }
    var styleElement,styleContainor,element;
    function createStyleContent(){
        return `
        .${classNames.logDisplay} {
            position: absolute;
            top: ${position.top};
            left: ${position.left};
            max-height: ${position.height};
            max-width: ${position.width};
            width: ${position.width};
            border: black solid;
            border-width: 1px;
            overflow-y: auto;   
            padding : 4px;
            z-index :1000;
            font-size : 10px;
        }    
        .${classNames.controls} {
            position: sticky;
            top : 0px;
            left : unset;
            padding :0px 4px 0px 4px;
            background : blue;
            color : white;
            font-size : 10px;
            height :12px;
            text-align: center;
            border: white 1px solid;
            cursor : pointer;
            z-index :1001;
            margin: 0px 1px;
            font-weight: 900;            
        }
        .${classNames.controls}:hover {
            background : red;
            color : white;
        }
        .${classNames.prefix} {
            color: ${API.color};
            background: ${API.background};
            display: block;
            word-wrap: break-word;
        }
        .${classNames.prefix + classNames.inputText} {
            color: ${API.color};
            background: ${API.background};
            width: 100px;
            text-align: right;
            font-size: xx-small;            
        }
        .${classNames.prefix + classNames.counter} { /*  the counter for repeated values */
            color: ${API.colorCounter};
            background: ${API.background};
            word-wrap: break-word;
        }
        .${classNames.prefix + classNames.sys} {
            color: ${API.colorSys};
            background: ${API.background};
            display: block;
            word-wrap: break-word;
        }
        .${classNames.prefix + classNames.sys + classNames.error} {
            color: ${API.colorError};
            background: ${API.background};
            display: block;
            word-wrap: break-word;
            font-weight: 600;    
        }
        .${classNames.prefix + classNames.sys + classNames.warn} {
            color: ${API.colorWarn};
            background: ${API.background};
            display: block;
            word-wrap: break-word;
            font-weight: 600;    
            font-size:small;     
        }
        .${classNames.prefix + classNames.sys + classNames.errorTrace} {
            color: ${API.colorTrace};
            background: ${API.background};
            display: block;
            word-wrap: break-word;
            font-weight: 600; 
            font-size:x-small;    
        }
        
        
        `;
    }


    
    function logA(data) {
        logAData += logADataS + data;
        logADataS = ", ";
    }
    function logF(data) {
        if(typeof data === "number"){
            logAData += logADataS + data.toFixed(2);
            logADataS = ", ";
        }else{
            logA(data);
        }
    }
    var logP = (n,names,o) => {
        
        if(o !== undefined){
            logA(n + "<br>");
            logADataS = "";
        }else{
            o = n;
        }
        if(names !== undefined){
            if(typeof names === "string"){
               names = names.split(",");
            }
            names.forEach(f =>{
                 if(typeof o[f] !== "function"){
                    logA(f + " : " +o[f] + "<br>");
                    logADataS = "";
                }    
            });          
        }else{
            for(var i in o){ 
                if(typeof o[i] !== "function"){
                    logA(i + " : " +o[i] + "<br>");
                    logADataS = "";
                }
            }
        }
        log();
    }
    var logPf = (n,o) => {
        if(o !== undefined){
            logA(n + "<br>");
            logADataS = "";
        }else{
            o = n;
        }
        for(var i in o){ 
            try{
            if(typeof o[i] !== "function"){
                logA(i + " : " +o[i] + "<br>");
                logADataS = "";
            }else{
                logA(i + "()<br>");
                logADataS = "";
            }
            }catch(e){
                logA(i+"<br>");
            }            
        }
        log();
    }
    function logg(data){
        newLineLog = true;
        log(data);
    }
    function log(data) {
        if(logs === undefined){
            console.log(data);
            return;
        }
        logADataS = "";
        var str = "";
        if(data !== undefined && data !== null && typeof data.toString === "function"){
            data = data.toString();
        }
        if(!newLineLog && logAData === "" && data === lastData){
            
            var span = document.getElementById("logSpan"+logSpanId);
            if(span !== null){
                var count = span.getElementsByClassName((classNames.prefix + classNames.counter))[0];
                if(count !== undefined){
                    if(count.textContent === ""){
                        count.textContent = "1"+" : ";
                    }else{
                        count.textContent = (Number(count.textContent.replace(" : ","")) + 1) + " : ";
                    }
                    lastLogSpan = span;
                    lastData = data;
                    logs.scrollTop = logs.scrollHeight;
                    return;
                }
            }
            
        }
        newLineLog = false;
        var span = document.createElement("span");
        var span1 = document.createElement("span");
        span.className = classNames.prefix;
        logSpanId += 1;
        span.id = "logSpan"+logSpanId;
        span1.className = (classNames.prefix + classNames.counter);
        var s = "";
        if(logAData !== ""){
            str += s + logAData;
            logAData = "";
        }
        if(data !== undefined){
            str += s + data;
        }
        span.appendChild(span1);
        span.innerHTML += str; 
        span1.textContent = "";
        logs.appendChild(span);
        lastLogSpan = span;
        lastData = data;
        logs.scrollTop = logs.scrollHeight;
    }
    function logValMod(data){  //data is {name:"name", value : "value"}
        if(logs === undefined){
            console.log(data);
            return;
        }
        var span = document.createElement("span");
        span.className = classNames.prefix;
        var input = document.createElement("input");
        input.type = "number";
        input.className = classNames.prefix + classNames.inputText;
        input.id = "logInput_"+ data.name;
        input.value = data.value;
        span.textContent = data.name;
        span.appendChild(input);
        logs.appendChild(span);
        logs.scrollTop = logs.scrollHeight;
        
        
        
    }
    function logSys(data, error,showConsole) {
        if (error) {
            var str = "<span class='" + (classNames.prefix + classNames.sys + classNames.error) + "'>"
            if(showConsole){
                console.error(data);
            }
        } else {
            var str = "<span class='" + (classNames.prefix + classNames.sys) + "'>"
            if(showConsole){
                console.log(data);
            }

        }
        str += data;
        str += "</span>"
        logs.innerHTML += str;
        logs.scrollTop = logs.scrollHeight;
    }
    function logSysWarn(data) {
        var str = "<span class='" + (classNames.prefix + classNames.sys + classNames.warn) + "'>"
        str += data;
        str += "</span>"
        logs.innerHTML += str;
        logs.scrollTop = logs.scrollHeight;
    }
    function logSysTrace(data){
        data.each(l=>{
            if(l.indexOf("getCallStackTrace") === -1 && l.indexOf("consoleWarn") === -1){
                if(l.indexOf("Error:") > -1){
                    logSys(l,true);
                }
            }
        });

        var str = "<span class='" + (classNames.prefix + classNames.sys + classNames.errorTrace) + "'>"
        data.each(l=>{
            if(l.indexOf("getCallStackTrace") === -1 && l.indexOf("consoleWarn") === -1){
                if(l.indexOf("Error:")> -1){

                }else{
                    l = l.replace(/http.*\//g,"");
                    str += l + "<br>";
                }
            }
        });
        str += "</span>"
        logs.innerHTML += str;
        logs.scrollTop = logs.scrollHeight;
        
    }
    function clearLog() {
        logClear() 
    }
    function logClear() {
        logs.innerHTML = "";
        logs.scrollTop = logs.scrollHeight;
        if(controls !== undefined){
            if(controls.close){
                logs.appendChild(controls.close);
            }
            if(controls.clear){
                logs.appendChild(controls.clear);            
            }
        }

    }
    var API = {
        setElement : function(element){
            logs = element;
        },
        getElement : function(){
            return logs;
        },
        classNames : classNames,
        nameVal : logValMod,
        log : log,
        logP : logP,
        clear : logClear,
        addStyle : function(element){
            styleElement = document.createElement("style");
            styleElement.innerHTML = createStyleContent();
            styleContainor = element;
            if(styleContainor === undefined){
                styleContainor = document.head;
            }
            styleContainor.appendChild(styleElement);
        },
        setPosition : function(left,top,width,height){
            position.top = top;
            position.left = left;
            position.width = width;
            position.height = height;

            if(styleElement !== undefined){  // there must be a better way
                styleContainor.removeChild(styleElement);
            }
            createStyleContent();
        },
        start : function(options){
            this.addStyle();
            element = document.createElement("div");    
            this.setElement(element);
            element.className = classNames.logDisplay;
            if(options){
                controls = {};

                if(options.closeBox){
                    controls.close = document.createElement("span");    
                    controls.close.className = classNames.logDisplay + " " + classNames.controls;
                    controls.close.textContent = "X";
                    controls.close.title = "Click to close Log display";
                    element.appendChild(controls.close);
                    controls.close.addEventListener("click",function(){
                        document.body.removeChild(element);
                    });
                }
                if(options.clear){
                    controls.clear = document.createElement("span");    
                    controls.clear.className = classNames.logDisplay + " " + classNames.controls;
                    controls.clear.textContent = "clear";
                    controls.clear.title = "Click to clear the log";
                    element.appendChild(controls.clear);
                    controls.clear.addEventListener("click",function(){
                        clearLog();
                    });
                    
                    
                }
            }
            
            
            document.body.appendChild(element);
            return element;
        },

        background : "#40567D",
        color : "wheat",
        colorError : "#E7A8A8",
        colorWarn : "#E7A888",
        colorTrace : "E7A8A8",
        colorSys : "Fff",
        colorCounter : "0F0",    
    }
    return API;
})();
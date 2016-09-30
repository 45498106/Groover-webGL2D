var logs = (function(){
    var logAData = "";
    var logADataS = "";
    var lastData = undefined;
    var lastLogSpan = undefined;
    var logSpanId = 0;
    var newLineLog = false;    
    var logs;
    var classNames = {
        prefix : "cMess",
        error : "Error",
        warn : "Warn",
        errorTrace : "ErrorTrace",
        sys : "Sys",
        counter : "Counter",
        logDisplay : "logDisplay",
    }
    function createStyleContent(){
        return `
        .${classNames.logDisplay} {
            position: absolute;
            top: 7px;
            right: 7px;
            bottom: 45px;
            left: 1163px;
            border-width: 37px;
            max-height: 462px;
            height: 420px;
            overflow-y: scroll;   
        }    
        .${classNames.prefix} {
            color: ${API.color};
            background: ${API.background};
            display: block;
            word-wrap: break-word;
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
        }`;
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

    }

    
    var API = {
        setElement : function(element){
            logs = element;
        },
        getElement : function(){
            return logs;
        },
        classNames : classNames,
        log : log,
        logP : logP,
        clear : logClear,
        addStyle : function(element){
            var styleE = document.createElement("style");
            styleE.innerHTML = createStyleContent();
            if(element === undefined){
                element = document.head;
            }
            element.appendChild(styleE);
        },
        start : function(){
            this.addStyle();
            logs = document.createElement("div");    
            logs.className = classNames.logDisplay;
            document.body.appendChild(logs);
            return logs;
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
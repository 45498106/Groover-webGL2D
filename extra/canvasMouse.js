
var canvasMouse = (function(){
    const U = undefined;
    const RESIZE_DEBOUNCE_TIME = 100;
    var onresize; 
    var webGL;
    var renderStack = [];
    var pause = false;
    var w,h,cw,ch,canvas,ctx,mouse,createCanvas,resizeCanvas,setGlobals,globalTime=0,resizeCount = 0; 
    createCanvas = function () {  // create 2D display canvas
        var c,cs; 
        cs = (webGL = document.createElement("canvas")).style;
        cs.position = "absolute"; 
        cs.top = cs.left = "0px"; 
        cs.zIndex = 99; 
        document.body.appendChild(webGL); 
        cs = (c = document.createElement("canvas")).style; 
        cs.position = "absolute"; 
        cs.top = cs.left = "0px"; 
        cs.zIndex = 100; 
        document.body.appendChild(c); 
        return c;
    }



    resizeCanvas = function () {
        if (canvas === undefined) { 
            canvas = createCanvas(); 
        } 
        webGL.width = canvas.width = window.innerWidth; 
        webGL.height = canvas.height = window.innerHeight; 

        //webGL.gl = webGL.getContext(API.webGLSettings.context,API.webGLSettings.options);
        webGL.gl = webGL.getContext(API.webGLSettings.context);
        ctx = canvas.getContext("2d"); 

        if (typeof setGlobals === "function") { 
            setGlobals(); 
        } 
        if (typeof API.onresize === "function"){ 

            resizeCount += 1; 
            setTimeout(debounceResize,RESIZE_DEBOUNCE_TIME);
        }
    }
    function debounceResize(){ 
        resizeCount -= 1; 
        if(resizeCount <= 0){ 
            webGL.gl.viewport(0, 0, canvas.width, canvas.height);        
            API.onresize();
        }
    }
    setGlobals = function(){ 
        cw = (w = canvas.width) / 2; 
        ch = (h = canvas.height) / 2; 
        mouse.updateBounds(); 
    }
    mouse = (function(){
        function preventDefault(e) { e.preventDefault(); }
        var mouse = {
            x : 0, y : 0, w : 0, alt : false, shift : false, ctrl : false, buttonRaw : 0, over : false, bm : [1, 2, 4, 6, 5, 3], 
            active : false,bounds : null, crashRecover : null, mouseEvents : "mousemove,mousedown,mouseup,mouseout,mouseover,mousewheel,DOMMouseScroll".split(",")
        };
        var m = mouse;
        function mouseMove(e) {
            var t = e.type;
            m.x = e.clientX - m.bounds.left; 
            m.y = e.clientY - m.bounds.top;
            m.alt = e.altKey; m.shift = e.shiftKey; m.ctrl = e.ctrlKey;
            if (t === "mousedown") { m.buttonRaw |= m.bm[e.which-1]; }  
            else if (t === "mouseup") { m.buttonRaw &= m.bm[e.which + 2]; }
            else if (t === "mouseout") { /*m.buttonRaw = 0;*/ m.over = false; }
            else if (t === "mouseover") { m.over = true; }
            else if (t === "mousewheel") { m.w = e.wheelDelta; }
            else if (t === "DOMMouseScroll") { m.w = -e.detail; }
            if (m.callbacks) { m.callbacks.forEach(c => c(e)); }
            if((m.buttonRaw & 2) && m.crashRecover !== null){ if(typeof m.crashRecover === "function"){ setTimeout(m.crashRecover,0);}}        
            e.preventDefault();
        }
        m.updateBounds = function(){
            if(m.noBounds){
                if(m.bounds === null){
                    m.bounds = {};
                }
                m.bounds.top = 0;
                m.bounds.left = 0;
            }else{
                if(m.active){
                    m.bounds = m.element.getBoundingClientRect();
                }
            }
        }
        m.addCallback = function (callback) {
            if (typeof callback === "function") {
                if (m.callbacks === U) { m.callbacks = [callback]; }
                else { m.callbacks.push(callback); }
            } else { throw new TypeError("mouse.addCallback argument must be a function"); }
        }
        m.start = function (element, blockContextMenu) {
            if (m.element !== U) { m.removeMouse(); }      
            if(element === U){
                m.element = document;
                m.noBounds = true;
            }else{
                m.element = element;
                m.noBounds = false;
            }
            m.blockContextMenu = blockContextMenu === U ? false : blockContextMenu;
            m.mouseEvents.forEach( n => { m.element.addEventListener(n, mouseMove); } );
            if (m.blockContextMenu === true) { m.element.addEventListener("contextmenu", preventDefault, false); }
            m.active = true;
            m.updateBounds();
        }
        m.remove = function () {
            if (m.element !== U) {
                m.mouseEvents.forEach(n => { m.element.removeEventListener(n, mouseMove); } );
                if (m.contextMenuBlocked === true) { m.element.removeEventListener("contextmenu", preventDefault);}
                m.element = m.callbacks = m.contextMenuBlocked = U;
                m.active = false;
            }
        }
        return mouse;
    })();

    // Clean up. Used where the IDE is on the same page.
    var done = function(){
        window.removeEventListener("resize",resizeCanvas)
        mouse.remove();
        document.body.removeChild(canvas);    
        document.body.removeChild(webGL);    
        
        webGL = canvas = ctx = mouse = U;
        log("done")
    }



    function update(timer){ // Main update loop
        if(ctx === undefined){
            return;
        }
        requestAnimationFrame(update);
        if(pause){
            return;
            
        }
        API.globalTime = timer;
        var len = renderStack.length;
        for(i = 0; i < len; i ++){
            renderStack[i]();
        }
    }
    var API = {
        onresize: null,
        globalTime : 0,
        renderStack : renderStack,
        mouse : mouse,
        canvas : null,
        ctx : null,
        webGL : null,
        webGLSettings : {
            context : "webgl",
            options : {
                alpha: true,
                depth: false,
                stencil: false,
                antialias: false,
                premultipliedAlpha: false,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat : false            
            }
        },
        create : function(){
            resizeCanvas(); 
            this.canvas = canvas;
            this.ctx = ctx;
            this.webGL = webGL;
            mouse.start(undefined,true); 
            window.addEventListener("resize",resizeCanvas); 
        },
        start : function(){
            pause = false;
            requestAnimationFrame(update);
        },
        pause : function(){
            pause = true;
        },
    };
    return API;
})();
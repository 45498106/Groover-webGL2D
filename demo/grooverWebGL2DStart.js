
var links = [
    {   name : "Grid Shader", 
        url : "GridDemo.html",
        id : "gridBlurbElement",
        pos : 1,
    },{
        name : "Performance Sprite Shader",
        url : "SpriteDemo.html",
        id : "spriteBlurbElement",
        pos : 2,
    },{
        name : "Tile shader",
        url : "TileDemo.html",        
        id : "tileBlurbElement",
        pos : 3,
    },{
        name : "FrameBuffer X1",
        url : "frameBufferDemo.html",        
        id : "frameBufferElement",
        pos : 4,
    } ,{
        name : "template",
        url : "template.html",        
        id : "templateElement",
        pos : 5,
    }    
    
]

function mouseOver(event){
    links.sort((a,b)=>a.name === this.textContent?0:1);
     links.forEach((s,i)=>{
         if(s.name === this.textContent){
             s.blurb.className = "blurb pos1";
         }else{
             s.blurb.className = "blurb pos" + (i + 1);
         }
     });
    
}
function setStyle(event){
    location.href = this.dataStyle.url;
    
    
}
function createUI(){
    var uiC = document.getElementById("uiContainer");

    links.forEach(s=>{
        var span = document.createElement("span");
        span.textContent = s.name;
        span.dataStyle = s;
        span.className = "btn overFX Light";
        span.addEventListener("click",setStyle);
        span.addEventListener("mouseover",mouseOver);
        uiC.appendChild(span);
        s.element = span;
        s.blurb = document.getElementById(s.id);
        
    });
    var git = document.getElementById("githubElementID");
    git.style.top = 500 * (links.length+3)+"px";
    
    
}

window.addEventListener("load",function(){
    createUI();
});
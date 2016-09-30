function Chaser(value,accel,drag){
    this.value = value;
    this.real = value;
    this.chase = 0;
    this.accel = accel;
    this.drag = drag;
}
Chaser.prototype = {
    update : function(){
        if(this.accel === 1){
            this.chase = 0;
            this.real = this.value;            
        }else{
            this.chase += (this.value-this.real) * this.accel;
            this.chase *= this.drag;
            this.real += this.chase;
        }
    },
    snap : function(value){
        this.chase = 0;
        this.value = value !== undefined ? value : this.value;
        this.real = this.value;
    }
}
module.exports = class Vector3 {
    constructor(X = '0.0', Y = '0.0', Z = '0.0'){
        this.x = X;
        this.y = Y;
        this.z = Z;
    }
    /*
    Magnitude(){
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (ths.z * this.z));
    }

    Normalized(){
        var mag = this.Magnitude();
        return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }

    Distance(OtherVector = Vector3){
        var direction = new Vector3();
        direction.x = OtherVector.x - this.x;
        direction.y = OtherVector.y - this.y;
        direction.z = OtherVector.z - this.z;
        return direction.Magnitude();
    }

    ConsoleOutput(){
        return '(' + this.x + ', ' + this.y + ', ' + this.z +')';
    }
    */
}
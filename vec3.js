let Vec3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vec3.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vec3.prototype.norm = function () {
    let l = this.length();
    return this.mult(1. / l);
};

Vec3.prototype.mult = function (s) {
    return new Vec3(this.x * s, this.y * s, this.z * s);
};

Vec3.prototype.cross = function (snd) {
    return new Vec3(
        this.y * snd.z - this.z * snd.y,
        this.z * snd.x - this.x * snd.z,
        this.x * snd.y - this.y * snd.x
    );
};
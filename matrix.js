var Matrix = function() {
    this.array = new Array(16);
    this.array.fill(0);
};

Matrix.identity = function() {
    var res = new Matrix();
    res.array[0] = 1;
    res.array[5] = 1;
    res.array[10] = 1;
    res.array[15] = 1;
    return res;
};

Matrix.fromArray = function(array) {
    var res = new Matrix();
    for (var  i = 0; i < 16; i++) {
        res.array[i] = array[i];
    }
    return res;
};

Matrix.prototype.mult = function(mat) {
    var res = new Matrix();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var sum = 0.;
            for (var k = 0; k < 4; k++) {
                sum += this.array[i * 4 + k] * mat.array[k * 4 + j];
            }
            res.array[i * 4 + j] = sum;
        }
    }
    return res;
};

Matrix.prototype.clone = function() {
  var res = new Matrix();
    for (var  i = 0; i < 16; i++) {
        res.array[i] = this.array[i];
    }
  return res;
};

Matrix.frustumM = function(left, right, bottom, top, near, far) {
    var res = new Matrix();
    res.array[0] = 2 * near / (right - left);
    res.array[2] = (right + left) / (right - left);
    res.array[5] = 2 * near / (top - bottom);
    res.array[6] = (top + bottom) / (top - bottom);
    res.array[10] = - (far + near) / (far - near);
    res.array[14] = - 2 * near * far / (far - near);
    res.array[11] = -1;
    return res;
};

Matrix.prototype.translate = function(translatex, translatey, translatez) {
    var result = this.clone();
    result.array[12] += result.array[0] * translatex + result.array[4] * translatey
        + result.array[8] * translatez;
    result.array[13] += result.array[1] * translatex + result.array[5] * translatey
        + result.array[9] * translatez;
    result.array[14] += result.array[2] * translatex + result.array[6] * translatey
        + result.array[10] * translatez;
    result.array[15] += result.array[3] * translatex + result.array[7] * translatey
        + result.array[11] * translatez;
    return result;
};

Matrix.lookAt = function(eye3, look3, up3) {
    var f = new Vec3(look3.x - eye3.x, look3.y - eye3.y, look3.z - eye3.z);
    f = f.norm();

    var s = f.cross(up3);
    s = s.norm();

    if (s.x === 0 && s.y === 0 && s.z === 0)
        return;

    var u = s.cross(f);

    var result = new Matrix();
    result.array[0] = s.x;
    result.array[1] = u.x;
    result.array[2] = -f.x;
    result.array[3] = 0.;

    result.array[4] = s.y;
    result.array[5] = u.y;
    result.array[6] = -f.y;
    result.array[7] = 0.;

    result.array[8] = s.z;
    result.array[9] = u.z;
    result.array[10] = -f.z;
    result.array[11] = 0.;

    result.array[12] = 0.;
    result.array[13] = 0.;
    result.array[14] = 0.;
    result.array[15] = 1.;

    return result.translate(-eye3.x, -eye3.y, -eye3.z);
};


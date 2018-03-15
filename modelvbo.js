let vs = "uniform mat4 u_MVPMatrix;\n" +
    "uniform mat4 u_MVMatrix;\n" +
    "attribute vec4 a_Position;\n" +
    "attribute vec3 a_Normal;\n" +
    "varying vec3 v_Position;\n" +
    "varying vec3 v_Normal;\n" +
    "void main(){\n" +
    "    v_Position = vec3(u_MVMatrix * a_Position);\n" +
    "    v_Normal = normalize(vec3(u_MVMatrix * vec4(a_Normal, 0.0)));\n" +
    "    gl_Position = u_MVPMatrix * a_Position;\n" +
    "}";

let fs = "precision mediump float;\n" +
    "uniform vec3 u_LightPos;\n" +
    "uniform float u_distance_coef;\n" +
    "uniform float u_light_coef;\n" +
    "uniform vec4 u_Color;\n" +
    "varying vec3 v_Position;\n" +
    "varying vec3 v_Normal;\n" +
    "void main(){\n" +
    "    vec3 tmp = u_LightPos - v_Position;\n" +
    "    float distance = length(tmp);\n" +
    "    vec3 lightVector = normalize(tmp);\n" +
    "    float diffuse = max(dot(v_Normal, lightVector), 0.0) * u_light_coef;\n" +
    "    diffuse = diffuse * (1.0 / (1.0 + u_distance_coef * distance * distance));\n" +
    "    gl_FragColor = u_Color * diffuse;\n" +
    "}";

let createShader = function (gl, str, type) {
    let shader = gl.createShader(type);

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.isShader(shader)) {
        alert("Can't compile shader");
    }
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

let ModelVBO = function (gl, objFileName, color) {
    this.isReady = false;
    this.context = gl;
    this.color = new Float32Array(color);
    this.init();
    this.bind();
    this.openObj(objFileName);
};

ModelVBO.prototype.init = function () {
    this.program = this.context.createProgram();
    this.context.attachShader(this.program, createShader(this.context, vs, this.context.VERTEX_SHADER));
    this.context.attachShader(this.program, createShader(this.context, fs, this.context.FRAGMENT_SHADER));
    this.context.linkProgram(this.program);
};

ModelVBO.prototype.bind = function () {
    this.mMVPMatrixHandle = this.context.getUniformLocation(this.program, "u_MVPMatrix");
    this.mMVMatrixHandle = this.context.getUniformLocation(this.program, "u_MVMatrix");
    this.mPositionHandle = this.context.getAttribLocation(this.program, "a_Position");
    this.mColorHandle = this.context.getUniformLocation(this.program, "u_Color");
    this.mLightPosHandle = this.context.getUniformLocation(this.program, "u_LightPos");
    this.mDistanceCoefHandle = this.context.getUniformLocation(this.program, "u_distance_coef");
    this.mLightCoefHandle = this.context.getUniformLocation(this.program, "u_light_coef");
    this.mNormalHandle = this.context.getAttribLocation(this.program, "a_Normal");
};

ModelVBO.prototype.openObj = function (objFileName) {
    let xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    let that = this;
    xhr.addEventListener("load", function (ev) {
        that.makeMesh(xhr.responseText);
        that.isReady = true;
    });
    xhr.open("POST", objFileName);
    xhr.send();
};

ModelVBO.prototype.makeMesh = function (objFileText) {
    let packedData = this.parseObj(objFileText);
    this.bindBuffer(packedData);
};

ModelVBO.prototype.bindBuffer = function (packedData) {
    this.buffer = this.context.createBuffer();
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(packedData), this.context.STATIC_DRAW);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, null);
};

ModelVBO.prototype.parseObj = function (objFileText) {
    this.nbVertex = 0;

    let lines = objFileText.split("\n");

    let vertexArray = [];
    let normalArray = [];
    let vertexDrawOrder = [];
    let normalDrawOrder = [];
    lines.forEach(function (line) {
        let splLine = line.split(" ");
        if (splLine[0] === "vn") {
            normalArray.push(parseFloat(splLine[1]));
            normalArray.push(parseFloat(splLine[2]));
            normalArray.push(parseFloat(splLine[3]));
        } else if (splLine[0] === "v") {
            vertexArray.push(parseFloat(splLine[1]));
            vertexArray.push(parseFloat(splLine[2]));
            vertexArray.push(parseFloat(splLine[3]));
        } else if (splLine[0] === "f") {
            let v1 = splLine[1].split("/");
            let v2 = splLine[2].split("/");
            let v3 = splLine[3].split("/");

            vertexDrawOrder.push(parseInt(v1[0]));
            vertexDrawOrder.push(parseInt(v2[0]));
            vertexDrawOrder.push(parseInt(v3[0]));

            normalDrawOrder.push(parseInt(v1[2]));
            normalDrawOrder.push(parseInt(v2[2]));
            normalDrawOrder.push(parseInt(v3[2]));
        }
    });

    let packedData = [];
    for (let i = 0; i < vertexDrawOrder.length; i++) {
        packedData.push(vertexArray[(vertexDrawOrder[i] - 1) * 3]);
        packedData.push(vertexArray[(vertexDrawOrder[i] - 1) * 3 + 1]);
        packedData.push(vertexArray[(vertexDrawOrder[i] - 1) * 3 + 2]);

        packedData.push(normalArray[(normalDrawOrder[i] - 1) * 3]);
        packedData.push(normalArray[(normalDrawOrder[i] - 1) * 3 + 1]);
        packedData.push(normalArray[(normalDrawOrder[i] - 1) * 3 + 2]);

        this.nbVertex++;
    }
    return packedData;
};

ModelVBO.prototype.draw = function (mvpMatrix, mvMatrix, lightPosInEyeSpace) {
    if (!this.isReady) {
        return;
    }
    this.context.useProgram(this.program);

    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffer);
    this.context.enableVertexAttribArray(this.mPositionHandle);
    this.context.vertexAttribPointer(this.mPositionHandle, 3, this.context.FLOAT, false, (3 + 3) * 4, 0);

    this.context.enableVertexAttribArray(this.mNormalHandle);
    this.context.vertexAttribPointer(this.mNormalHandle, 3, this.context.FLOAT, false, (3 + 3) * 4, 3 * 4);

    this.context.bindBuffer(this.context.ARRAY_BUFFER, null);

    mvMatrix = new Float32Array(mvMatrix);
    mvpMatrix = new Float32Array(mvpMatrix);
    lightPosInEyeSpace = new Float32Array(lightPosInEyeSpace);
    this.context.uniformMatrix4fv(this.mMVPMatrixHandle, false, mvpMatrix);
    this.context.uniformMatrix4fv(this.mMVMatrixHandle, false, mvMatrix);
    this.context.uniform3fv(this.mLightPosHandle, lightPosInEyeSpace);
    this.context.uniform4fv(this.mColorHandle, this.color);
    this.context.uniform1f(this.mDistanceCoefHandle, 0.0);
    this.context.uniform1f(this.mLightCoefHandle, 1.0);

    this.context.drawArrays(this.context.TRIANGLES, 0, this.nbVertex);

    this.context.disableVertexAttribArray(this.mPositionHandle);
    this.context.disableVertexAttribArray(this.mNormalHandle);
};
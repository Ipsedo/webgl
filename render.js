let mContext;
let modelVBO;

let objFileName = "res/monkey.obj";

let mvMatrix =
    [-1, 0, -0, 0,
        0, 1, -0, 0,
        0, 0, -1, 0,
        0, 0, -11, 1];
/*[-1.0,0.0,-0.0,0.0,
0.0,1.0,-0.0,0.0,
0.0,0.0,-1.0,0.0,
0.0,0.0,-31.0,1.0];*/

let mvpMatrix =
    [-1, 0, 0, 0,
        0, 1.33333, 0, 0,
        0, 0, 1.04082, 1,
        0, 0, 9.40816, 11];
/*[-1.0,0.0,0.0,0.0,
0.0,1.33333,0.0,0.0,
0.0,0.0,1.04082,1.0,
0.0,0.0,30.2245,31.0];*/

/*var viewM = [-1,0,-0,0,0,1,-0,0,0,-0,-1,0,-0,-0,-1,1];
var projM = [1,0,0,0,0,1.33333,0,0,0,0,-1.04082,-1,0,0,-2.04082,0];
var modM = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,30,1];
var mvMatrix = Matrix.fromArray(viewM).mult(Matrix.fromArray(modM));
var mvpMatrix = Matrix.fromArray(projM).mult(mvMatrix);
console.log(mvMatrix);*/
//var mvpMatrix;
//var mvMatrix;
let canvas;

function webGLStart() {
    initGL();
    initScene();

    mContext.enable(mContext.DEPTH_TEST);
    mContext.enable(mContext.CULL_FACE);
    mContext.depthFunc(mContext.LEQUAL);
    mContext.depthMask(true);
    mContext.clearColor(1.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(draw);
}

function initGL() {
    canvas = document.getElementById("main");
    try {
        mContext = canvas.getContext('webgl');
        /*mContext.viewport(canvas.offsetLeft, canvas.offsetTop, canvas.offsetWidth, canvas.offsetHeight);
        console.log("yo");*/
    } catch (e) {

    }
    if (!mContext) {
        alert("Impossible de lancer weblgl !");
    }
}


function initScene() {
    /*var pMatrix = Matrix.frustumM(-1., 1., -canvas.offsetWidth / canvas.offsetHeight, canvas.offsetWidth / canvas.offsetHeight, 1., 50.);
    var vMatrix = Matrix.lookAt(new Vec3(0.,0.,-1.), new Vec3(0.,0.,1.), new Vec3(0.,1.,0.));
    var mMatrix = Matrix.identity().translate(0., 0., 30.);
    mvMatrix = vMatrix.mult(mMatrix);
    mvpMatrix = pMatrix.mult(mvMatrix);*/
    modelVBO = new ModelVBO(mContext, objFileName, [0., 0.5, 0., 1.]);
}

function draw() {
    mContext.clear(mContext.COLOR_BUFFER_BIT | mContext.DEPTH_BUFFER_BIT);
    modelVBO.draw(mvpMatrix, mvMatrix, [0.0, 10.0, 11.0]);
    requestAnimationFrame(draw);
}

window.addEventListener("load", webGLStart);
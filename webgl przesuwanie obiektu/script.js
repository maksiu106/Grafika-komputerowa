const vertexShaderTxt = `
precision mediump float;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

attribute vec3 vertPosition;
attribute vec2 textureCoord;
attribute vec3 vertNormal;

varying vec2 fragTextureCoord;
varying vec3 fragNormal;

void main() {
    fragTextureCoord = textureCoord;
    fragNormal = (mWorld * vec4(vertNormal, 0.0)).xyz;    
    
    gl_Position = mProjection * mView * mWorld * vec4(vertPosition, 1.0);
}
`
const fragmentShaderTxt = `
precision mediump float;

varying vec2 fragTextureCoord;
varying vec3 fragNormal;

uniform vec3 ambientLight;
uniform vec3 lightDirection;
uniform vec3 lightColor;

uniform sampler2D sampler;

void main() {
	vec3 normLightDirection	= normalize(lightDirection);
	vec3 normfragNormal	= normalize(fragNormal);
	
	vec3 light = ambientLight + lightColor * max(dot(normfragNormal, normLightDirection), 0.0);
	
	vec4 tex = texture2D(sampler, fragTextureCoord);
	
    gl_FragColor = vec4(tex.rgb * light, tex.a);
}
`

const mat4 = glMatrix.mat4;

function startDraw() {
    OBJ.downloadMeshes({
        'sphere': 'sphere.obj'
        }, Triangle);
}

let rotationSpeed = 23;
let rotationDirection = 1;

let translationX = 0;
let translationY = 0;

window.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowUp':
            translationY += 1;
            break;
        case 'ArrowDown':
            translationY -= 1;
            break;
        case 'ArrowLeft':
            translationX += 1;
            break;
        case 'ArrowRight':
            translationX -= 1;
            break;
    }
});


const Triangle = function (meshes) {
    const canvas = document.getElementById('main-canvas');
    const gl = canvas.getContext('webgl');
    let canvasColor = [0.2, 0.7, 0.5];

    checkGl(gl);

    gl.clearColor(...canvasColor, 1.0);  // R,G,B, A 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderTxt);
    gl.shaderSource(fragmentShader, fragmentShaderTxt);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    OBJ.initMeshBuffers(gl, meshes.sphere);

    // const boxVertBuffer = gl.createBuffer();
    // console.log(meshes.sphere);
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.sphere.vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, meshes.sphere.vertices, gl.STATIC_DRAW);

    // const boxIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes.sphere.indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshes.sphere.indices, gl.STATIC_DRAW);
    
    const posAttrLoc = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        posAttrLoc,
        meshes.sphere.vertexBuffer.itemSize,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );
    
    gl.enableVertexAttribArray(posAttrLoc);
    
    // const boxTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.sphere.textureBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, meshes.sphere.textures, gl.STATIC_DRAW);

    const textureAttrLoc = gl.getAttribLocation(program, 'textureCoord');
    gl.vertexAttribPointer(
        textureAttrLoc,
        meshes.sphere.textureBuffer.itemSize,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );

    gl.enableVertexAttribArray(textureAttrLoc);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, meshes.sphere.normalBuffer, gl.STATIC_DRAW);
    const normalAttrLoc = gl.getAttribLocation(program, 'vertNormal');
    gl.vertexAttribPointer(
        normalAttrLoc,
        meshes.sphere.normalBuffer.itemSize,
        gl.FLOAT,
        gl.TRUE,
        0,
        0
    );
    
    gl.enableVertexAttribArray(normalAttrLoc);
    

    const img = document.getElementById('img');
    const boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
        gl.TEXTURE_2D, 
        0,      // level of deatil
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    // render time

    gl.useProgram(program);

    const worldMatLoc = gl.getUniformLocation(program, 'mWorld');
    const viewMatLoc = gl.getUniformLocation(program, 'mView');
    const projMatLoc = gl.getUniformLocation(program, 'mProjection');

    const worldMatrix  = mat4.create();
    const worldMatrix2  = mat4.create();
    const viewMatrix  = mat4.create();
    mat4.lookAt(viewMatrix, [0,0,-8], [0,0,0], [0,1,0]); // vectors are: position of the camera, which way they are looking, which way is up
    const projectionMatrix  = mat4.create();
    mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(90), 
                canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(worldMatLoc, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewMatLoc, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projMatLoc, gl.FALSE, projectionMatrix);
    
    let ambientUniformLoc = gl.getUniformLocation(program, 'ambientLight');
    let lightDirUniformLoc = gl.getUniformLocation(program, 'lightDirection');  
    let lightColorUniformLoc = gl.getUniformLocation(program, 'lightColor');
    
    let ambient_light = [0.5, 0.5, 0.5];
    let light_dir = [10,2,-2];
    let light_color = [0.4, 0.9, 0.2];
    gl.uniform3f(ambientUniformLoc, ... ambient_light);
    gl.uniform3f(lightDirUniformLoc, ... light_dir);
    gl.uniform3f(lightColorUniformLoc, ... light_color);    

    const identityMat = mat4.create();
    // const rotationMatrix = mat4.create();
    // const translationMatrix = mat4.create();
    
    const loop  = function () { 	
        angle = performance.now() / 1000 / 60 * 23 * Math.PI;
        mat4.rotate(worldMatrix, identityMat, angle, [0,1,-0.5]);
		
	mat4.translate(viewMatrix, viewMatrix, [translationX, translationY, 0]);

        gl.uniformMatrix4fv(worldMatLoc, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(viewMatLoc, gl.FALSE, viewMatrix);
        
        translationX = 0;
        translationY = 0;
        
        gl.clearColor(...canvasColor, 1.0);  // R,G,B, A 
        gl.clear(gl.COLOR_BUFFER_BIT);
        // gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0);   

        gl.drawElements(gl.TRIANGLES, meshes.sphere.indexBuffer.numItems, 
                gl.UNSIGNED_SHORT, 0);
        
        // mat4.fromRotation(rotationMatrix, angle/2, [1,2,0]);
        // mat4.fromTranslation(translationMatrix, [2,0,0]);
        // mat4.mul(worldMatrix2, translationMatrix, rotationMatrix);
        // gl.uniformMatrix4fv(worldMatLoc, gl.FALSE, worldMatrix2);
        // gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}



function checkGl(gl) {
    if (!gl) {console.log('WebGL not supported, use another browser');}
}

function checkShaderCompile(gl, shader) {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('shader not compiled', gl.getShaderInfoLog(shader));
    }
}

function checkLink(gl, program) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
    }
}

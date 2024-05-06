document.addEventListener("DOMContentLoaded", function() {
	var canvas = document.getElementById('cvs');
	var gl = canvas.getContext('experimental-webgl');

	// Shader wierzchołków
	const vertexCode = `
		attribute vec3 vertexPosition;
		void main(void) {
			gl_Position = vec4(vertexPosition, 1.0);
		}
	`;
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexCode);
	gl.compileShader(vertexShader);

	// Shader fragmentów
	const fragmentCode = `
		void main(void) {
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		}
	`;
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentCode);
	gl.compileShader(fragmentShader);

	// Łączenie shaderów
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	// Definicja wierzchołków sześciokąta
	const vertices = [
		0.0, 0.0, 0.0, // Środek sześciokąta
		1.0, 0.0, 0.0,
		Math.cos(Math.PI / 3), Math.sin(Math.PI / 3), 0.0,
		Math.cos(Math.PI / 3 * 2), Math.sin(Math.PI / 3 * 2), 0.0,
		Math.cos(Math.PI / 3 * 3), Math.sin(Math.PI / 3 * 3), 0.0,
		Math.cos(Math.PI / 3 * 4), Math.sin(Math.PI / 3 * 4), 0.0,
		Math.cos(Math.PI / 3 * 5), Math.sin(Math.PI / 3 * 5), 0.0,
		1.0, 0.0, 0.0,
	];
	const vertexData = new Float32Array(vertices);

	// Tworzenie bufora i wypełnianie go danymi
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

	// Ustawianie atrybutów wierzchołków
	const vertexPosition = gl.getAttribLocation(program, "vertexPosition");
	gl.enableVertexAttribArray(vertexPosition);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);

	// Rysowanie kwadratu
	gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 3);
});

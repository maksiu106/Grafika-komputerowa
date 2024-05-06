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
		precision mediump float;
		uniform vec4 u_color;
		void main(void) {
			gl_FragColor = u_color;
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

	// Definicja wierzchołków trójkąta
	const vertices = [
		0, 1, 0,   // Górny wierzchołek
		-1, -0.5, 0,       // Lewy dolny wierzchołek
		1, -0.5, 0        // Prawy dolny wierzchołek
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
	
	// Ustawienie lokalizacji koloru
	const colorLocation = gl.getUniformLocation(program, "u_color");

	// Rysowanie trójkąta
    function drawTriangle() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    }
    drawTriangle();

    // Obsługa kliknięcia przycisku
    var button = document.getElementById('guzik');
    button.addEventListener('click', function() {
		// Generowanie losowego koloru
		var newColor = [Math.random(), Math.random(), Math.random(), 1.0];
		// Aktualizacja koloru trójkąta
		gl.uniform4fv(colorLocation, newColor);
		// Ponowne rysowanie trójkąta
		drawTriangle();
	});
});

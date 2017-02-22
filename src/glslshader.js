var GLSLShader = function (glContext, VS, FS, isFromElement) {
	this.gl = glContext;
	var vertexShader = null;
	var fragementShader = null;
	isFromElement = isFromElement || true;
	if (isFromElement == true) {
		vertexShader = this.getShaderFromElement(VS);
		fragementShader = this.getShaderFromElement(FS);
	} else {
		vertexShader = this.getShaderFromString(VS, 'v');
		fragementShader = this.getShaderFromString(FS, 'f');
	}
	this._programId = this.gl.createProgram();
	this.gl.attachShader(this._programId, vertexShader);
	this.gl.attachShader(this._programId, fragementShader);
	this.gl.linkProgram(this._programId);

	if (!this.gl.getProgramParameter(this._programId, this.gl.LINK_STATUS)) {
		alert("Linking shader failed : "+this.gl.getProgramInfoLog(this._programId));
	}
};

GLSLShader.prototype.getShaderFromString = function (source, type) {
	if (type == "f") {
		shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	} else if (type == "v") {
		shader = this.gl.createShader(this.gl.VERTEX_SHADER);
	} else {
		return null;
	}

	this.gl.shaderSource(shader, source);

	this.gl.compileShader(shader);

	if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
		//alert("An error occurred compiling the " + (type == "x-shader/x-fragment" ? "fragment" : //"vertex") + " shader: " + this.gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}
GLSLShader.prototype.freeFromMemory = function () {
	this.gl.deleteProgram(this._programId);
}
GLSLShader.prototype.getShaderFromElement = function (id) {
	var shaderScript,
	theSource,
	currentChild,
	shader;

	shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	theSource = "";
	currentChild = shaderScript.firstChild;
	while (currentChild) {
		if (currentChild.nodeType == currentChild.TEXT_NODE) {
			theSource += currentChild.textContent;
			//alert(theSource);
			break;
		}
	}
	var type = shaderScript.type;
	if (type == "x-shader/x-fragment") {
		shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	} else if (type == "x-shader/x-vertex") {
		shader = this.gl.createShader(this.gl.VERTEX_SHADER);
	} else {
		return null;
	}

	currentChild = currentChild.nextSibling;
	this.gl.shaderSource(shader, theSource);

	this.gl.compileShader(shader);

	if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
		return null;
	}

	return shader;
};

GLSLShader.prototype.sendUniformMatrix = function (name, mat) {
	var uniformLocation = this.gl.getUniformLocation(this._programId, name);
	if (uniformLocation == -1){
		alert("Uniform '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.uniformMatrix4fv(uniformLocation, false, new Float32Array(mat.flatten()));
};

GLSLShader.prototype.sendUniformSampler = function (name, samplerId) {
	var uniformLocation = this.gl.getUniformLocation(this._programId, name);
	if (uniformLocation == -1){
		alert("Uniform '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.uniform1i(uniformLocation, samplerId);
};

GLSLShader.prototype.sendUniformFloat = function (name, value) {
	var uniformLocation = this.gl.getUniformLocation(this._programId, name);
	if (uniformLocation == -1){
		alert("Uniform '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.uniform1f(uniformLocation, value);
};

GLSLShader.prototype.sendUniformVec2 = function (name, vec) {
	var uniformLocation = this.gl.getUniformLocation(this._programId, name);
	if (uniformLocation == -1){
		alert("Uniform '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.uniform2fv(uniformLocation, new Float32Array(vec));
};

GLSLShader.prototype.sendUniformVec3 = function (name, vec) {
	var uniformLocation = this.gl.getUniformLocation(this._programId, name);
	if (uniformLocation == -1){
		alert("Uniform '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.uniform3fv(uniformLocation, new Float32Array(vec));
};

GLSLShader.prototype.sendUniformVec4 = function (name, vec) {
	var uniformLocation = this.gl.getUniformLocation(this._programId, name);
	if (uniformLocation == -1){
		alert("Uniform '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.uniform4fv(uniformLocation, new Float32Array(vec));
};

GLSLShader.prototype.sendAttribVec2 = function (name, value) {
	var attribLocation = this.gl.getAttribLocation(this._programId, name);
	if (attribLocation == -1){
		alert("Attribute '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.vertexAttribPointer(attribLocation, 2, this.gl.FLOAT, false, 0, 0);
};

GLSLShader.prototype.sendAttribVec3 = function (name, value) {
	var attribLocation = this.gl.getAttribLocation(this._programId, name);
	if (attribLocation == -1){
		alert("Attribute '" + name + "' doesn't exist or isn't used. Are you sure you spelled the //name properly?");
	}
	this.gl.vertexAttribPointer(attribLocation, 3, this.gl.FLOAT, false, 0, 0);
};

GLSLShader.prototype.enableAttribPtr = function () {
	for (var i = 0; i < arguments.length; i++) {
		var attribLocation = this.gl.getAttribLocation(this._programId, arguments[i]);
		if (attribLocation == -1){
			alert("Attribute '" + arguments[i] + "' doesn't exist or isn't used. Are you sure you //spelled the name properly?");
		}
		this.gl.enableVertexAttribArray(attribLocation);
	}
};

GLSLShader.prototype.disableAttribPtr = function () {
	for (var i = 0; i < arguments.length; i++) {
		var attribLocation = this.gl.getAttribLocation(this._programId, arguments[i]);
		if (attribLocation == -1){
			alert("Attribute '" + arguments[i] + "' doesn't exist or isn't used. Are you sure you //spelled the name properly?");
		}
		this.gl.disableVertexAttribArray(attribLocation);
	}
};

GLSLShader.prototype.use = function () {
	this.gl.useProgram(this._programId);
};

GLSLShader.prototype.unuse = function () {
	this.gl.useProgram(undefined);
};

var WebGL2DApp = function(canvasId, canvasWidth, canvasHeight)
{
	this._canvasWidth = canvasWidth;
	this._canvasHeight = canvasHeight;
	this._projectionMatrix = makeOrtho(0, canvasWidth, canvasHeight, 0, 1, -1);
	this.setupWebGL(canvasId);
};

WebGL2DApp.prototype.setupWebGL = function(canvasId)
{
	this._canvas = document.getElementById(canvasId);
	try{
		this.gl = this._canvas.getContext("webgl") || this._canvas.getContext("experimental-webgl");
	}catch(e){
	}
	
	if (this.gl){
		this.gl.clearColor(0., 0., 0., 1.);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
	}else{
		alert("webGL isn't supported :/");
	}
};

WebGL2DApp.prototype.getContext = function()
{
	return this.gl;
}

WebGL2DApp.prototype.clearDisplay = function()
{
	this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT);
};

WebGL2DApp.prototype.renderTextures = function(shader /*, ...textures*/)
{
	mainTexture = arguments[1];

	shader.sendUniformMatrix("uProjectionMatrix", this._projectionMatrix);
	shader.sendUniformMatrix("uModelViewMatrix", mainTexture._modelViewMatrix);
	
	for (var i = 0; i < arguments.length-1; i++){
		this.gl.activeTexture(this.gl.TEXTURE0 + i);
		this.gl.bindTexture(this.gl.TEXTURE_2D, arguments[i+1]._textureId);
		shader.sendUniformSampler("uSampler"+String(i), i);
	}
	
	shader.enableAttribPtr("VertexPosition", "TexcoordPosition");
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mainTexture._vboId);
	shader.sendAttribVec3("VertexPosition");
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mainTexture._tboId);
	shader.sendAttribVec2("TexcoordPosition");
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mainTexture._iboId);
	this.gl.drawElements(this.gl.TRIANGLE_STRIP, 4, this.gl.UNSIGNED_SHORT, 0);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	
	shader.disableAttribPtr("VertexPosition", "TexcoordPosition");
	
	for (var i = 0; i < arguments.length-1; i++){
		this.gl.activeTexture(this.gl.TEXTURE0 + i);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		shader.sendUniformSampler(i);
	}
};

WebGL2DApp.prototype.renderTexturesToFrameBufferObject = function(shader /*, ...textures*/)
{
	var projectionMatrix = this._projectionMatrix.dup();
	
	var TCToNDCMatrix = $M([
	[1, 0, 0, 0.0],
	[0, 1, 0, 0.0],
	[0, 0, 1, 0.0],
	[0, 0, 0, 1.0]
	]).multiply(Matrix.Diagonal([1, -1, 1, 1]));
	this._projectionMatrix = TCToNDCMatrix.multiply(this._projectionMatrix);
	this.renderTextures.apply(this, Array.slice(arguments));
	//[0.5, -0.5] [1, 0]
	this._projectionMatrix = projectionMatrix.dup();
}

WebGL2DApp.prototype.setCanvasAsRenderTarget = function()
{
	this.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
};

WebGL2DApp.prototype.setCanvasSize = function(width, height)
{
	this._canvasWidth = width;
	this._canvasHeight = height;
	this._canvas.width = width;
	this._canvas.height = height;
		this.gl.viewport(0, 
					 0, 
					 this._canvas.width, 
					 this._canvas.height);
	this._projectionMatrix = makeOrtho(0, width, height, 0, 1, -1);
};

WebGL2DApp.prototype.setViewport = function(rect)
{
	this.gl.viewport((rect.x)*this._canvas.width, 
					 (1-rect.y-rect.h)*this._canvas.height, 
					 (rect.w)*this._canvas.width, 
					 (rect.h)*this._canvas.height);
}

var Rect = function(x, y, w, h)
{
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}
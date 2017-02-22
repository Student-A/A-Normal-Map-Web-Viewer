var GLTexture = function (glContext, img, w, h) 
{
	this._width = w || img.naturalWidth;
	this._height = h || img.naturalHeight;

	if (this._width & (this._width - 1) != 0) {
		console.log("Warning: texture width is not a power of 2");
	}
	if (this._height & (this._height - 1) != 0) {
		console.log("Warning: texture height is not a power of 2");
	}

	this._origin = {x: 0, y: 0};
	this._position = {x: 0, y: 0};
	this._angle = 0;
	
	this.gl = glContext;
	this._textureId = this.initTexture(img);
	this._vboId = this.initVBO();
	this._iboId = this.initIBO();
	this._tboId = this.initTBO();

	this._modelViewMatrix = Matrix.I(4);
};

GLTexture.prototype.setOrigin = function(x, y)
{
	if (x == 'center')
		this._origin.x = this._width/2;
	else if (x == 'left')
		this._origin.x = 0;
	else if (x == 'right')
		this._origin.x = this._width;
	else
		this._origin.x = x;
	
	if (y == 'center')
		this._origin.y = this._height/2;
	else if (y == 'top')
		this._origin.y = 0;
	else if (y == 'bottom')
		this._origin.y = this._height;
	else
		this._origin.y = y;
	
	this.updateVBO();
}

GLTexture.prototype.scaleTo = function (width, height, absolute) 
{
	var scaleX = width / this._width;
	var scaleY = height / this._height;
	this.scale(scaleX, scaleY, absolute);
}

GLTexture.prototype.moveTo = function (x, y) 
{
	this.translate(x - this._position.x, y - this._position.y);
}

GLTexture.prototype.rotateTo = function (angle, absolute) 
{
	this.translate(angle - this._angle , absolute);
}

GLTexture.prototype.translate = function (x, y)
{
	this._position.x += x;
	this._position.y += y;
	var translateMatrix = $M([
	[1, 0, 0, x],
	[0, 1, 0, y],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
	]);
	this._modelViewMatrix = translateMatrix.multiply(this._modelViewMatrix);
}

GLTexture.prototype.scale = function(x, y, absolute)
{
	absolute = absolute || false;
	var oldPosition = {x: this._position.x, y: this._position.y};
	if (!absolute)
		this.translate(-this._position.x, -this._position.y );
	
	var scaleMatrix = Matrix.Diagonal([x, x, 1., 1.]);
	this._modelViewMatrix = scaleMatrix.multiply(this._modelViewMatrix);
	
	if (!absolute){
		this.translate(oldPosition.x, oldPosition.y);
	}
}

GLTexture.prototype.rotate = function(angle, absolute)
{
	absolute = absolute || false;
	var oldPosition = {x: this._position.x, y: this._position.y};
	this._angle += angle;
	angle = toRadians(angle);
	if (!absolute)
		this.translate(-this._position.x, -this._position.y);
	var rotationMatrix = $M([
	[Math.cos(angle), -Math.sin(angle), 0, 0],
	[Math.sin(angle), Math.cos(angle), 0, 0],
	[0, 0, 1, 0],
	[0, 0, 0, 1]
	]);
	this._modelViewMatrix = rotationMatrix.multiply(this._modelViewMatrix);
	if (!absolute){
		this.translate(oldPosition.x, oldPosition.y);
	}
}

GLTexture.prototype.reclipTextureByRect = function (rect)
{
    var vertices = [
		this._width*rect.w - this._origin.x, -this._origin.y, 0.0,
		-this._origin.x, -this._origin.y, 0.0,
		this._width*rect.w - this._origin.x, this._height*rect.h - this._origin.y, 0.0,
		-this._origin.x, this._height*rect.h - this._origin.y, 0.0
	];
	var texcoords = [
		rect.x + rect.w, rect.y,
		rect.x, rect.y,
		rect.x + rect.w, rect.y + rect.h,
		rect.x, rect.h + rect.y
	];
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vboId);
	this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._tboId);
	this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(texcoords));
}

GLTexture.prototype.resetDimensions = function(w, h)
{
	this._width = w;
	this._height = h;
	this.resetVBO();
}

GLTexture.prototype.updateVBO = function()
{
	var vertices = [
		this._width-this._origin.x, -this._origin.y, 0,
		-this._origin.x, -this._origin.y, 0,
		this._width-this._origin.x, this._height-this._origin.y, 0,
		-this._origin.x, this._height-this._origin.y, 0
	];
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._vboId);
	this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
}

GLTexture.prototype.resetTransformation = function () 
{
	this._modelViewMatrix = Matrix.I(4);
	this._position.x = 0;
	this._position.y = 0;
	this._angle = 0;
}

GLTexture.prototype.initTexture = function (img) 
{
	var textureId = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, textureId);
	if (img == null){
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this._width, this._height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	}else
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	return textureId;
}

GLTexture.prototype.updateTextureContent = function (newimg)
{
	this.gl.bindTexture(this.gl.TEXTURE_2D, this._textureId);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, newimg);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

GLTexture.prototype.initVBO = function () 
{
	var vertices = [
		this._width-this._origin.x, -this._origin.y, 0.0,
		-this._origin.x, -this._origin.y, 0.0,
		this._width-this._origin.x, this._height-this._origin.y, 0.0,
		-this._origin.x, this._height-this._origin.y, 0.0
	];
	var vboId = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vboId);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, undefined);
	return vboId;
};

GLTexture.prototype.initIBO = function () 
{
	var indices = [0, 1, 2, 3];
	var iboId = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, iboId);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, undefined);
	return iboId;
};

GLTexture.prototype.initTBO = function () 
{
	var texcoords = [
		1, 0,
		0, 0,
		1, 1,
		0, 1
	];
	var tboId = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tboId);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.DYNAMIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, undefined);
	return tboId;
};

GLTexture.prototype.freeFromMemory = function () 
{
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	this.gl.deleteTexture(this._textureId);
}

var toRadians = function(degrees) 
{
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
var toDegrees = function(radians) 
{
  return radians * 180 / Math.PI;
};

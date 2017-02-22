var GLFramebufferObject = function(glContext, width, height, requireDepth)
{
	this.gl = glContext;
	this._requireDepth = requireDepth || false;
	this._width = width;
	this._height = height;
	this._fboId = this.gl.createFramebuffer();
	if (this._requireDepth)
		this._renderBufferId = this.createRenderBuffer();
};

GLFramebufferObject.prototype.setTextureAsRenderTarget = function(texture)
{
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._fboId);
	if (this._requireDepth)
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this._renderBufferId);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture._textureId, 0);
	if (this._requireDepth)
		this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this._renderBufferId);
	this.setViewport(new Rect(0, 0, 1, 1));
};

GLFramebufferObject.prototype.createRenderBuffer = function()
{
	var renderBuffer = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this._width, this._height);
	return renderBuffer;
}

GLFramebufferObject.prototype.setViewport = function(rect)
{
	this.gl.viewport((rect.x)*this._width, 
				 (1-rect.y-rect.h)*this._height, 
				 (rect.w)*this._width, 
				 (rect.h)*this._height);
}
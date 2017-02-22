
var APP = {}; //global namespace
var dt = 0;

$( document ).ready(function() {
    main();
});

function step()
{
	dt += Math.PI/60;
	while (dt > Math.PI*2) 
		dt -= Math.PI*2;
	if (APP.oscillateLightOnX)
		APP.lightPosition[0] = Math.cos(dt)*$("#xLightPosControl").val() + 512;
	if (APP.oscillateLightOnY)
		APP.lightPosition[1] = Math.sin(dt)*$("#yLightPosControl").val() + 512;
	if (APP.oscillateLightOnZ)
		APP.lightPosition[2] = Math.sin(dt)*$("#zLightPosControl").val();
	APP.app.clearDisplay();
	render_textures_normalmapped_lighted(APP.tex, APP.normalMap);
	requestAnimationFrame(step);
}

function load_images()
{
	APP.image1 = new Image();
	APP.image2 = new Image();
	APP.image1.crossOrigin='anonymous';
	APP.image2.crossOrigin='anonymous';
	APP.image1.APP = APP;
	APP.image2.APP = APP;
	APP.image1.onerror = function()
	{
		alert("Error: Not a valid diffuse image file");
	}
	APP.image1.onload = function()
	{
		this.APP.image2.onerror = function()
		{
			alert("Error: Not a valid normal map image file");
		}
		this.APP.image2.onload = function()
		{
			if (this.APP.image1.naturalWidth == this.APP.image2.naturalWidth &&
				this.APP.image1.naturalHeight == this.APP.image2.naturalHeight){
				APP.tex = new GLTexture(APP.app.getContext(), APP.image1);
				APP.normalMap = new GLTexture(APP.app.getContext(), APP.image2);
				APP.tex.setOrigin("center", "center");
				APP.tex.translate(512, 512);
				APP.normalMap.setOrigin("center", "top");
			}else{
				alert("Dimensions of the normal map and the image must be identical!");
			}
		}
		APP.image2.src = $("#normalMap").attr("value");
	};
	APP.image1.src = $("#image").attr("value");
}

function main()
{
	APP.lightPosition = [$("#xLightPosControl").val(),$("#yLightPosControl").val(),$("#zLightPosControl").val()];
	APP.lightAmbient = hex_to_rgb($("#lightAmbientPicker").val());
	APP.lightDiffuse = hex_to_rgb($("#lightDiffusePicker").val());
	APP.lightSpecular = hex_to_rgb($("#lightSpecularPicker").val());
	APP.materialShininess = parseFloat($("#materialShininessControl").val());
	APP.doSpecularCalculation= $("#doSpecularCalculationCheck").is(':checked') ? 1 : 0;
	APP.oscillateLightOnX = $("#oscillateLightOnX").is(':checked');
	APP.oscillateLightOnY = $("#oscillateLightOnY").is(':checked');
	APP.oscillateLightOnZ = $("#oscillateLightOnZ").is(':checked');
	APP.invertYAxisForNormalMap = $("#invertYAxisForNormalMap").is(':checked') ? 1 : 0;
	
	APP.app = new WebGL2DApp("gl_canvas", 1024, 1024);
	APP.lightNormalmapShader = new GLSLShader(APP.app.getContext(), "lighted-shader-vs", "lighted-normalmap-shader-fs");
	
	if (!APP.loadedImagesAtStartup){
		APP.loadedImagesAtStartup = true;
		load_images();
	}
	
	step();
}

function render_textures_lighted()
{
	APP.lightShader.use();
	
	APP.lightShader.sendUniformMatrix("uNormalMatrix", APP.testTex._modelViewMatrix.inverse().transpose());
	APP.lightShader.sendUniformFloat("uLightIntensity", 1.3);
	APP.lightShader.sendUniformFloat("uMaterialShininess", APP.materialShininess);
	APP.lightNormalmapShader.sendUniformFloat("uDoSpecularCalculation", APP.doSpecularCalculation);
	APP.lightShader.sendUniformVec3("uLightPosition", APP.lightPosition);
	APP.lightShader.sendUniformVec3("uLightAmbient", APP.lightAmbient);
	APP.lightShader.sendUniformVec3("uLightDiffuse", APP.lightDiffuse);
	APP.lightShader.sendUniformVec3("uLightSpecular", APP.lightSpecular);
	
	var args = Array.prototype.slice.call(arguments);
	args.splice(0, 0, APP.lightShader);
	APP.app.renderTextures.apply(APP.app, args);
	
	APP.lightShader.unuse();
}

function render_textures_normalmapped_lighted()
{
	if (!arguments[0])
		return;
	APP.lightNormalmapShader.use();
	
	APP.lightNormalmapShader.sendUniformMatrix("uNormalMatrix", arguments[0]._modelViewMatrix.inverse().transpose());
	APP.lightNormalmapShader.sendUniformFloat("uLightIntensity", 10);
	APP.lightNormalmapShader.sendUniformFloat("uMaterialShininess", APP.materialShininess);
	APP.lightNormalmapShader.sendUniformFloat("uDoSpecularCalculation", APP.doSpecularCalculation);
	APP.lightNormalmapShader.sendUniformFloat("uInvertYAxis", APP.invertYAxisForNormalMap);
	APP.lightNormalmapShader.sendUniformVec3("uLightPosition", APP.lightPosition);
	APP.lightNormalmapShader.sendUniformVec3("uLightAmbient", APP.lightAmbient);
	APP.lightNormalmapShader.sendUniformVec3("uLightDiffuse", APP.lightDiffuse);
	APP.lightNormalmapShader.sendUniformVec3("uLightSpecular", APP.lightSpecular);
	
	var args = Array.prototype.slice.call(arguments);
	args.splice(0, 0, APP.lightNormalmapShader);
	APP.app.renderTextures.apply(APP.app, args);
	
	APP.lightNormalmapShader.unuse();
}

function hex_to_rgb(hex)
{
	var intColor = parseInt(hex.slice(1), 16);
	var red = (intColor >> 16) & 255;
	var green = (intColor >> 8) & 255;
	var blue = intColor & 255;
	return [red/255., green/255., blue/255.];
}

function read_image(e)
{
  var fileObj = e.files[0]; 
  var reader = new FileReader();
  reader.onload = function(f){var dataurl = f.target.result; $("#image").attr("value", dataurl);}; 
  reader.onerror = function(){alert("Please provide a proper image for the diffuse image");};
  reader.readAsDataURL(fileObj); 
}

function read_normal_map(e)
{
  var fileObj = e.files[0]; 
  var reader = new FileReader();
  reader.onload = function(f){var dataurl = f.target.result; $("#normalMap").attr("value", dataurl);}; 
  reader.onerror = function(){alert("Please provide a proper image for a normal map");};
  reader.readAsDataURL(fileObj); 
}
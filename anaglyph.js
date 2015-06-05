var rightModifier = 0.55;
var leftModifier = 1.0;

/* Taken from Eric Dubois's "Least Squares How To Photoshop" */
var leftLens = [ 0.337*leftModifier, 0.349*leftModifier, 0.164*leftModifier, -0.062*leftModifier, -0.062*leftModifier, -0.024*leftModifier, -0.048*leftModifier, -0.050*leftModifier, -0.017*leftModifier ];

var rightLens = [ -0.011*rightModifier, -0.032*rightModifier, -0.007*rightModifier, -0.377*rightModifier, 0.761*rightModifier, 0.009*rightModifier, -0.026*rightModifier, -0.093*rightModifier, 1.234*rightModifier ];

function tosRGB(component) {
    if(component > 0.0031308) {
	return Math.pow((1.055*component),0.41666)-0.055;
    }
    return 12.92*component;
}

function sRGBGamma(component) {
    if(component > 0.04045){
	return Math.pow(((component+0.055)/1.055),2.2);
    }
    return component/12.92;
}

function clip(number) {
    if(number < 0) { number = 0; }
    if(number > 1) { number = 1; }
    return number;
}

function combinePixels(left, right, index, leftLensMatrix, rightLensMatrix) {
    var leftPixel = [0,0,0];
    var rightPixel = [0,0,0];
    var anaglyphPixel = [0,0,0,255];

    leftPixel[0] += ((left.data[0+index]/255.0)*leftLensMatrix[0])+((left.data[1+index]/255.0)*leftLensMatrix[1])+((left.data[2+index]/255.0)*leftLensMatrix[2]);
    leftPixel[1] += ((left.data[4+index]/255.0)*leftLensMatrix[3])+((left.data[5+index]/255.0)*leftLensMatrix[4])+((left.data[6+index]/255.0)*leftLensMatrix[5]);
    leftPixel[2] += ((left.data[8+index]/255.0)*leftLensMatrix[6])+((left.data[9+index]/255.0)*leftLensMatrix[7])+((left.data[10+index]/255.0)*leftLensMatrix[8]);
    
    rightPixel[0] += ((right.data[0+index]/255.0)*rightLensMatrix[0])+((right.data[1+index]/255.0)*rightLensMatrix[1])+((right.data[2+index]/255.0)*rightLensMatrix[2]);
    rightPixel[1] += ((right.data[4+index]/255.0)*rightLensMatrix[3])+((right.data[5+index]/255.0)*rightLensMatrix[4])+((right.data[6+index]/255.0)*rightLensMatrix[5]);
    rightPixel[2] += ((right.data[8+index]/255.0)*rightLensMatrix[6])+((right.data[9+index]/255.0)*rightLensMatrix[7])+((right.data[10+index]/255.0)*rightLensMatrix[8]);

    anaglyphPixel[0] = (tosRGB(clip(leftPixel[0])+clip(rightPixel[0]))*255)|0;
    anaglyphPixel[1] = (tosRGB(clip(leftPixel[1])+clip(rightPixel[1]))*255)|0;
    anaglyphPixel[2] = (tosRGB(clip(leftPixel[2])+clip(rightPixel[2]))*255)|0;
    
    return new Uint8ClampedArray(anaglyphPixel);
}



function toAnaglyph(width, height, leftImage, rightImage) {
    var y = 0;
    var x = 0;
    var anaglyph = new Uint8ClampedArray((width * 4) * height);
    var index = 0;
    var anaglyphPixel;

    for(y = 0; y < height; y++) {
	for(x = 0; x < width; x++) {
	    index = (y * width * 4) + (x * 4);
	    anaglyphPixel = combinePixels(leftImage, rightImage, index, rightLens, leftLens );
	    anaglyph[index+0] = anaglyphPixel[0];
	    anaglyph[index+1] = anaglyphPixel[1];
	    anaglyph[index+2] = anaglyphPixel[2];
	    anaglyph[index+3] = anaglyphPixel[3];
	}
    }

    return anaglyph;
}

function createAnaglyph(canvas, image) {
    var width = canvas.width / 2;
    var height = canvas.height;
    var context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    var leftImage = context.getImageData(0,0,width,height);
    var rightImage = context.getImageData(width,0,width,height);
    canvas.width = parseInt(canvas.width)/2;
    
    var anaglyph = toAnaglyph(width, height, leftImage, rightImage);

    // Reuse the image we've already made...
    leftImage.data.set(anaglyph);
    context.putImageData(leftImage, 0, 0);

    var newImage = new Image();
    newImage.src = canvas.toDataURL("image/png");
    newImage.width = width;
    newImage.height = height;
    return newImage;
}
      
function applyTo(image) {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    image.parentNode.replaceChild(createAnaglyph(canvas, image), image);
}

var images = document.querySelectorAll('img');
for(var i = 0; i < images.length; i++) {
	applyTo(images[i]);
}



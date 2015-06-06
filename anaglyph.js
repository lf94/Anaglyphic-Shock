function applyTo(image) {
	console.log(image);
		console.log("SENDING MESSAGE");
		chrome.runtime.sendMessage(
			{src: image.src, width: image.width, height: image.height},
			function(response) {
		            console.log(response);
			    image.src = response;
			    image.width = parseInt(image.width)/2.0;
			}
		);
}

var images = document.querySelectorAll('img');
for(var i = 0; i < images.length; i++) {
	applyTo(images[i]);
}


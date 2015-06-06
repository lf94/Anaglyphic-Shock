function getObj(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            cb(reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.send();
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.message === 'get-data-url') {
        getObj(request.url, function(dataUrl) {
            sendResponse(dataUrl);
        });
        return true;
    }
  }
);

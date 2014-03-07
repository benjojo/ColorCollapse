function imageLoaded() {
    var img = this;
    var src = img.src;
    img.removeEventListener('load', imageLoaded)
    console.info("Loaded", src, "from", img);
    try {
        collapseImage(img);
    } catch (e) {
        console.error("Dern", e.message);
        console.error(e.stack);
        chrome.runtime.sendMessage({
            imageRequestResponse: true,
            status: "failure",
            reason: e.message,
            stack: e.stack,
            src: src
        });
        return;
    }
    console.info("Bingo!", img.src);
    chrome.runtime.sendMessage({
        imageRequestResponse: true,
        status: "success",
        src: src,
        data: img.src
    });
}

function imageNotLoaded(event) {
    var img = this;
    var src = img.src;
    console.error("Failed to load", src, "from", img);
    // console.log(event);
    // debugger;
    chrome.runtime.sendMessage({
        imageRequestResponse: true,
        src: src,
        status: "failure"
        // TODO: yyy
    });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    console.log("Got request: ", request);
    if (!request.imageRequest)
        return;
    var img = document.createElement('img');
    img.addEventListener('load', imageLoaded);
    img.addEventListener('error', imageNotLoaded);
    img.src = request.src;
    img.setAttribute('data-url', request.src);
    document.body.appendChild(img);
});

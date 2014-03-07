function imageLoaded() {
    var img = this;
    var src = img.src;
    img.removeEventListener('load', imageLoaded)
    console.info("Loaded", src, "from", img);
    try {
        var data = collapseImage(img);
        console.info("Bingo!", data);
        img._port.postMessage({
            imageRequestResponse: true,
            status: "success",
            src: src,
            data: data
        });
    } catch (e) {
        console.error("Dern", e.message);
        console.error(e.stack);
        img._port.postMessage({
            imageRequestResponse: true,
            status: "failure",
            reason: e.message,
            stack: e.stack,
            src: src
        });
        return;
    }
}

function imageNotLoaded(event) {
    var img = this;
    var src = img.src;
    img.failed = true;
    console.error("Failed to load", src, "from", img);
    // console.log(event);
    // debugger;
    img._port.postMessage({
        imageRequestResponse: true,
        src: src,
        status: "failure"
        // TODO: yyy
    });
}

function onMsg(port, message) {
    var img = document.createElement('img');
    img.addEventListener('load', imageLoaded);
    img.addEventListener('error', imageNotLoaded);
    img.src = message.src;
    img._port = port;
    img.setAttribute('data-url', message.src);
    document.body.appendChild(img);
}

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name != 'images')
        return;
    port.onMessage.addListener(onMsg.bind(null, port));
});

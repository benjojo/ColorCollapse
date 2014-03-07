var cache = {};

/**
 * @private
 * @param {string} src
 * @param {string} data
 * @param {number} expires
 */
function cacheStore(src, data, expires) {
    return; // Do nothing for now
    cache[src] = {
        expires: expires,
        data: data,
    };
}

/**
 * @private
 * @param {string} src
 * @return {?string}
 */
function cacheGet(src) {
    return null; // Do nothing for now
    var item = cache[src];
    if (!item)
        return null;
    if (item.expires <= Date.now()) {
        delete cache[src];
        return null;
    }
    return item.data
}

/**
 * Sends an imageRequestResponse to the client tab via port
 * @private
 * @param {boolean} status
 * @param {!Port} port
 * @param {string} src
 * @param {string} data
 */
function sendResponse(status, port, src, data) {
    port.postMessage({
        imageRequestResponse: true,
        src: src,
        status: status ? 'success' : 'failure',
        data: data
    });
}

/**
 * @private
 * @this {HTMLImageElement}
 */
function imageLoaded() {
    var img = this;
    var src = img.src;
    img.removeEventListener('load', imageLoaded);
    console.info("Loaded", src, "from", img);
    var data, res = true;
    try {
        var data = collapseImage(img);
        console.info("Bingo!", data);
        cacheStore(src, data, 0); // TODO: Expires
    } catch (e) {
        console.error("Dern", e.message);
        console.error(e.stack);
        res = false;
        data = e.message;
    }
    sendResponse(res, img._port, src, data);
    img.remove();

}

/**
 * @private
 * @param {Event} event
 * @this {HTMLImageElement}
 */
function imageNotLoaded(event) {
    var img = this;
    var src = img.src;
    console.error("Failed to load", src, "from", img);
    // console.log(event);
    // debugger;
    // TODO: Find out why the image didn't load!
    sendResponse(false, img._port, src, null);
    img.remove();
}

/**
 * @private
 * @param {Port} port
 * @param {Object} message
 */
function onMsg(port, message) {
    var src = message.src;
    var data = cacheGet(src);
    if (data) {
        sendResponse(true, port, src, data);
        return;
    }
    var img = document.createElement('img');
    img.addEventListener('load', imageLoaded);
    img.addEventListener('error', imageNotLoaded);
    img.src = src;
    img._port = port;
    img.setAttribute('data-url', message.src);
    document.body.appendChild(img);
}

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name != 'images')
        return;
    port.onMessage.addListener(onMsg.bind(null, port));
});

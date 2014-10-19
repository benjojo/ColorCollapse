/**
 * @preserve
 * Color Collapse
 * Content Script for Chrome Extension
 * (c) Kyle Bloss 2013
 * (c) Ben Cartwright Cox 2013-2014
 * (c) Lex Robinson 2014
 */

/**
 * Captures a single rgb or rgba instance and extracts the start, r, g and b components and the end.
 * Input: rgb(255, 255, 255)
 * Output: "rgb(", 255, 255, 255, ")"
 * Input: rgba(255, 255, 255, 0.2)
 * Output: "rgba(", 255, 255, 255, ", 0.2)"
 * @const
 * @type {RegExp}
 */
var rgbRegex = /(rgba?\()(\d+),\s(\d+),\s(\d+)([^)]*\))/g
/**
 * Chrome API communication port
 * @const
 * @type {Port}
 */
var port;

/**
 * @private
 * @param match The total match, unbroken
 * @param start The start of the token
 * @param r     Red
 * @param g     Green
 * @param b     Blue
 * @param end   The end of the token
 */
function processColor(match, start, r, g, b, end) {
    r = parseInt(r, 10) || 0;
    g = parseInt(g, 10) || 0;
    b = parseInt(b, 10) || 0;

    // brief sanity check
    if (r === b && b === g)
        return match;

    var c = colorCollapse(r, g, b);

    return start + c.r + ', ' + c.g + ', ' + c.b + end;
}

/**
 * @private
 * @this {HTMLElement}
 * @param {string} ruleName
 * @param {number} __
 * @param {CSSStyleDeclaration} rules
 */
function processCSSRule(ruleName, __, rules) {
    try {
        rule = rules[ruleName];
        if (
            (rule.indexOf("rgb(") !== -1 || rule.indexOf("rgba(") !== -1) &&
            ruleName.indexOf("webkit") === -1 // Ignore shadow dom
        ) {
            this.style[ruleName] = rule.replace(rgbRegex, processColor);
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * @private
 * @param {HTMLElement} node
 */
function processNode(node) {
    // We don't process links because of issue #9
    if (node.tagName !== "A") {
        _.forEach(window.getComputedStyle(node), processCSSRule, node);
    }
    // Prevent this node being selected again
    node.classList.add('ColCollapse_PROCESSED');
}

/**
 * Traverses through all non-proccessed DOM nodes and colour collapses their CSS
 */
function processDOM() {
    _.forEach(document.querySelectorAll("*:not(.ColCollapse_PROCESSED)"), function(node) {
        _.defer(processNode, node);
    });
    console.info("Processed DOM");
}

/**
 * Replaces src attributes on images
 * @param {string} oldsrc
 * @param {string} newsrc
 */
function updatePageImages(oldsrc, newsrc) {
    _(document.querySelectorAll('img:not(.ColCollapse_REPLACED)'))
        .where({
            src: oldsrc
        })
        .each(function(img) {
            img.src = newsrc,
            img.classList.add('ColCollapse_REPLACED');
        });
}

/**
 * Steps through an image array collapsing each one every 10 milliseconds.
 * FIXME This function could do with a review
 * @recursive
 * @private
 * @param {Array.<HTMLImageElement>} ary
 * @param {number} ptr
 */
function deferImage(ary, ptr) {
    if (ary.length <= ptr) {
        console.info("Processed all images");
        return
    }
    var img = ary[ptr];
    console.log(ptr, '/', ary.length, img.src);
    try {
        var data = collapseImage(img);
        updatePageImages(img.src, data);
    } catch (e) {
        console.log("Unable to process", img.src, "- sending to extension.");
        port.postMessage({
            src: img.src,
            imageRequest: true
        });
    }


    setTimeout(function() {
        deferImage(ary, ptr + 1);
    }, 10);
}

/**
 * Traverses through all non-proccessed images and colour collapses their pixels
 */
function processImages() {
    var imgtags = document.querySelectorAll('img:not(.ColCollapse_REPLACED)');
    var besttags = _.uniq(imgtags, false, 'src');
    deferImage(besttags, 0)
}

port = chrome.runtime.connect({
    name: "images"
});

port2 = chrome.runtime.connect({
    name: "status"
});

port.onMessage.addListener(function(msg) {
    if (msg.status == 'success')
        updatePageImages(msg.src, msg.data);
    else
        console.warn("Unable to collapse image", msg.src, ":", msg.data);
});

port2.onMessage.addListener(function(msg) {
    if (msg.allowed) {
        // The DOM s already loaded - let's make hay while the sun shines!
        processDOM();
        setInterval(processDOM, 10 * 1000);
        // Images not so much. Let's wait until they're done.
        if (document.readyState !== 'complete')
            window.addEventListener('load', processImages);
        else {
            processImages();
            setInterval(processImages, 10 * 1000);
        }
    }
});

port2.postMessage({
    src: document.location.href,
    imageRequest: false,
});

/**
 * @preserve
 * Color Collapse
 * Content Script for Chrome Extension
 * (c) Kyle Bloss 2013
 * (c) Ben Cartwright Cox 2013-2014
 * (c) Lex Robinson 2014
 */

/**
 * Captures the entire line up until the !LAST! rgb() call, the digits within it and then the rest of the line after it.
 * Input: "linear-gradient(rgb(255, 255, 255), rgb(229, 238, 204) 100px)"
 * Output: ["linear-gradient(rgb(255, 255, 255), ", "229", "238", "204", " 100px)"]
 * @const
 * @type {RegExp}
 */
var rgbRegex = /(.*)rgb\((\d+),\s(\d+),\s(\d+)\)(.*)/;
/**
 * Chrome API communication port
 * @const
 * @type {Port}
 */
var port;

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
            rule.indexOf("rgb(") !== -1 &&
            rule.length < 90 &&
            ruleName.indexOf("webkit") === -1
        ) {
            var ruledata = rule.match(rgbRegex);
            var r, g, b;
            r = parseInt(ruledata[2], 10);
            g = parseInt(ruledata[3], 10);
            b = parseInt(ruledata[4], 10);
            // brief sanity check
            if (r === b && b === g)
                return;
            var collapsed = colorCollapse(r, g, b);
            this.style[ruleName] = ruledata[1] + 'rgb(' + collapsed.r + ',' + collapsed.g + ',' + collapsed.b + ')' + ruledata[5];
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
port.onMessage.addListener(function(msg) {
    if (msg.status == 'success')
        updatePageImages(msg.src, msg.data);
    else
        console.warn("Unable to collapse image", msg.src, ":", msg.data);
});

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
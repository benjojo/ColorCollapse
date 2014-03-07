//
// Color Collapse
// Content Script for Chrome Extension
// (c) Kyle Bloss 2013
// (c) Ben Cartwright Cox 2013-2014
// (c) Lex Robinson 2014
//

// Captures the entire line up until the !LAST! rgb() call, the digits within it and then the rest of the line after it.
// Input: "linear-gradient(rgb(255, 255, 255), rgb(229, 238, 204) 100px)"
// Output: ["linear-gradient(rgb(255, 255, 255), ", "229", "238", "204", " 100px)"]
var rgbRegex = /(.*)rgb\((\d+),\s(\d+),\s(\d+)\)(.*)/;

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
            if (r === b && b === g && (r === 255 || r === 0))
                return;
            var collapsed = colorCollapse(r, g, b);
            this.style[ruleName] = ruledata[1] + 'rgb(' + collapsed.r + ',' + collapsed.g + ',' + collapsed.b + ')' + ruledata[5];
        }
    } catch (e) {
        console.error(e);
    }
}

function processNode(node) {
    // We don't process links because of issue #9
    if (node.tagName !== "A") {
        _.forEach(window.getComputedStyle(node), processCSSRule, node);
    }
    // Prevent this node being selected again
    node.classList.add('ColCollapse_PROCESSED');
}

function processDOM() {
    _.forEach(document.querySelectorAll("*:not(.ColCollapse_PROCESSED)"), function(node) {
        _.defer(processNode, node);
    });
}

function deferImage(ary, ptr) {
    if (ary.length <= ptr) {
        console.info("Processed all images");
        return
    }
    console.log(ptr, '/', ary.length, ary[ptr].src);
    // try {
    //     collapseImage(ary[ptr]);
    // } catch (e) {
    //     console.error(e);
    // }
    chrome.runtime.sendMessage({
        src: ary[ptr].src,
        imageRequest: true
    });


    setTimeout(function() {
        deferImage(ary, ptr + 1);
    }, 10);
}

function processImages() {
    var imgtags = document.getElementsByTagName('img');
    var besttags = _.uniq(imgtags, false, 'src');
    deferImage(besttags, 0)
}

// The DOM has already loaded - let's make hay while the sun shines!
processDOM();
setInterval(processDOM, 10 * 1000);
// Images not so much. Let's wait until they're done.
if (document.readyState !== 'complete')
    window.addEventListener('load', processImages);
else
    processImages();

chrome.runtime.onMessage.addListener(function(request, sender) {
    console.log("Got request: ", request);
});

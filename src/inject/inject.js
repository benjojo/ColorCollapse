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
function processCSSRule( ruleName, __, rules )
{
    try {
        rule = rules[ ruleName ];
        if (rule &&
            rule.indexOf &&
            rule.indexOf("rgb(") !== -1 &&
            rule.length < 90 &&
            ruleName.indexOf("webkit") === -1
        ) {
            var ruledata = rule.match( rgbRegex );
            var r,g,b;
            r = parseInt( ruledata[2], 10 );
            g = parseInt( ruledata[3], 10 );
            b = parseInt( ruledata[4], 10 );
            // brief sanity check
            if ( r === b && b === g && ( r === 255 || r === 0 )  )
                return;
            var collapsed = colMagic( r, g, b );
            this.style[ ruleName ] = ruledata[1] + 'rgb(' + collapsed.r + ',' + collapsed.g + ',' + collapsed.b + ')' + ruledata[5];
        }
    } catch (e) {
        console.error(e);
    }
}
function processNode(node)
{
    // We don't process links because of issue #9
    if ( node.tagName !== "A" ) {
        _.forEach( window.getComputedStyle( node ), processCSSRule, node );
    }
    // Prevent this node being selected again
    node.classList.add('ColCollapse_PROCESSED');
}
function processDOM()
{
    _.forEach( document.querySelectorAll("*:not(.ColCollapse_PROCESSED)"), function( node ) {
        _.defer( processNode, node );
    });
}

function colMagic(r, g, b)
{
    var x = new labcol();
    var labpx = x.RGBtoLab( r, g, b );
    var res = ( labpx.a + labpx.b ) / 2;
    labpx.a = res;
    labpx.b = res;

    return x.LabtoRGB( labpx.l, labpx.a, labpx.b );
}
function processImg( imgElement )
{
    // create hidden canvas (using image dimensions)
    var canvas = document.createElement("canvas");
    canvas.width = imgElement.offsetWidth;
    canvas.height = imgElement.offsetHeight;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0);

    var map = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var imdata = map.data;

    // convert image to grayscale
    var r, g, b;
    for (var p = 0, len = imdata.length; p < len; p += 4) {

        r = imdata[p]
        g = imdata[p + 1];
        b = imdata[p + 2];
        // alpha channel (p+3) is ignored
        var rgb = colMagic(r, g, b)
        imdata[p + 0] = rgb.r;
        imdata[p + 1] = rgb.g;
        imdata[p + 2] = rgb.b;
    }

    ctx.putImageData(map, 0, 0);
    // replace image source with canvas data
    var before = imgElement.src;
    var imgtags = document.getElementsByTagName('img');
    for (var i = 0; i < imgtags.length; i++) {
        if (imgtags[i].src == before) {
            imgtags[i].src = canvas.toDataURL();
        }
    }
}

function deferImage(ary, ptr)
{
    if ( ary.length <= ptr ) {
        console.info("Processed all images");
        return
    }
    console.log( ptr, '/', ary.length, ary[ ptr ].src );
    try {
        processImg( ary[ ptr ] );
    } catch (e) {
        console.error(e);
    }

    setTimeout(function() {
        deferImage( ary, ptr + 1 );
    }, 10);
}
function processImages()
{
    var imgtags = document.getElementsByTagName('img');
    var besttags = _.uniq( imgtags, false, 'src' );
    deferImage( besttags, 0 )    
}

// The DOM has already loaded - let's make hay while the sun shines!
processDOM();
setInterval( processDOM, 10 * 1000 );
// Images not so much. Let's wait until they're done.
if ( document.readyState !== 'complete' )
    window.addEventListener( 'load', processImages );
else
    processImages();

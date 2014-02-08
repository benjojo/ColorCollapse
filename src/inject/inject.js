function processCSSRule( ruleName, __, rules )
{
    try {
        rule = rules[ ruleName ];
        if (rule &&
            rule.indexOf &&
            rule.indexOf("rgb(") !== -1 &&
            rule.length < 90 &&
            ruleName.indexOf("webkit") === -1 &&
            ruleName.indexOf("border") === -1

        ) {
            var cols = processCSSRGB( rule );
            if ( ( cols.r + cols.g + cols.b ) != 765 && ( cols.r + cols.g + cols.b ) != 0 ) {
                var fixed_ones = colMagic( cols.r, cols.g, cols.b );
                this.setAttribute( 'style', this.getAttribute("style") + ";" + ruleName + ": rgb(" + fixed_ones.r + "," + fixed_ones.g + "," + fixed_ones.b + ");" );
            }
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

    if ( ! timerRunning ) {
        setInterval( processDOM, 10 * 1000 );
        timerRunning = true;
    }
}

var timerRunning = false;

function processCSSRGB( inp )
{
    // expecting rgb(17, 68, 119) 
    // or 0px none rgb(17, 68, 119)
    var bitsofrgb = inp.split( "(" )[1].split( "," );

    return {
        r: parseInt( bitsofrgb[0], 10 ),
        g: parseInt( bitsofrgb[1], 10 ),
        b: parseInt( bitsofrgb[2], 10 )
    };
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
    console.log( ary.length, ptr );
    if ( ary.length <= ptr ) {
        console.log("Processed all images");
        return
    }
    console.log( ary[ ptr ]);
    try {
        processImg( ary[ ptr ] );
    } catch (e) {
        console.log(e);
    }

    setTimeout(function() {
        deferImage( ary, ptr + 1 );
    }, 10);
}

// The DOM has already loaded - let's make hay while the sun shines!
processDOM();
// Images not so much. Let's wait until they're done.
window.addEventListener('load', function()
{
    var imgtags = document.getElementsByTagName('img');
    var besttags = _.uniq( imgtags, false, 'src' );
    deferImage( besttags, 0 )
})

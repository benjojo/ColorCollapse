function ProcessDom() {
    var AllTheDom = window.document.getElementsByTagName("*");
    _.forEach(AllTheDom, function(node) {
        _.defer(function(dom) {
            if (dom.tagName != "A" && (dom.getAttribute("class") + "").indexOf("ColCollapse_PROCESSED") === -1) {
                var CSSBits = window.getComputedStyle(dom);
                for (var CSSProp in CSSBits) {
                    try {
                        if (CSSBits[CSSProp] &&
                            CSSBits[CSSProp].indexOf &&
                            CSSBits[CSSProp].indexOf("rgb(") !== -1 &&
                            CSSBits[CSSProp].length < 90 &&
                            CSSProp.indexOf("webkit") === -1 &&
                            CSSProp.indexOf("border") === -1

                        ) {
                            var ColorProp = CSSBits[CSSProp];
                            var cols = processCSSRGB(ColorProp);
                            if ((cols.r + cols.g + cols.b) != 765 && (cols.r + cols.g + cols.b) != 0) {
                                var fixed_ones = colMagic(cols.r, cols.g, cols.b);
                                dom.setAttribute('style', dom.getAttribute("style") + ";" + CSSProp + ": rgb(" + fixed_ones.r + "," + fixed_ones.g + "," + fixed_ones.b + ");");
                            }
                        }
                    } catch (e) {}
                }
                dom.setAttribute('class', dom.getAttribute("class") + " ColCollapse_PROCESSED"); // Tag that node as processed.
                // So it won't be done again.
            }
        }, node);
    });
    if (!TimerRunning) {
        setInterval(ProcessDom, 10 * 1000);
        TimerRunning = true;
    }
}

var TimerRunning = false;

function processCSSRGB(inp) {
    // expecting rgb(17, 68, 119) 
    // or 0px none rgb(17, 68, 119)
    var bitsofrgb = inp.split("(")[1].split(",");

    return {
        r: parseInt(bitsofrgb[0]),
        g: parseInt(bitsofrgb[1]),
        b: parseInt(bitsofrgb[2])
    };
}

function colMagic(r, g, b) {
    var x = new labcol();
    var labpx = x.RGBtoLab(r, g, b);
    var res = (labpx.a + labpx.b) / 2;
    labpx.a = res;
    labpx.b = res;

    return x.LabtoRGB(labpx.l, labpx.a, labpx.b);
}

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            function processImg(imgElement, tintColor) {
                // create hidden canvas (using image dimensions)
                var canvas = document.createElement("canvas");
                canvas.width = imgElement.offsetWidth;
                canvas.height = imgElement.offsetHeight;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(imgElement, 0, 0);

                var map = ctx.getImageData(0, 0, 320, 240);
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

            function DoImg(ary, ptr) {
                console.log(ary[ptr], ary.length, ptr);
                if (ary.length > ptr) {
                    console.log(ary[ptr]);
                    try {
                        processImg(ary[ptr], '#000000');
                    } catch (e) {
                        console.log(e);
                    }

                    setTimeout(function() {
                        DoImg(ary, ptr + 1);
                    }, 10);
                }
            }
            var imgtags = document.getElementsByTagName('img');
            var besttags = _.uniq(imgtags, false, function(a) {
                return a.src
            });
            DoImg(besttags, 0)

            console.log("Processed all images");
            // Now to rewrite CSS!
            ProcessDom();
        }
    }, 10);
});
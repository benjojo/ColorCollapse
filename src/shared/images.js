(function(exports, _) {
    'use strict';

    function mangleData(imgdata) {
        // convert image to grayscale
        var r, g, b;
        for (var p = 0, len = imgdata.length; p < len; p += 4) {

            r = imgdata[p]
            g = imgdata[p + 1];
            b = imgdata[p + 2];
            // alpha channel (p+3) is ignored
            var rgb = colorCollapse(r, g, b)
            imgdata[p + 0] = rgb.r;
            imgdata[p + 1] = rgb.g;
            imgdata[p + 2] = rgb.b;
        }
    }

    function processImg(imgElement) {
        // create hidden canvas (using image dimensions)
        var canvas = document.createElement("canvas");
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

        var map = ctx.getImageData(0, 0, canvas.width, canvas.height);
        mangleData(map.data);
        ctx.putImageData(map, 0, 0);

        return canvas.toDataURL();
    }

    // Exports
    exports.collapseImage = processImg;
})(window, _);

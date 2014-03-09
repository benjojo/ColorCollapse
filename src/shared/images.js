(function(exports) {
    'use strict';

    /**
     * @private
     * @param {(Uint8ClampedArray|CanvasPixelArray)} imgdata
     */
    function mangleData(imgdata) {
        /** @type {number} */
        var r, g, b, rgb;
        for (var p = 0, len = imgdata.length; p < len; p += 4) {
            r = imgdata[p + 0]
            g = imgdata[p + 1];
            b = imgdata[p + 2];
            // alpha channel (p+3) is ignored
            rgb = colorCollapse(r, g, b)
            imgdata[p + 0] = rgb.r;
            imgdata[p + 1] = rgb.g;
            imgdata[p + 2] = rgb.b;
        }
    }

    /**
     * Returns a data-uri of the colour collapsed version of the image
     * @param {!HTMLImageElement} imgElement
     * @return {string} data-uri
     */
    exports.collapseImage = function(imgElement) {
        // create hidden canvas (using image dimensions)
        var canvas = document.createElement("canvas");
        canvas.width = imgElement.naturalWidth || imgElement.width;
        canvas.height = imgElement.naturalHeight || imgElement.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

        var map = ctx.getImageData(0, 0, canvas.width, canvas.height);
        mangleData(map.data);
        ctx.putImageData(map, 0, 0);

        var data = canvas.toDataURL();
        canvas.remove();
        return data;
    }
})(window);

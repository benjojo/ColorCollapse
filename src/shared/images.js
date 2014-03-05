var collapseImage;
(function(){
    'use strict';

    function processImg(imgElement) {
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
            var rgb = colorCollapse(r, g, b)
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

    // Exports
    collapseImage = processImg;
})();

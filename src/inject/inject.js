chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("Hello. This message was sent from scripts/inject.js");
            // ----------------------------------------------------------

            function tintImage(imgElement, tintColor) {
                // create hidden canvas (using image dimensions)
                var canvas = document.createElement("canvas");
                canvas.width = imgElement.offsetWidth;
                canvas.height = imgElement.offsetHeight;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(imgElement, 0, 0);

                var map = ctx.getImageData(0, 0, 320, 240);
                var imdata = map.data;

                // convert image to grayscale
                var r, g, b, avg;
                for (var p = 0, len = imdata.length; p < len; p += 4) {
                    r = imdata[p]
                    g = imdata[p + 1];
                    b = imdata[p + 2];
                    // alpha channel (p+3) is ignored           

                    avg = Math.floor((r + g + b) / 3);

                    imdata[p] = imdata[p + 1] = imdata[p + 2] = avg;
                }

                ctx.putImageData(map, 0, 0);

                // overlay filled rectangle using lighter composition
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = tintColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // replace image source with canvas data
                imgElement.src = canvas.toDataURL();
            }

            var imgtags = document.getElementsByTagName('img');
            for (var i = imgtags.length - 1; i >= 0; i--) {
                try {
                    tintImage(imgtags[i], '#00FF00');
                } catch(e) {
                	console.log(e);
                }

            }
        }
    }, 10);
});

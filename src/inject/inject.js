function ColJs() {
    this.LabtoRGB = function(l, a, b) {
        return this.XYZtoRGB(this.LabtoXYZ(l, a, b).X, this.LabtoXYZ(l, a, b).Y, this.LabtoXYZ(l, a, b).Z);
    };

    this.LabtoXYZ = function(l, a, b) {
        var delta = 6.0 / 29.0;

        var fy = (l + 16) / 116.0;
        var fx = fy + (a / 500.0);
        var fz = fy - (b / 200.0);
        return {
            x: (fx > delta) ? 0.9505 * (fx * fx * fx) : (fx - 16.0 / 116.0) * 3 * (delta * delta) * 0.9505,
            y: (fy > delta) ? 1 * (fy * fy * fy) : (fy - 16.0 / 116.0) * 3 * (delta * delta) * 1,
            z: (fz > delta) ? 1.0890 * (fz * fz * fz) : (fz - 16.0 / 116.0) * 3 * (delta * delta) * 1.0890
        };
    };

    this.XYZtoRGB = function(x, y, z) {
        Clinear = [0, 0, 0];

        Clinear[0] = x * 3.2410 - y * 1.5374 - z * 0.4986; // red
        Clinear[1] = -x * 0.9692 + y * 1.8760 - z * 0.0416; // green
        Clinear[2] = x * 0.0556 - y * 0.2040 + z * 1.0570; // blue

        for (var i = 0; i < 3; i++) {
            Clinear[i] = Math.floor(((Clinear[i] <= 0.0031308) ? 12.92 * Clinear[i] : (
                1 + 0.055) * Math.pow(Clinear[i], (1.0 / 2.4)) - 0.055) * 255);
        }
        return {
            r: Clinear[0],
            g: Clinear[1],
            b: Clinear[2]
        }
    };

    this.RGBtoLab = function(r, g, b) {
        return this.XYZtoLab(this.RGBtoXYZ(r, g, b));
    }

    this.RGBtoXYZ = function(red, green, blue) {
        var rLinear = red / 255.0;
        var gLinear = green / 255.0;
        var bLinear = blue / 255.0;

        // convert to a sRGB form
        r = (rLinear > 0.04045) ? Math.pow((rLinear + 0.055) / (1 + 0.055), 2.2) : (rLinear / 12.92);
        g = (gLinear > 0.04045) ? Math.pow((gLinear + 0.055) / (1 + 0.055), 2.2) : (gLinear / 12.92);
        b = (bLinear > 0.04045) ? Math.pow((bLinear + 0.055) / (1 + 0.055), 2.2) : (bLinear / 12.92);

        return {
            x: (r * 0.4124 + g * 0.3576 + b * 0.1805),
            y: (r * 0.2126 + g * 0.7152 + b * 0.0722),
            z: (r * 0.0193 + g * 0.1192 + b * 0.9505)
        }
    }

    this.Fxyz = function(t) {
        return ((t > 0.008856) ? Math.pow(t, (1.0 / 3.0)) : (7.787 * t + 16.0 / 116.0));
    }

    this.XYZtoLab = function(input) {
        x = input.x;
        y = input.y;
        z = input.z;

        lab = {
            l: 0,
            a: 0,
            b: 0
        };
        lab.l = 116.0 * this.Fxyz(y / 1.0) - 16;
        lab.a = 500.0 * (this.Fxyz(x / 0.9505) - this.Fxyz(y / 1.0));
        lab.b = 200.0 * (this.Fxyz(y / 1.0) - this.Fxyz(z / 1.0890));

        return lab;
    }

    var that = this;
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
                var r, g, b, avg;
                var x = new ColJs();
                for (var p = 0, len = imdata.length; p < len; p += 4) {

                    r = imdata[p]
                    g = imdata[p + 1];
                    b = imdata[p + 2];
                    // alpha channel (p+3) is ignored           

                    var labpx = x.RGBtoLab(r, g, b);
                    // res = (px[x, y].A + px[x, y].B) / 2
                    var res = (labpx.a + labpx.b) / 2;
                    labpx.a = res;
                    labpx.b = res;
                    labpx.l = (labpx.l + res);

                    var rgb = x.LabtoRGB(labpx.l, labpx.a, labpx.b);

                    imdata[p + 0] = rgb.r;
                    imdata[p + 1] = rgb.g;
                    imdata[p + 2] = rgb.b;
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

            function DoImg(ary, ptr) {
            	console.log(ary[ptr],ary.length,ptr);
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
            DoImg(imgtags, 0)

            console.log("Processed all images");
        }
    }, 10);
});

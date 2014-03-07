(function(exports, labcol) {
    'use strict';
    var magic = new labcol();

    exports.colorCollapse = function(r, g, b) {
        var labpx = magic.RGBtoLab(r, g, b);
        var res = (labpx.a + labpx.b) / 2;
        labpx.a = res;
        labpx.b = res;

        return magic.LabtoRGB(labpx.l, labpx.a, labpx.b);
    }
})(window, labcol);

(function(exports, labcol) {
    'use strict';
    var magic = new labcol();

    /**
     * Collapses the RGB accross a colour axis
     * @nosideeffects
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @return {{r: number, g: number, b: number}}
     */
    exports.colorCollapse = function(r, g, b) {
        var labpx = magic.RGBtoLab(r, g, b);
        /** @type {number} */
        var res = (labpx.a + labpx.b) / 2;
        labpx.a = res;
        labpx.b = res;

        return magic.LabtoRGB(labpx.l, labpx.a, labpx.b);
    }
})(window, labcol);

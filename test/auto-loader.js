var template = document.getElementById('templ8');
var body = document.getElementById('testdata');
var next = 0;
var timer = document.getElementById('timer');
var cssnumbr = document.getElementById('cssnumbr');
var csstotal = document.getElementById('csstotal');
var cssnumbr = document.getElementById('cssnumbr');
var csstotal = document.getElementById('csstotal');
var interval = 2.5 * 1000;

function doTemplate() {
    var node = template.content.firstElementChild.cloneNode(true);
    body.insertBefore(node, body.firstElementChild);
    var time = node.querySelector('time');
    var date = new Date();
    time.textContent = date.toLocaleTimeString();
    next = Date.now() + interval;
}
doTemplate();
aa = window.setInterval(doTemplate, interval);

function doTimer() {
    timer.textContent = ((next - Date.now()) / 1000).toFixed(2);
    cssnumbr.textContent = document.querySelectorAll('#testdata span.ColCollapse_PROCESSED').length;
    csstotal.textContent = document.querySelectorAll('#testdata span').length;
    imgnumbr.textContent = document.querySelectorAll('#testdata img.ColCollapse_REPLACED').length;
    imgtotal.textContent = document.querySelectorAll('#testdata img').length;
}
doTimer();
window.setInterval(doTimer, 10);

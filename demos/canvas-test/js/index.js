var demo = document.getElementById('demo'),
    ctx = demo.getContext('2d'),
    zoomctx = document.getElementById('zoom').getContext('2d'),
    pi = Math.PI,
    lineWidth = 20,
    startAngle = pi / -2,
    endAngle = 3 * pi / 2,
    total = 100,
    value = 80,
    width = demo.width,
    height = demo.height,
    x = width / 2,
    y = height / 2,
    r = Math.min(x, y) - lineWidth,
    fontSize = 100,
    i = 0,
    ani,
    angle,
    text,
    measureText;

function draw() {
    //清理画布
    ctx.clearRect(0,0, width, height);
    //画布背景
    ctx.beginPath();
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, width, height);
    //插入文本
    ctx.font = fontSize + "px Microsoft YaHei";
    text = parseInt(i / total * 100) + '%';
    measureText = ctx.measureText(text);
    ctx.fillStyle = '#ccc';
    ctx.fillText(text, x - measureText.width / 2, y + fontSize / 4);

    //圆环背景
    ctx.strokeStyle = '#000';
    ctx.arc(x, y, r, startAngle, endAngle, false);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    //圆环进度条
    angle = startAngle + 2 * pi * i / 100;
    ctx.beginPath();
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.arc(x, y, r, startAngle, angle, false);
    ctx.stroke();
    ani = window.requestAnimationFrame(draw);
    i++;
    if(i > value) {
        window.cancelAnimationFrame(ani);
    }
}

draw();

zoomctx.imageSmoothingEnabled = true;
zoomctx.mozImageSmoothingEnabled = true;
zoomctx.webkitImageSmoothingEnabled = true;
zoomctx.msImageSmoothingEnabled = true;
//放大器
var zoom = function(event) {
    var x = event.layerX;
    var y = event.layerY;
    zoomctx.drawImage(demo, x - 50, y - 50, 100, 100, 0, 0, 300, 300);
};

demo.addEventListener('mousemove', zoom);
demo.addEventListener('mouseout', function () {
    zoomctx.clearRect(0, 0, 300, 300);
});
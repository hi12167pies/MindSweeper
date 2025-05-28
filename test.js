const screenshot = require('screenshot-desktop');
const { Jimp } = require("jimp");

(async () => {
    const imgBuffer = await screenshot({ format: 'png' });
    const image = await Jimp.read(imgBuffer)
    image

    const x = 300;
    const y = 300;
    const pixel = image.getPixelColor(x, y);
    const hex = '#' + pixel.toString(16).padStart(8, '0').slice(0, 6);
    console.log(`Color at (${x}, ${y}) is: ${hex}`);
})();
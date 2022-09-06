let imageToSlices = require('image-to-slices');

let lineXArray = [100, 200];
let lineYArray = [100, 200];

let source = 'src/assets/map-7.webp';
imageToSlices(source, lineXArray, lineYArray, {
  saveToDir: 'src/assets/'
});

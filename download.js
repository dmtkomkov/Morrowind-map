let fs = require('fs'), https = require('https'), Stream = require('stream').Transform;

const layers = [
  { dir: 'src/assets/2/', url_base: 'https://d38oy7iu7t2hpf.cloudfront.net/64/', tiles: 2 },
  { dir: 'src/assets/4/', url_base: 'https://d38oy7iu7t2hpf.cloudfront.net/32/', tiles: 4 },
  { dir: 'src/assets/8/', url_base: 'https://d38oy7iu7t2hpf.cloudfront.net/16/', tiles: 8 },
  { dir: 'src/assets/16/', url_base: 'https://d38oy7iu7t2hpf.cloudfront.net/8/', tiles: 16 }
]


function getImage(url_base, dir, i, j) {
    console.log(i,j)
    let src = url_base + `${i}-${j}.webp`
    https.request(src, function(response) {
        let data = new Stream();

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            let dst = dir + 'image-' + `${i}-${j}.webp`;
            console.log('download', dst, 'from', src);
            fs.writeFileSync(dst, data.read());
        });
    }).end();
}

layers.forEach(layer => {
  if (!fs.existsSync(layer.dir)){
    fs.mkdirSync(layer.dir);
  }

  for (let i=0; i < layer.tiles; i++) {
    for (let j=0; j < layer.tiles; j++) {
      getImage(layer.url_base, layer.dir, i, j);
    }
  }
})



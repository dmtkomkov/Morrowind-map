let fs = require('fs'), https = require('https'), Stream = require('stream').Transform;

let url_base = 'https://d38oy7iu7t2hpf.cloudfront.net/32/';

console.log('start');

function getImage(i,j) {
    console.log(i,j)
    let url = url_base + `${i}-${j}.webp`
    https.request(url, function(response) {
        let data = new Stream();

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            let name = 'src/assets/4/image-' + `${i}-${j}.webp`;
            console.log('download', name, 'from', url);
            fs.writeFileSync(name, data.read());
        });
    }).end();
}


for (let i=0; i < 4; i++) {
    for (let j=0; j < 4; j++) {
        getImage(i,j);
    }
}

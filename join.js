let ji = require('join-images');

// ji.joinImages(['src/assets/8-new/a.webp', 'src/assets/8-new/b.webp'], { direction: 'horizontal' }).then((img) => {
//     // Save image as file
//     img.toFile(`src/assets/8-new/image.webp`);
// });


// for (let i = 0; i < 4; i++) {
//     let img_list = Array.from({ length: 4 }, (_, j) => 'src/assets/4/image-' + `${ i }-${ j }.webp`)
//     console.log(img_list);
//     ji.joinImages(img_list).then((img) => {
//         // Save image as file
//         img.toFile(`src/assets/join/image-${ i }.webp`);
//     });
// }

let img_list = Array.from({ length: 4 }, (_, i) => `src/assets/join/image-${ i }.webp`)
ji.joinImages(img_list, { direction: 'horizontal' }).then((img) => {
    // Save image as file
    img.toFile(`src/assets/result-4.webp`, {});
});

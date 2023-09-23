const fs = require('fs');
const superagent = require('superagent');   //an npm package for http requests


// superagent.get(`https://dog.ceo/api/breed/${data}/images/random`, (err, res) => {
//     console.log(res.body.message);
// });

//Building Promise
const readFilePro = file => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject("I could not find that file");
            resolve(data);
        });
    });
};

const writeFilePro = (file, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file,data, err => {
            if(err) reject('Could not write file');
            resolve("success");
        });
    });
};


const getDogpic = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`);
        console.log(`Breed : ${data}`);

        const res1Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res2Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res3Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

        const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
        const imgs = all.map(el => el.body.message);
        // console.log(res.body.message);

        await writeFilePro('dog-img.txt', imgs.join('\n'));
        console.log("Random dog image saved to file!");
    } catch(err) {
        console.log(err);
        throw (err);
    }
    return '2: Ready'
}


(async () => {
    try {
        console.log('1: Will gets dog pics');
        const x =await getDogpic();
        console.log(x);
        console.log('3: Done getting dog pics');
    }catch {
        console.log('ERROR!');
    }
    

})()

/////////////////////////////WITH .then()///////////////////////////

// readFilePro(`${__dirname}/dog.txt`)
// .then(res =>{
//     console.log(`Breed : ${res}`);
//     return superagent.get(`https://dog.ceo/api/breed/${res}/images/random`);
// })
// .then(res => {
//     console.log(res.body.message);
//     return writeFilePro('dog-img.txt',res.body.message)
// })
// .then(() => {
//     console.log("Random dog image saved to file!");
// })
// .catch(err => {
//     console.log(err);
// });

// console.log('1: Will gets dog pics');
// getDogpic()
// .then(x => {
//     console.log(x);
//     console.log('3: Done getting dog pics');
// })
// .catch(err => {
//     console.log('ERROR !');
// })


////////////////////////WITH callbacks//////////////////////////

// fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
//     console.log(`Breed : ${data}`);

//     superagent
//         .get(`https://dog.ceo/api/breed/${data}/images/random`)
//         .then(res => {
//             console.log(res.body.message);
//             fs.writeFile('dog-omg.txt',res.body.message, err => {
//                 console.log("Random dog image saved to file!");
//             });
//         }).catch(err => {
//             console.log(err.message);
//         });
// });
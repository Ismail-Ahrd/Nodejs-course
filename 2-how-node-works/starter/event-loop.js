const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE=5;  //we will have only one thread in our thred pool(Not workiing!!!)

setTimeout(() =>  console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile('test-file.txt',() => {
    console.log('I/O finished');
    console.log("_________________");
    setTimeout(() =>  console.log("Timer 2 finished"), 0);
    setTimeout(() =>  console.log("Timer 3 finished"), 3000);
    setImmediate(() => console.log("Immediate 2 finished"));

    process.nextTick(() => console.log("Process.nextTick"));

    //Async version : they are running in the event loop => uploaded to the thred pool
    crypto.pbkdf2('password', 'salt', 100000, 1024,  'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted');
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024,  'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted');
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024,  'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted');
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024,  'sha512', () => {
        console.log(Date.now() - start, 'Password encrypted');
    });

    //Sync version : they aren't running in the event loop
    // crypto.pbkdf2Sync('password', 'salt', 100000, 1024,  'sha512')
    // console.log(Date.now() - start, 'Password encrypted');
    // crypto.pbkdf2Sync('password', 'salt', 100000, 1024,  'sha512')
    // console.log(Date.now() - start, 'Password encrypted');
    // crypto.pbkdf2Sync('password', 'salt', 100000, 1024,  'sha512')
    // console.log(Date.now() - start, 'Password encrypted');
    // crypto.pbkdf2Sync('password', 'salt', 100000, 1024,  'sha512')
    // console.log(Date.now() - start, 'Password encrypted');
});

console.log('Hello from top-level code');
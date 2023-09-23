//console.log(arguments);   //arguments is an array in js that contains all the values that we passed into a function
//console.log(require('module').wrapper); 


//module.exports
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(5,4));

// exports
// const calc2 = require("./test-module-2");
const { add, multiply } = require("./test-module-2");
console.log(multiply(2, 5));

// caching
require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down....');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// console.log(db);


// main().catch(err => console.log(err));

// async function main() {
//   const con =await mongoose.connect(db);
//   console.log(con.connection);
// }

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(con => console.log('DB connection successful!'))

 
// environment variables are global variables that are used to define the 
//environment in which the node app is running(by default it's developement) 
//console.log(app.get('env')); 

// the environments variables sets by node.js
// console.log(process.env);    


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});


//Each time there is an unhandled promise rejection somewhere in the app
//the process object will emit an object called unhandled rejection and so 
//we can subscribe to that event :
process.on('unhandledRejection', err => {
    console.log('UNHANDLED RAJECTION! Shutting down....');
    console.log(err.name, err.message);
    server.close(() => {
        // 0: success, 1: uncaught exception
        process.exit(1);
    });
});



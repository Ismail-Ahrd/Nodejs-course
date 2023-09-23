const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');


dotenv.config({ path: '../../config.env' });

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then((con) => {
    console.log('DB connection successful!');
});

//Reading json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));


//import data into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfally loaded');
        
    } catch (err) {
        console.log(err);
    };
    process.exit();
};

//Delete all data from DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted');
        
    } catch (err) {
        console.log(err);
    };
    process.exit();
};

if(process.argv[2] === '--delete'){
    deleteData(); 
} else if (process.argv[2] === '--import'){
    importData();
}

console.log(process.argv);






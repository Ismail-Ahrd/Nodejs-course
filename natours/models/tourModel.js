const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name!'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
        // validate: [validator.isAlpha, 'Tour name must only contains characters']
    },
    slug: String,
    duration:  {
        type: Number,
        required: [true, 'A tour must have a duration!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size!']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty!'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or diifficult'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'A rating must be above 1.0'],
        max: [5, 'A rating must be below 5.0']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price!']
    },
    priceDiscount: {
        type: Number,
        //Custom Validator
        validate: {                                  
            validator: function(val) { 
                //this only points to current doc on NEW documen creation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover : {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createAt: {
        type: Date,
        default: Date.now(),
        select : false     // always hiding
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//To create a virtual propertie (it's not gona be in the database). 
//We can't use a virtual proportie in a query
tourSchema.virtual('durationWeeks').get(function() {                     
    return this.duration / 7 ;
});

//DOCUMENT MIDDLEWARE: runs befeore .save() and .create()
tourSchema.pre('save', function(next) {
    //this refers to the current document that was created
    this.slug = slugify(this.name, { lower: true });        
    next();
});

// tourSchema.pre('save', function(next) {
//     console.log('Will save document.....');
//     next();
// });

// //runs after .save() and .create
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

//QUERY MIDDLEWARE
//runs before executing a querty
tourSchema.pre(/^find/, function(next) {
    //regular expression : all the command that starts with the name find (find, findOne.....)                 
    this.start = Date.now();
    //this here refers to the query that will be executed
    this.find({ secretTour: { $ne: true } });        
    next();
});

//runs after executing a querty
tourSchema.post(/^find/, function(docs, next) {
    console.log(`Executing Query takes ${Date.now() - this.start} milliseconds`);
    next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    // unshift: an array method that adds an element to the beginning of the array
    this.pipeline().unshift({                   
        $match: { secretTour: { $ne: true } }
    });
    console.log(this.pipeline());                     
    next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
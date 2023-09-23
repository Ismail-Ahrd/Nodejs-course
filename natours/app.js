const express = require('express');
const morgan = require('morgan');      //npm package
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');


const app = express();

//1) Global MIDDELEWARE

//Set security  HTTP headers
app.use(helmet());

//Developement logging
if (process.env.NODE_ENV === 'development') {
    // middleware that log to the console infos about the req and res(http method, route, status code..)
    app.use(morgan('dev'));   
};

//Limit requests from same IP
const limiter = rateLimit({
    //allow 100 requests from the same IP in one hour
    max: 100,
    windowMs: 60 * 60 * 1000,
    //if that limit is encrossed by certain IP they will get back an error message
    message: 'to many request from this IP, please try again in one hour!'
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({
    //limiting the data that comes in in the body
    limit: '10kb'
}));  

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS(cross-site scripting attacks)
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'maxGroupSize', 'difficulty', 'ratingAverage', 'ratingQuantity', 'price']
}));

//Serving drtatic files
app.use(express.static(`${__dirname}/public`)); 


//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
})



//3) ROUTES

// app.get('/api/v1/tours', getTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// userRouter.route('/api/v1/users')
//     .get(getAllUsers)
//     .post(createUser);

// app.route('/api/v1/users/:id')
//     .get(getUser)
//     .patch(updateUser)
//     .delete(deleteUser);  


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
     
    //If the next fun receives an argument, express will automatically know that there was an error
    //so it will assume that what we pass into the next fun is going to be an error and it will then skip 
    //all the middlewares in the middleware stack and send the error that we passed to our global error
    //handlling middlware which will be executed
    next(err);
});

//By specifying 4 parameters in the callback fun express automatically
//knows that the fun is an error handlling middleware
app.use(globalErrorHandler);
  

module.exports = app;
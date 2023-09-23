const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'));

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}



exports.getAllTours = catchAsync(async (req, res, next) => {
    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();       
    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data : {
            tours : tours
        }
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //findById() execute findOne() behind the scene
    const tour = await Tour.findById(req.params.id);
    
    if(!tour) {
        return next(new AppError('No tour found with that ID', 404));
    };
    
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});



exports.createTour = catchAsync(async (req, res, next) => {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);
    //201 : created!
    res.status(201).json({
        status : "success",
        data : {
            tour : newTour
        }
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!tour) {
        return next(new AppError('No tour found with that ID', 404));
    };

    res.status(200).json({
        status : 'success',
        data : {
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour) {
        return next(new AppError('No tour found with that ID', 404));
    };
    
    //204 : no content
    res.status(204).json({            
        status : 'success',
        data : null
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    // aggregate: to make some calcul 
    const stats = await Tour.aggregate([                           
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                //for each of the document that's going to go through this 
                //pipeline 1 will be added to numTours
                numTours: { $sum: 1 },                           
                numRating: { $sum: '$ratingQuantity' },
                avgRating: { $avg: "$ratingAverage" },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgRating: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});


exports.getMonthlysPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year*1;
    const plan = await Tour.aggregate([
        {
            //$unwind: Deconstructs an array field from the input 
            //documents to output a document for each element
            $unwind: '$startDates'  
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
          },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }   
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            //To remove the _id field
            $project: {                                        
                _id: 0
            }
        },{
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});
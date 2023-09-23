const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

//param is a middleware that runs only if we have a cetain parameter in our url
//router.param('id', tourController.checkId);     

router.route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats')
    .get(tourController.getTourStats);

router.route('/monthly-plan/:year')
    .get(tourController.getMonthlysPlan);    

router.route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);
    
module.exports = router;    
/*
 Routes identify specific URL paths, which can be targeted in the application logic 
 and which allow you to specify the information to be sent to the client. 

 If the /contact path can respond to POST and GET requests, for example, 
 your code will route to the appropriate function as soon as the request’s method is identified

 When you call get or post, you need to pass the URL of the route and the function you want to execute when that route is reached. 
 These functions register your routes by adding them to the routes object, where they can be reached and used by the handle function.

 To recap, to register a route, I need to state the following:

Whether the request is a GET or a POST request
The URL’s path
The name of the file to return
An HTTP status code
The type of the file being returned (as the content type)

*/

import express from 'express';

import { AdminController } from '../controllers/admin.controller';
import admin from './schema/admin.schema';
import Utility from '../constants/utility';

const router = express.Router();
const passport = require('passport');
const schemaValidator = require('express-joi-validation').createValidator({});

//create admin account
//the schema must have details needed to register an admin
router.post(
  '/register-admin',
  schemaValidator.body(admin.registerAdmin),
  Utility.asyncHandler(AdminController.registerAdmin)
);

//update an admin account
router.put(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(admin.adminIdQ),
  schemaValidator.body(admin.updateAdmin),
  Utility.asyncHandler(AdminController.updateAdmin)
); //body are details of admin to be updated without accountId inside, adminIdQ is the id of the USER requesting this

//get admin
router.get(
  '/get-admin/:id',
  schemaValidator.params(admin.getAdmin),
  Utility.asyncHandler(AdminController.getAdmin)
);

//get list of students
router.get('/students', Utility.asyncHandler(AdminController.getStudents));

//get list of senseis
router.get('/senseis', Utility.asyncHandler(AdminController.getSenseis));

router.delete(
  '/delete-admin/:id',
  Utility.asyncHandler(AdminController.deleteAdmin)
);

export default router;

/*
show: (req, res, next) => {
    var subscriberId = req.params.id;
    Subscriber.findById(subscriberId)
    .then(subscriber => {
    res.locals.subscriber = subscriber;
    next();
    })
    .catch(error => {
    console.log(`Error fetching subscriber by ID:
    ➥ ${error.message}`)
    next(error);
    });
    },
    showView: (req, res) => {
    res.render("subscribers/show");
    }

    router.get("/:id", usersController.show,

    //get all courses
router.get('/getAllCourse', (req, res) => {
    controller.getAllCourses().then(response => {
        res.status(response.status).send(response);
    }).catch(err => {
        res.status(err.status).send(err.message);
    })
    });
    
    //add new course
    router.post('/addNewCourse', (req, res) => {
    controller.addCourse(req.body).then(response => {
        res.status(response.status).send(response.message);
    }).catch(err => {
        res.status(err.status).send(err.message);
    })
    });
    
    //get course details by course code
    router.get('/get_specific_course/:id', (req, res) => {
    controller.getSpecificCourse(req.params.id).then(response => {
        res.status(response.status).send(response.data);
    }).catch(err => {
        res.status(err.status).send(err.message);
    })
    });
    */

import * as bodyParser from 'body-parser';
import express from 'express';
// const morgan = require('morgan');

import application from './constants/application';
import indexRoute from './routes/index.route';
import joiErrorHandler from './middlewares/joiErrorHandler';
import * as errorHandler from './middlewares/apiErrorHandler';
import { sequelize} from "./config/db";
import logger from './config/logger';
const PORT = process.env.PORT || 5000;
const passport = require('passport');
require('./config/auth/passport')(passport);

const app = express();

// require('dotenv').config({ path: `.env.${process.env.NODE_ENV}`});
app.use(bodyParser.json());
// app.use(morgan('dev'));

sequelize.sync()
    .then(() => {
        logger.info('database connection created');
        // Passport
        app.use(passport.initialize());
        // app.use(passport.session());

        // Router/
        app.use(application.url.base, indexRoute);
        // Joi Error Handler
        app.use(joiErrorHandler);
        // Error Handler
        app.use(errorHandler.notFoundErrorHandler);
        app.use(errorHandler.internalServerError);

        app.listen(PORT, () => {
            logger.info(`Server running at ${PORT}`);
        });
    })
    .catch((error: Error) => {
        logger.info(`Database connection failed with error ${error}`);
    });
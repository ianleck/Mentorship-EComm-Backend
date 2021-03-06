import * as bodyParser from 'body-parser';
import express from 'express';

import { BASE } from './constants/constants';
import indexRoute from './routes/index.route';
import joiErrorHandler from './middlewares/joiErrorHandler';
import * as errorHandler from './middlewares/apiErrorHandler';
import { sequelize } from './config/db';
import logger from './config/logger';
import passport from 'passport';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import fs from 'fs';

const PORT = process.env.PORT || 5000;
require('./config/auth/passport')(passport);

const app = express();

app.use(bodyParser.json());

sequelize
  .sync()
  .then(() => {
    logger.info('database connection created');

    const corsOptions = {
      origin: ['http://localhost:3000'],
      optionsSuccessStatus: 200, // For legacy browser support
    };
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
      next();
    });
    app.use(fileUpload());
    app.use(cors(corsOptions));

    // init dev upload folders
    const uploadDir = './uploads';
    const childDir = ['/transcript', '/dp', '/cv'];

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    childDir.forEach((dir) => {
      if (!fs.existsSync(uploadDir + dir)) {
        fs.mkdirSync(uploadDir + dir);
      }
    });

    // Passport
    app.use(passport.initialize());
    // app.use(passport.session());

    // Router/
    app.use(BASE, indexRoute);
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

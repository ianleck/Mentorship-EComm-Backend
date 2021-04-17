import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import passport from 'passport';
import paypal from 'paypal-rest-sdk';
import { sequelize } from './config/db';
import logger from './config/logger';
import { BASE, CHILD_FOLDERS } from './constants/constants';
import * as errorHandler from './middlewares/apiErrorHandler';
import joiErrorHandler from './middlewares/joiErrorHandler';
import indexRoute from './routes/index.route';
import socket from './socket';
import { FRONTEND_APIS } from '../src/constants/constants';

const socketIo = require('socket.io');

const PORT = process.env.PORT || 5000;
require('./config/auth/passport')(passport);

const app = express();

app.use(express.json());

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
paypal.configure({
  mode: 'sandbox',
  client_id: PAYPAL_CLIENT_ID,
  client_secret: PAYPAL_CLIENT_SECRET,
});

sequelize
  .sync()
  .then(() => {
    logger.info('database connection created');

    const corsOptions = {
      origin: FRONTEND_APIS,
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
    app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
    app.use(cors(corsOptions));

    // init dev upload folders
    const uploadDir = './uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    CHILD_FOLDERS.forEach((dir) => {
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

    const server = app.listen(PORT, () => {
      logger.info(`Server running at ${PORT}`);
    });

    socket.init(server);
  })
  .catch((error: Error) => {
    logger.info(`Database connection failed with error ${error}`);
  });

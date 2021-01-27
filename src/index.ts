import * as bodyParser from 'body-parser';
import express from 'express';
// const morgan = require('morgan');
require('./config/passport');
const cors = require('cors');

import application from './constants/application';
import indexRoute from './routes/index.route';
import joiErrorHandler from './middlewares/joiErrorHandler';
import * as errorHandler from './middlewares/apiErrorHandler';
import { sequelize} from "./config/db";
import logger from './config/logger';
import socket from './socket';
const app = express();
const http = require("http");
const socketIo = require('socket.io');
const PORT = process.env.PORT || 5000;



require('dotenv').config({ path: `.env.${process.env.NODE_ENV}`});
app.use(bodyParser.json());

sequelize.sync()
    .then(() => {
        logger.info('database connection created');
        const corsOptions = {
            origin: 'http://localhost:3000',
            optionsSuccessStatus: 200 // For legacy browser support
        }

        app.use(cors(corsOptions));
        // Router/
        app.use(application.url.base, indexRoute);
        // Joi Error Handler
        app.use(joiErrorHandler);
        // Error Handler
        app.use(errorHandler.notFoundErrorHandler);
        // const server = http.createServer(app);
        const server = app.listen(PORT, () => {
            logger.info(`Server running at ${PORT}`);
        });
        // const io = socketIo(server, {
        //     cors: {
        //         cors:true,
        //         origin: 'http://localhost:3000',
        //         optionsSuccessStatus: 200, // For legacy browser support
        //         methods: ["GET", "POST"],
        //         allowedHeaders: ["my-custom-header"],
        //         credentials: true
        //     }
        // });
        //
        // io.on('connection', () =>{
        //     console.log('a user is connected')
        // })
        socket.init(server);
    })
    .catch((error: Error) => {
        logger.info(`Database connection failed with error ${error}`);
    });

// FOR LOCAL AREA TESTING
// const corsOptions = {
//     origin: 'http://localhost:3000',
//     optionsSuccessStatus: 200 // For legacy browser support
// }
//
// app.use(cors(corsOptions));
// // Router/
// app.use(application.url.base, indexRoute);
// // Joi Error Handler
// app.use(joiErrorHandler);
// // Error Handler
// app.use(errorHandler.notFoundErrorHandler);
// // const server = http.createServer(app);
// const server = app.listen(PORT, () => {
//     logger.info(`Server running at ${PORT}`);
// });
// const io = socketIo(server, {
//     cors: {
//         cors:true,
//         origin: 'http://localhost:3000',
//         optionsSuccessStatus: 200, // For legacy browser support
//         methods: ["GET", "POST"],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true
//     }
// });
//
// io.on('connection', () =>{
//     console.log('a user is connected')
// })
// socket.init(server);
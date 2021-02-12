import {Sequelize} from "sequelize-typescript";
import { User} from "../../models/abstract/User";
import dbConfig from './db-config';

// export const sequelize =  new Sequelize({
//     database: 'node-db',
//     dialect: 'mysql',
//     username: 'administrator',
//     password: 'password',
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000
//     },
//     // models: ['../../models/*.ts'], // or [Player, Team],
//     models: [User]
// });
const config: {dialect:string} = process.env.NODE_ENV == "dev"? dbConfig.development: dbConfig.production;
export const sequelize =  new Sequelize({
    ...config,
    // dialect: process.env.DB_Dialect,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    // models: ['../../models/*.ts'], // or [Player, Team],
    models: [__dirname + '/../../models/*.ts']
});
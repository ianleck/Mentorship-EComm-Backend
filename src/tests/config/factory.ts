import {Connection, createConnection, getRepository} from "typeorm";
import logger from "../../config/logger";
import app from "../../config/express";
import {Teacher} from "../../database/entities/teacher/teacher.entity";
import {Student} from "../../database/entities/student/student.entity";
import {MysqlConnectionOptions} from "typeorm/driver/mysql/MysqlConnectionOptions";
import * as http from "http";
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';


const teacherJson = require('./teacher.json');

const entitiesList = [Teacher, Student];
let server: http.Server;
let connection: Connection;

const cleanAll = async() => {
    try {
        await connection.dropDatabase();
        await connection.synchronize();
    } catch (error) {
        throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
}

const close = async() => {
    await cleanAll();
    await connection.close();
    await server.close();
}

const getApp = () => {
    return app;
}
const getConnection = () => {
    return connection;
}

const init = async() => {
    const PORT = process.env.PORT || 5001;
    const connectionOptions:MysqlConnectionOptions = {
        type: 'mysql',
        host: '127.0.0.1',
        username: 'root',
        password: 'password',
        database: 'test-db',
        port: 3307,
        charset: 'utf8',
        synchronize: true,
        entities: entitiesList,
        migrations: ["migration/*.ts"],
        cli: {
            migrationsDir: "migration"
        },
        connectTimeout: 30000,
        acquireTimeout: 30000
    }
    await createConnection(connectionOptions)
        .then(async(c) => {
            connection = c;
            console.log('database connection created');
            logger.info('database connection created');
            server = app.listen(PORT, () => {
                logger.info(`Server running at ${PORT}`);
            });
        })
        .catch((error: Error) => {
            console.log(`Database connection failed with error ${error}`);
            logger.info(`Database connection failed with error ${error}`);
        });
}

const seedData = async() => {
    try {
        await cleanAll();
        const tEntities = teacherJson.map( (t:any) => {
            const tEntity = new Teacher();
            tEntity.email = t.email;
            tEntity.createdAt = t.createdAt;
            tEntity.updatedAt = t.updatedAt;
            tEntity.isActive = t.isActive;
            tEntity.students = t.students.map( (s:any) => {
                const student = new Student();
                student.email = s.email;
                student.createdAt = s.createdAt;
                student.updatedAt = s.updatedAt;
                student.isActive = s.isActive;
                return student;
            })
            return tEntity;
        })

        const savedTEntities = await getRepository(Teacher).save(tEntities);

        const commonStudent = await getRepository(Student).findOne({email: tEntities[0].students[1].email});
        savedTEntities[1].students.push(commonStudent);
        await getRepository(Teacher).save(savedTEntities[1]);

    } catch(e) {
        console.log('Failed to seed test data:', e);
    }
}

export default {
    cleanAll,
    close,
    getApp,
    getConnection,
    init,
    seedData
}
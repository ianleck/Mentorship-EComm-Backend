import request, { CallbackHandler } from 'supertest';
import routes from '../../routes/teacher/teacher.route';
import teacherService from '../../services/teacher.service';
import testFactory from '../config/factory';
import { Student } from '../../database/entities/student/student.entity';

const teacherJson = require('../config/teacher.json');

describe('Test Teacher route api', () => {
  let app: any;
  let connection: any;
  beforeEach(async () => {
    // await jest.resetAllMocks();
    await testFactory.seedData();
  });
  beforeAll(async () => {
    await testFactory.init();
    app = await testFactory.getApp();
    connection = await testFactory.getConnection();
  });

  afterEach(async () => {
    await testFactory.cleanAll();
  });
  afterAll(() => {
    testFactory.close();
  });

  it('Test hello world', (done) => {
    return request(app.use(routes))
      .get('/api/')
      .expect(200)
      .expect((res: any) => {
        expect(res.body.data).toBe('Hello World');
      })
      .end(done);
  });

  it('Register teacher and students', (done: CallbackHandler) => {
    const spyTServiceRegister = jest.spyOn(teacherService, 'register');
    return request(app.use(routes))
      .post('/api/register')
      .send({
        teacher: 'registerTeacher@gmail.com',
        students: [
          'studentjon@gmail.com',
          'studenthon1n@gmail.com',
          'studentheaan@gmail.com',
        ],
      })
      .expect(204)
      .expect(() => {
        expect(spyTServiceRegister).toHaveBeenCalledTimes(1);
        spyTServiceRegister.mockClear();
      })
      .end(done);
  });

  it('Register teacher and students with wrong body property', (done: CallbackHandler) => {
    const spyTServiceRegister = jest.spyOn(teacherService, 'register');
    return request(app.use(routes))
      .post('/api/register')
      .send({
        teachr: teacherJson[0].email,
        studets: [
          'studentjon@gmail.com',
          'studenthon1n@gmail.com',
          'studentheaan@gmail.com',
        ],
      })
      .expect(400)
      .expect(() => {
        expect(spyTServiceRegister).toHaveBeenCalledTimes(0);
        spyTServiceRegister.mockClear();
      })
      .end(done);
  });

  it('Register teacher and students with invalid email', (done: CallbackHandler) => {
    const spyTServiceRegister = jest.spyOn(teacherService, 'register');
    return request(app.use(routes))
      .post('/api/register')
      .send({
        teacher: 'registerTeachergmail.com',
        students: [
          'studentjon@gmail.com',
          'studenthon1n@gmail.com',
          'studentheaan@gmail.com',
        ],
      })
      .expect(400)
      .expect((res) => {
        expect(
          (res.body &&
            res.body.details &&
            res.body.details[0] &&
            res.body.details[0].message &&
            res.body.details[0].message.includes('must be a valid email')) ||
            false
        ).toBeTruthy();
        expect(spyTServiceRegister).toHaveBeenCalledTimes(0);
        spyTServiceRegister.mockClear();
      })
      .end(done);
  });

  it('Get common Students with one teacher', (done: CallbackHandler) => {
    // const spyTServiceCommonStudents = jest.spyOn(teacherService, "getCommonStudents")
    return request(app.use(routes))
      .get('/api/commonstudents')
      .query({
        teacher: teacherJson[0].email,
      })
      .expect(200)
      .expect((res) => {
        const students = teacherJson[0].students.map((s: any) => s.email);
        expect(res.body.data).toStrictEqual({ students });
        // expect(spyTServiceCommonStudents).toHaveBeenCalledTimes(1);
        // spyTServiceCommonStudents.mockClear();
      })
      .end(done);
  });

  it('Get common Students with one teacher fail with unregistered teacher email', (done: CallbackHandler) => {
    // const spyTServiceCommonStudents2 = jest.spyOn(teacherService, "getCommonStudents")
    const unregistered = 'testunregistered@gmail.com';
    return request(app.use(routes))
      .get('/api/commonstudents')
      .query({
        teacher: unregistered,
      })
      .expect((res) => {
        expect(
          (res.body &&
            res.body.error &&
            res.body.error.message &&
            res.body.error.message.includes('Teacher does not exist.')) ||
            false
        ).toBeTruthy();
        // expect(spyTServiceCommonStudents2).toHaveBeenCalledTimes(1);
        // spyTServiceCommonStudents2.mockClear();
      })
      .expect(400)
      .end(done);
  });

  it('Get common Students with two teacher', (done: CallbackHandler) => {
    const spyTServiceCommonStudents = jest.spyOn(
      teacherService,
      'getCommonStudents'
    );
    return request(app.use(routes))
      .get('/api/commonstudents')
      .query({
        teacher: [teacherJson[0].email, teacherJson[1].email],
      })
      .expect(200)
      .expect((res) => {
        const commonStudent = teacherJson[0].students[1].email;
        expect(res.body.data).toStrictEqual({ students: [commonStudent] });
        expect(spyTServiceCommonStudents).toHaveBeenCalledTimes(1);
        spyTServiceCommonStudents.mockClear();
      })
      .end(done);
  });

  it('Get common Students with two teacher with one invalid teacher email', (done: CallbackHandler) => {
    const spyTServiceCommonStudents = jest.spyOn(
      teacherService,
      'getCommonStudents'
    );
    return request(app.use(routes))
      .get('/api/commonstudents')
      .query({
        teacher: [
          teacherJson[0].email.replace('@', ''),
          teacherJson[1].email.replace('@', ''),
        ],
      })
      .expect(400)
      .expect((res) => {
        expect(
          (res.body &&
            res.body.details &&
            res.body.details[0] &&
            res.body.details[0].message &&
            res.body.details[0].message.includes('must be a string')) ||
            false
        ).toBeTruthy();
        expect(
          (res.body &&
            res.body.details &&
            res.body.details[1] &&
            res.body.details[1].message &&
            res.body.details[1].message.includes('must be a valid email')) ||
            false
        ).toBeTruthy();
        expect(spyTServiceCommonStudents).toHaveBeenCalledTimes(0);
        spyTServiceCommonStudents.mockClear();
      })
      .end(done);
  });

  it('Suspend student', (done: CallbackHandler) => {
    // const spyTServiceSuspendStudent = jest.spyOn(teacherService, "suspendStudent")
    const studentEmail = teacherJson[0].students[0].email;
    return request(app.use(routes))
      .post('/api/suspend')
      .send({
        student: studentEmail,
      })
      .expect(204)
      .expect(async () => {
        const student = await connection
          .getRepository(Student)
          .findOne({ email: studentEmail });
        expect(student.isActive).toBe(false);
        // expect(spyTServiceSuspendStudent).toHaveBeenCalledTimes(1);
        // spyTServiceSuspendStudent.mockClear();
      })
      .end(done);
  });

  it('Suspend student fail with invalid email', (done: CallbackHandler) => {
    // const spyTServiceSuspendStudent = jest.spyOn(teacherService, "suspendStudent")
    const invalidEmail = teacherJson[0].students[0].email.replace('@', '');
    return request(app.use(routes))
      .post('/api/suspend')
      .send({
        student: invalidEmail,
      })
      .expect(400)
      .expect((res) => {
        expect(
          (res.body &&
            res.body.details &&
            res.body.details[0] &&
            res.body.details[0].message &&
            res.body.details[0].message.includes('must be a valid email')) ||
            false
        ).toBeTruthy();
        // expect(spyTServiceSuspendStudent).toHaveBeenCalledTimes(0);
        // spyTServiceSuspendStudent.mockClear();
      })
      .end(done);
  });

  it('Suspend student fail with unregistered email', (done: CallbackHandler) => {
    // const spyTServiceSuspendStudent = jest.spyOn(teacherService, "suspendStudent")
    const unregistered = 'testunregistered@gmail.com';
    return request(app.use(routes))
      .post('/api/suspend')
      .send({
        student: unregistered,
      })
      .expect(400)
      .expect((res) => {
        expect(
          (res.body &&
            res.body.error &&
            res.body.error.message &&
            res.body.error.message.includes('Student does not exist.')) ||
            false
        ).toBeTruthy();
        // expect(spyTServiceSuspendStudent).toHaveBeenCalledTimes(1);
        // spyTServiceSuspendStudent.mockClear();
      })
      .end(done);
  });

  it('Retrieve notification with suspended student and unregistered student', (done: CallbackHandler) => {
    // const spyTServiceRetrieveNotif = jest.spyOn(teacherService, "retrieveForNotifications")
    const students = [
      teacherJson[0].students[0].email,
      teacherJson[0].students[1].email,
      'studentheaan@gmail.com',
    ];
    const unregisteredSEmail = 'studenthon1n@gmail.com';
    const suspendedEmail = teacherJson[0].students[2].email;
    return request(app.use(routes))
      .post('/api/retrievefornotifications')
      .send({
        teacher: teacherJson[0].email,
        notification: `Hello students! @${students[0]} @${students[1]} 
                @${students[2]} @${unregisteredSEmail} @${suspendedEmail}`,
      })
      .expect(200)
      .expect((res) => {
        expect(
          res.body.data.recipients.every((i: string) => students.includes(i))
        ).toBeTruthy();
        // expect(spyTServiceRetrieveNotif).toHaveBeenCalledTimes(1);
        // spyTServiceRetrieveNotif.mockClear();
      })
      .end(done);
  });

  it('Retrieve notification with unregistered teacher', (done: CallbackHandler) => {
    // const spyTServiceRetrieveNotif = jest.spyOn(teacherService, "retrieveForNotifications")
    const students = [
      teacherJson[0].students[0].email,
      teacherJson[0].students[1].email,
      'studentheaan@gmail.com',
    ];
    return request(app.use(routes))
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'testunregistered@gmail.com',
        notification: `Hello students! @${students[0]} @${students[1]} 
                @${students[2]}`,
      })
      .expect(400)
      .expect((res) => {
        expect(
          (res.body &&
            res.body.error &&
            res.body.error.message &&
            res.body.error.message.includes('Teacher does not exist.')) ||
            false
        ).toBeTruthy();
        // expect(spyTServiceRetrieveNotif).toHaveBeenCalledTimes(1);
        // spyTServiceRetrieveNotif.mockClear();
      })
      .end(done);
  });
});

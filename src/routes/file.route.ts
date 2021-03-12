import express from 'express';
import { downloadAuthentication } from '../middlewares/authenticationMiddleware';
const path = require('path');

const passport = require('passport');
const router = express.Router();
const fs = require('fs');

// ================================ TRANSCRIPTS ================================
router.get(
  '/transcript/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  downloadAuthentication, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ CV ================================
router.get(
  '/cv/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  downloadAuthentication, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ PROFILE IMG ================================
router.get('/dp/*', express.static(path.join(__dirname, '../../uploads')));

router.get('/course/*', express.static(path.join(__dirname, '../../uploads')));

router.get('/course/lesson/video/:videoName', (req, res) => {
  const { videoName } = req.params;
  const folderPath = path.join(__dirname, '../../uploads/course/lesson/video');
  const file = path.resolve(folderPath, videoName);
  fs.stat(file, function (err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 Error if file not found
        return res.sendStatus(404);
      }
      res.end(err);
    }
    const range = req.headers.range;
    if (!range) {
      // 416 Wrong range
      return res.sendStatus(416);
    }
    const positions = range.replace(/bytes=/, '').split('-');
    const start = parseInt(positions[0], 10);
    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });

    const stream = fs
      .createReadStream(file, { start: start, end: end })
      .on('open', function () {
        stream.pipe(res);
      })
      .on('error', function (err) {
        res.end(err);
      });
  });
});

export default router;

import logger from '../config/logger';
const fs = require('fs');
const path = require('path');
export class FileController {
  public static async serveVideo(req, res) {
    const _path = path.join(__dirname, `../../uploads${req.path}`); // req.path example : '/course/lesson/video/<id>.mp4'
    const file = path.resolve(_path); // Getting the file
    fs.stat(file, function (err, stats) {
      if (err) {
        logger.error('[fileController.serveVideo]:' + err.message);
        if (err.code === 'ENOENT') {
          // 404 Error if file not found
          return res.sendStatus(404);
        }
        res.end(err);
      }
      const range = req.headers.range;
      if (!range) {
        // 416 Wrong range
        logger.error('[fileController.serveVideo]: Wrong range');
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
        'Content-Type': 'video/mov',
      });

      const stream = fs
        .createReadStream(file, { start: start, end: end })
        .on('open', function () {
          stream.pipe(res);
        })
        .on('error', function (err) {
          logger.error('[fileController.serveVideo]:' + err.message);
          res.end(err);
        });
    });
  }
}

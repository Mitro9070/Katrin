const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(cors());

const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync('webdav.log', logMessage);
};

const webdavUrl = "https://nas.katusha-print.ru:5356/Exchange";
const username = "Siteman";
const password = '\\\\sn~4SN4'; // Обратите внимание на четверной слэш

app.get('/api/webdav', async (req, res) => {
    log('Получен запрос к /api/webdav');

    try {
        const response = await axios({
            method: 'PROPFIND',
            url: webdavUrl,
            headers: {
                'Depth': '1',
                'Content-Type': 'application/xml',
            },
            auth: {
                username: username,
                password: password,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });

        log(`Статус ответа: ${response.status}`);
        log(`Заголовки ответа: ${JSON.stringify(response.headers)}`);

        res.set('Content-Type', 'application/xml');
        res.send(response.data);
        log('Ответ отправлен клиенту');
    } catch (error) {
        log(`Ошибка при выполнении запроса к WebDAV: ${error.message}`);
        if (error.response) {
            log(`Статус ошибки: ${error.response.status}`);
            log(`Данные ошибки: ${error.response.data && JSON.stringify(error.response.data, Object.getOwnPropertyNames(error.response.data))}`);
        }
        res.status(500).json({ error: 'Ошибка при выполнении запроса к WebDAV', details: error.message });
    }
});

app.get('/api/webdav/folder', async (req, res) => {
    const folderName = req.query.name;
    log(`Получен запрос на содержимое папки: ${folderName}`);

    try {
        const response = await axios({
            method: 'PROPFIND',
            url: `${webdavUrl}/${folderName}`,
            headers: {
                'Depth': '1',
                'Content-Type': 'application/xml',
            },
            auth: {
                username: username,
                password: password,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });

        log(`Статус ответа: ${response.status}`);
        log(`Заголовки ответа: ${JSON.stringify(response.headers)}`);

        res.set('Content-Type', 'application/xml');
        res.send(response.data);
        log('Ответ отправлен клиенту');
    } catch (error) {
        log(`Ошибка при выполнении запроса к WebDAV: ${error.message}`);
        if (error.response) {
            log(`Статус ошибки: ${error.response.status}`);
            log(`Данные ошибки: ${error.response.data && JSON.stringify(error.response.data, Object.getOwnPropertyNames(error.response.data))}`);
        }
        res.status(500).json({ error: 'Ошибка при выполнении запроса к WebDAV', details: error.message });
    }
});

app.get('/api/webdav/download', async (req, res) => {
  let filePath = req.query.file;
  log(`Получен запрос на скачивание файла: ${filePath}`);

  // Удаляем префикс /Exchange из filePath, если он есть
  filePath = filePath.replace(/^\/?Exchange\/?/, '');

  // Удаляем ведущий слэш, если он есть
  if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
  }

  try {
      const response = await axios({
          method: 'GET',
          url: `${webdavUrl}/${filePath}`,
          responseType: 'stream',
          auth: {
              username: username,
              password: password,
          },
          httpsAgent: new https.Agent({
              rejectUnauthorized: false,
          }),
      });

      log(`Статус ответа: ${response.status}`);
      log(`Заголовки ответа: ${JSON.stringify(response.headers)}`);

      const fileName = filePath.split('/').pop();

      // Правильная установка заголовка Content-Disposition
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

      response.data.pipe(res);
      log('Ответ клиенту отправлен, файл в процессе передачи');
  } catch (error) {
      log(`Ошибка при выполнении запроса к WebDAV: ${error.message}`);
      if (error.response) {
          log(`Статус ошибки: ${error.response.status}`);
          log(`Данные ошибки: ${error.response.data && JSON.stringify(error.response.data)}`);
      }
      res.status(500).json({ error: 'Ошибка при выполнении запроса к WebDAV', details: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => log(`Сервер запущен на порту ${PORT}`));
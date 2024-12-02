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
      log(`Данные ошибки: ${JSON.stringify(error.response.data)}`);
    }
    res.status(500).json({ error: 'Ошибка при выполнении запроса к WebDAV', details: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => log(`Сервер запущен на порту ${PORT}`));
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${message}`);
};

const serverUrl = 'https://192.168.19.179:4000';

export const connectToWebDAV = async () => {
  log('Начало подключения к WebDAV...');

  try {
    log('Отправка запроса на получение содержимого корневой директории...');
    const response = await fetch(`${serverUrl}/api/webdav`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    log('Ответ получен. Длина XML: ' + xmlText.length);

    log('Начало парсинга XML');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    const responses = xmlDoc.getElementsByTagName('D:response');
    const directoryItems = Array.from(responses).map((response) => {
      const href = response.getElementsByTagName('D:href')[0].textContent;
      const propstat = response.getElementsByTagName('D:propstat')[0];
      const prop = propstat.getElementsByTagName('D:prop')[0];
      const resourcetype = prop.getElementsByTagName('lp1:resourcetype')[0] || prop.getElementsByTagName('D:resourcetype')[0];
      const isCollection = resourcetype?.getElementsByTagName('D:collection').length > 0;

      return {
        filename: href.split('/').pop() || '/',
        basename: href,
        lastmod: prop.getElementsByTagName('lp1:getlastmodified')[0]?.textContent,
        size: prop.getElementsByTagName('lp1:getcontentlength')[0]?.textContent,
        type: isCollection ? 'directory' : 'file',
      };
    });

    log('Парсинг XML завершен');
    log(`Количество элементов в директории: ${directoryItems.length}`);

    directoryItems.forEach((item, index) => {
      log(`Элемент ${index + 1}: ${JSON.stringify(item)}`);
    });

    return directoryItems;
  } catch (error) {
    log('Ошибка при получении содержимого директории: ' + error.message);
    log('Детали ошибки: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

export const getFolderContents = async (folderName) => {
  log(`Начало получения содержимого папки: ${folderName}...`);

  try {
    log('Отправка запроса на получение содержимого папки...');
    const response = await fetch(`${serverUrl}/api/webdav/folder?name=${encodeURIComponent(folderName)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    log('Ответ получен. Длина XML: ' + xmlText.length);

    log('Начало парсинга XML');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    const responses = xmlDoc.getElementsByTagName('D:response');
    const directoryItems = Array.from(responses).map((response) => {
      const href = response.getElementsByTagName('D:href')[0].textContent;
      const propstat = response.getElementsByTagName('D:propstat')[0];
      const prop = propstat.getElementsByTagName('D:prop')[0];
      const resourcetype = prop.getElementsByTagName('lp1:resourcetype')[0] || prop.getElementsByTagName('D:resourcetype')[0];
      const isCollection = resourcetype?.getElementsByTagName('D:collection').length > 0;

      return {
        filename: href.split('/').pop() || '/',
        basename: href,
        lastmod: prop.getElementsByTagName('lp1:getlastmodified')[0]?.textContent,
        size: prop.getElementsByTagName('lp1:getcontentlength')[0]?.textContent,
        type: isCollection ? 'directory' : 'file',
      };
    });

    log('Парсинг XML завершен');
    log(`Количество элементов в директории: ${directoryItems.length}`);

    directoryItems.forEach((item, index) => {
      log(`Элемент ${index + 1}: ${JSON.stringify(item)}`);
    });

    return directoryItems;
  } catch (error) {
    log('Ошибка при получении содержимого папки: ' + error.message);
    log('Детали ошибки: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

export const downloadFile = async (filePath) => {
  log(`Начало скачивания файла: ${filePath}...`);

  // Удаляем лишние префиксы из filePath
  const cleanFilePath = filePath.replace(/^\/?Exchange\/?/, '');

  try {
    log('Отправка запроса на скачивание файла...');
    const response = await fetch(`${serverUrl}/api/webdav/download?file=${encodeURIComponent(cleanFilePath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilePath.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    log('Файл успешно скачан');
  } catch (error) {
    log('Ошибка при скачивании файла: ' + error.message);
    log('Детали ошибки: ' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${message}`);
};

export const connectToWebDAV = async () => {
  log('Начало подключения к WebDAV...');

  try {
    log('Отправка запроса на получение содержимого корневой директории...');
    const response = await fetch('http://localhost:3001/api/webdav');

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
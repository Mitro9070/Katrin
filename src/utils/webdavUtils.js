// src/utils/webdavUtils.js

export const connectToWebDAV = async () => {
    console.log('Начало подключения к WebDAV...');

    try {
        console.log('Отправка запроса на получение содержимого корневой директории...');
        const response = await fetch('https://intranet.corp.katusha-it.ru/api/webdav');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();
        console.log('Ответ получен. Содержимое директории (XML):', xmlText);

        // Здесь можно добавить парсинг XML в объекты JavaScript
        // Например, используя DOMParser:
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const directoryItems = Array.from(xmlDoc.getElementsByTagName('d:response')).map(response => {
            const href = response.getElementsByTagName('d:href')[0].textContent;
            const propstat = response.getElementsByTagName('d:propstat')[0];
            const prop = propstat.getElementsByTagName('d:prop')[0];
            const isCollection = prop.getElementsByTagName('d:resourcetype')[0].getElementsByTagName('d:collection').length > 0;

            return {
                filename: href.split('/').pop() || '/',
                basename: href,
                lastmod: prop.getElementsByTagName('d:getlastmodified')[0]?.textContent,
                size: prop.getElementsByTagName('d:getcontentlength')[0]?.textContent,
                type: isCollection ? 'directory' : 'file'
            };
        });

        console.log('Parsed directory items:', JSON.stringify(directoryItems, null, 2));
        console.log('Количество элементов в директории:', directoryItems.length);

        directoryItems.forEach((item, index) => {
            console.log(`Элемент ${index + 1}:`, JSON.stringify(item, null, 2));
        });

        return directoryItems;
    } catch (error) {
        console.error('Ошибка при получении содержимого директории:', error);
        console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        throw error;
    }
};
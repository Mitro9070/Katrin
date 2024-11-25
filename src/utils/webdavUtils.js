// src/utils/webdavUtils.js
import { createClient } from 'webdav';

export const connectToWebDAV = async () => {
    console.log('Начало подключения к WebDAV...');
    
    const client = createClient(
        'https://192.168.19.14:5356',
        {
            username: 'Siteman',
            password: '\\sn~4SN4'
        }
    );

    console.log('Клиент WebDAV создан. Начинаем получение содержимого директории...');

    try {
        console.log('Отправка запроса на получение содержимого корневой директории...');
        const directoryItems = await client.getDirectoryContents('/');
        
        console.log('Ответ получен. Содержимое директории:', JSON.stringify(directoryItems, null, 2));
        
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
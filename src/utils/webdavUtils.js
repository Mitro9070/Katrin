// src/utils/webdavUtils.js
import { createClient } from 'webdav';

export const connectToWebDAV = async () => {
    const client = createClient(
        'https://192.168.19.14:5356',
        {
            username: 'Siteman',
            password: '\\sn~4SN4'
        }
    );

    try {
        const directoryItems = await client.getDirectoryContents('/');
        return directoryItems;
    } catch (error) {
        console.error('Ошибка при получении содержимого директории:', error);
        throw error;
    }
};
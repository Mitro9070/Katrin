import express from 'express';
import { connectToWebDAV, getFolderContents, downloadFile } from '../utils/webdavUtils';

const router = express.Router();

// Эндпоинт для получения содержимого корневой директории
router.get('/api/webdav', async (req, res) => {
    try {
        const data = await connectToWebDAV();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении данных с WebDAV', details: error.message });
    }
});

// Эндпоинт для получения содержимого конкретной папки
router.get('/api/webdav/folder', async (req, res) => {
    const folderName = req.query.name;
    try {
        const data = await getFolderContents(folderName);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении данных с WebDAV', details: error.message });
    }
});

// Эндпоинт для скачивания указанного файла
router.get('/api/webdav/download', async (req, res) => {
    const filePath = req.query.file;
    try {
        const data = await downloadFile(filePath);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении данных с WebDAV', details: error.message });
    }
});

export default router;
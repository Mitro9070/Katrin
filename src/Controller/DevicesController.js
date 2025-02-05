// DevicesController.js

import axios from 'axios';
import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

export const getDevices = async (page, type) => {
    const token = Cookies.get('token');
    try {
        let url = `${serverUrl}/api/devices?page=${page}`;
        if (type && type !== 'All') {
            url += `&type=${encodeURIComponent(type)}`;
        }
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getDeviceById = async (deviceId) => {
    const token = Cookies.get('token');
    try {
        const response = await axios.get(`${serverUrl}/api/devices/${deviceId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteDevice = async (deviceId) => {
    const token = Cookies.get('token');
    try {
        await axios.delete(`${serverUrl}/api/devices/${deviceId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const createDevice = async (deviceData) => {
    const token = Cookies.get('token');
    try {
        const formData = new FormData();

        formData.append('name', deviceData.name);
        formData.append('description', deviceData.description);
        formData.append('type', deviceData.type);
        if (deviceData.options) {
            formData.append('options', JSON.stringify(deviceData.options));
        }

        if (deviceData.main_image && deviceData.main_image instanceof File) {
            formData.append('main_image', deviceData.main_image);
        }

        if (deviceData.images && deviceData.images.length > 0) {
            deviceData.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await axios.post(`${serverUrl}/api/devices`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const editDevice = async (deviceId, deviceData) => {
    const token = Cookies.get('token');
    try {
        const formData = new FormData();

        formData.append('name', deviceData.name);
        formData.append('description', deviceData.description);
        formData.append('type', deviceData.type);

        // Преобразуем объект options в строку JSON
        if (deviceData.options) {
            formData.append('options', JSON.stringify(deviceData.options));
        } else {
            // Если options отсутствует, передаем пустой объект
            formData.append('options', JSON.stringify({}));
        }

        // Добавляем главное изображение
        if (deviceData.main_image) {
            if (deviceData.main_image instanceof File) {
                formData.append('main_image', deviceData.main_image);
            } else {
                // Если главное изображение не изменилось, можно передать URL в existingMainImage
                formData.append('existingMainImage', deviceData.main_image);
            }
        }

        // Добавляем дополнительные изображения
        if (deviceData.images && deviceData.images.length > 0) {
            deviceData.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        // Передаем существующие изображения
        if (deviceData.existingImages && deviceData.existingImages.length > 0) {
            formData.append('existingImages', JSON.stringify(deviceData.existingImages));
        }

        const response = await axios.put(`${serverUrl}/api/devices/${deviceId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // 'Content-Type' не нужно устанавливать вручную
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadDeviceDataFromExcel = async (file, setUploadProgress) => {
    const token = Cookies.get('token');
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${serverUrl}/api/devices/upload-excel`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (setUploadProgress) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
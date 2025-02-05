// OfficesController.js

import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const token = Cookies.get('token');

// Получение всех офисов
export const fetchOffices = async () => {
    const response = await fetch(`${serverUrl}/api/offices`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке офисов');
    }

    const data = await response.json();
    return data; // Возвращаем массив офисов
};

// Получение офиса по ID
export const fetchOfficeById = async (officeId) => {
    const response = await fetch(`${serverUrl}/api/offices/${officeId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке офиса');
    }

    const data = await response.json();
    return data; // Возвращаем объект офиса
};
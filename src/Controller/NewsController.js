// NewsController.js

import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const token = Cookies.get('token');

export const fetchNews = async (page = 1, elementType = '') => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    let url = `${serverUrl}/api/news?page=${page}`;
    if (elementType && elementType !== 'all') {
        url += `&elementtype=${elementType}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке новостей');
    }

    const data = await response.json();
    return data; // Возвращаем весь объект данных
};

// Получение новости по ID
export const fetchNewsById = async (id) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${serverUrl}/api/news/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке новости');
    }
    const data = await response.json();
    return data;
};

// Функция для добавления новой новости
export const addNews = async (formData) => {
    const token = Cookies.get('token');

    const response = await fetch(`${serverUrl}/api/news`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Не устанавливаем 'Content-Type', браузер сам выставит корректный заголовок для FormData
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка при добавлении новости');
    }

    const data = await response.json();
    return data;
};

// Функция для редактирования новости
export const editNews = async (id, formData) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${serverUrl}/api/news/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Не устанавливаем 'Content-Type', браузер сам выставит корректный заголовок для FormData
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка при редактировании новости:', errorText);
        throw new Error('Ошибка при редактировании новости');
    }

    const data = await response.json();
    return data;
};

// Функция для удаления новости
export const deleteNews = async (id) => {
    const token = Cookies.get('token');
    const response = await fetch(`${serverUrl}/api/news/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении новости');
    }

    return { success: true };
};
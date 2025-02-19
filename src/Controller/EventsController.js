// EventsController.js

import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const token = Cookies.get('token');

export const fetchEvents = async (page = 1) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${serverUrl}/api/events?page=${page}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Ошибка при загрузке событий');
    }
    const data = await response.json();
    return data.events;
};

// Функция для получения события по ID
export const fetchEventById = async (id) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${serverUrl}/api/events/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Ошибка при загрузке события');
    }
    const data = await response.json();
    return data;
};

// Функция для добавления нового события
export const addEvent = async (formData) => {
    
    const token = Cookies.get('token');

    const response = await fetch(`${serverUrl}/api/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Не устанавливаем 'Content-Type'
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка при добавлении события');
    }

    const data = await response.json();
    return data;
};

// Функция для редактирования события
export const editEvent = async (id, formData) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${serverUrl}/api/events/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type' не устанавливаем для FormData
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка при редактировании события');
    }

    const data = await response.json();
    return data;
};

// Функция для удаления события
export const deleteEvent = async (id) => {
    const token = Cookies.get('token');
    const response = await fetch(`${serverUrl}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении события');
    }

    return { success: true };
};
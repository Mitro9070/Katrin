// src/Controller/TrashController.js

import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const token = Cookies.get('token');

// Получение списка элементов из корзины
export const fetchTrashItems = async (type) => {
    const response = await fetch(`${serverUrl}/api/trash?type=${type}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке элементов из корзины');
    }

    const data = await response.json();
    return data;
};

// Получение элемента корзины по ID
export const fetchTrashItemById = async (id, type) => {
    const response = await fetch(`${serverUrl}/api/trash/${id}?type=${type}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке элемента из корзины');
    }

    const data = await response.json();
    return data;
};

// Восстановление элемента из корзины
export const restoreTrashItem = async (id, type) => {
    const response = await fetch(`${serverUrl}/api/trash/${id}/restore?type=${type}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при восстановлении элемента из корзины');
    }

    const data = await response.json();
    return data;
};

// Удаление элемента из корзины
export const deleteTrashItem = async (id, type) => {
    const response = await fetch(`${serverUrl}/api/trash/${id}?type=${type}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении элемента из корзины');
    }

    const data = await response.json();
    return data;
};

// Очистка всей корзины
export const clearTrash = async (type) => {
    const response = await fetch(`${serverUrl}/api/trash?type=${type}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при очистке корзины');
    }

    const data = await response.json();
    return data;
};
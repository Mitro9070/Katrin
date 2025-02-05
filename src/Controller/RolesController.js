// RolesController.js

import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const token = Cookies.get('token');

// Получение всех ролей
export const fetchRoles = async () => {
    const response = await fetch(`${serverUrl}/api/roles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке ролей');
    }

    const data = await response.json();
    return data; // Возвращаем массив ролей
};

// Получение роли по ID
export const fetchRoleById = async (roleId) => {
    const response = await fetch(`${serverUrl}/api/roles/${roleId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке роли');
    }

    const data = await response.json();
    return data; // Возвращаем объект роли
};
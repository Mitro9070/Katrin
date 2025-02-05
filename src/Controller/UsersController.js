// UsersController.js

import Cookies from 'js-cookie';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const token = Cookies.get('token');

export const fetchUsers = async (page = 1) => {
    const response = await fetch(`${serverUrl}/api/users?page=${page}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Ошибка при загрузке пользователей');
    }
    const data = await response.json();
    return data.users;
};

export const fetchUserById = async (userId) => {
    const response = await fetch(`${serverUrl}/api/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.ok) {
        const userData = await response.json();
        return userData;
    } else if (response.status === 404) {
        // Пользователь не найден
        return null;
    } else {
        throw new Error('Ошибка при загрузке данных пользователя');
    }
};

// Добавляем функцию updateUserById
export const updateUserById = async (userId, userData) => {
    const formData = new FormData();

    for (const key in userData) {
        if (
            userData.hasOwnProperty(key) &&
            userData[key] !== undefined &&
            userData[key] !== null &&
            userData[key] !== ''
        ) {
            if (key === 'image' && userData[key] instanceof File) {
                formData.append('image', userData[key], userData[key].name);
            } else {
                if (key === 'birthday') {
                    console.log('Отправляем дата рождения:', userData[key]);
                }
                formData.append(key, userData[key]);
            }
        }
    }

    const response = await fetch(`${serverUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type' не указываем, чтобы браузер сам установил правильный заголовок
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка при обновлении данных пользователя');
    }

    const updatedUser = await response.json();
    return updatedUser;
};

// Добавляем функцию uploadUserImage
export const uploadUserImage = async (userId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);

    const response = await fetch(`${serverUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Не устанавливаем 'Content-Type', это сделает браузер автоматически
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке изображения пользователя');
    }

    const updatedUser = await response.json();
    return updatedUser.image;
};
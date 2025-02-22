// UsersController.js

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';
const authUrl = process.env.REACT_APP_SERVER_AUTH || '';


export const fetchUsers = async (page = 1) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
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
    const token = Cookies.get('token'); // Получаем токен внутри функции
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
    const token = Cookies.get('token'); // Получаем токен внутри функции
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
    const token = Cookies.get('token'); // Получаем токен внутри функции
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

// Добавляем функцию для добавления нового пользователя
export const addUser = async (userData) => {
   
    const response = await fetch(`${authUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Авторизация не требуется
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error('Ошибка при добавлении пользователя');
    }

    const data = await response.json();
    console.log('Ответ от сервера при регистрации пользователя:', data);

    // Предположим, что сервер возвращает объект с токеном: { token: '...' }
    const token = data.token;

    // Декодируем токен, чтобы получить userId
    const decodedToken = jwtDecode(token);
    console.log('Декодированный токен:', decodedToken);

    // Вернем объект с userId и токеном
    return { userId: decodedToken.userId, token };
};

export const deleteUserById = async (userId) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${serverUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении пользователя');
    }

    return true;
};

export const deleteUserByEmail = async (email) => {
    const token = Cookies.get('token'); // Получаем токен внутри функции
    const response = await fetch(`${authUrl}/api/auth/delete-user/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error('Ошибка при удалении пользователя');
    }

    return true;
};

// Добавляем функцию для получения гостевого токена
export const getGuestToken = async () => {
    try {
        const response = await fetch(`${authUrl}/api/auth/guest-token`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении гостевого токена');
        }

        const data = await response.json();

        const guestToken = data.token;

        // Сохраняем токен в куки
        Cookies.set('token', guestToken);

        // Декодируем токен, чтобы получить userId и роль
        const decodedToken = parseJwt(guestToken);

        const userId = decodedToken.userId || decodedToken.id;
        const roleId = decodedToken.role;

        // Сохраняем userId и roleId в куки
        Cookies.set('userId', userId);
        Cookies.set('roleId', roleId);

        return { userId, roleId, token: guestToken };
    } catch (error) {
        console.error('Ошибка при получении гостевого токена:', error);
        throw error;
    }
};

// Функция для декодирования JWT токена (если не используете библиотеку jwt-decode)
const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Ошибка при декодировании токена:', e);
        return null;
    }
};
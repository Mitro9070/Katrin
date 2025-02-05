import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const isAuthenticated = () => {
    const token = Cookies.get('token');
    if (!token) {
        return false;
    }

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Время в секундах

        if (decodedToken.exp && decodedToken.exp > currentTime) {
            return true;
        } else {
            // Токен истёк
            return false;
        }
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        return false;
    }
};
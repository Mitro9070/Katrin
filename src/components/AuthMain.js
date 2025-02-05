import { useState } from 'react';
import '../styles/AuthPush.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const serverUrl = process.env.REACT_APP_SERVER_AUTH || '';

function AuthMain({ setStage, setShowAuthPush }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при входе в систему. Проверьте логин и пароль.');
                return;
            }

            const data = await response.json();

            // Получаем токен из ответа
            const token = data.token;

            // Сохраняем токен в куки
            Cookies.set('token', token);

            // Декодируем токен для получения userId, email и role
            const decodedToken = jwtDecode(token);

            // Сохраняем данные в куки
            Cookies.set('userId', decodedToken.userId);
            Cookies.set('email', decodedToken.email);
            Cookies.set('roleId', decodedToken.role);



            // Закрываем окно аутентификации и обновляем страницу
            setShowAuthPush(false);
            navigate(0); // Перезагрузка страницы
        } catch (error) {
            console.error('Ошибка при входе в систему:', error);
            setError('Ошибка при входе в систему. Проверьте логин и пароль.');
        }
    };

    return (
        <>
            <p className="auth-push-title">Вход</p>
            <div className="auth-push-input">
                <input
                    type="email"
                    placeholder="Логин"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="auth-push-input">
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {error && <p className="auth-push-error">{error}</p>}
            <div className="auth-push-btn-auth" onClick={handleLogin}>
                <p className="auth-push-btn-auth-text">Войти</p>
            </div>
            <p className="auth-push-remember-btn">Восстановить пароль</p>
        </>
    );
}

export default AuthMain;
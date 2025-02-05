import { useState } from 'react';
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';

const serverUrl = process.env.REACT_APP_SERVER_AUTH || '';

function AuthRegister({ setStage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    name: name,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при регистрации. Попробуйте снова.');
                return;
            }
    
            const data = await response.json();
    
            // Получаем токен из ответа
            const token = data.token;
    
            // Сохраняем токен в куки
            Cookies.set('token', token);
    
            // Декодируем токен для получения userId, email и role
            const decodedToken = jwt_decode(token);
    
            // Сохраняем данные в куки
            Cookies.set('userId', decodedToken.userId);
            Cookies.set('email', decodedToken.email);
            Cookies.set('role', decodedToken.role);
    
            // Переходим на главную страницу или закрываем окно регистрации
            setStage('AuthMain');
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            setError('Ошибка при регистрации. Попробуйте снова.');
        }
    };

    return (
        <>
            <p className="auth-push-title">Регистрация</p>
            <div className="auth-push-input auth-push-input-name">
                <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="auth-push-input auth-push-input-login">
                <input
                    type="email"
                    placeholder="Логин"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="auth-push-input auth-push-input-password">
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {error && <p className="auth-push-error">{error}</p>}
            <div className="auth-push-btn-auth" onClick={handleRegister}>
                <p className="auth-push-btn-auth-text">Зарегистрироваться</p>
            </div>
            <p className="auth-push-login-btn" onClick={() => setStage('AuthMain')}>Войти</p>
        </>
    );
}

export default AuthRegister;
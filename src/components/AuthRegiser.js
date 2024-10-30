import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from '../firebaseConfig';

function AuthRegister({ setStage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Сохраняем пользователя в Realtime Database
            await set(ref(database, `Users/${user.uid}`), {
                Name: name,
                email: email,
                role: 'user' // Присваиваем роль по умолчанию
            });

            setStage('AuthMain');
        } catch (error) {
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
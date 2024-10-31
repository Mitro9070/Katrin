import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../styles/AuthPush.css';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';

function AuthMain({ setStage, setShowAuthPush }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const auth = getAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Удаляем старые куки
            Cookies.remove('userId');
            Cookies.remove('roleId');
            Cookies.remove('roleName');

            // Получаем данные пользователя и его роль
            const userRef = ref(database, `Users/${user.uid}`);
            const userSnapshot = await get(userRef);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                const roleRef = ref(database, `Roles/${userData.role}`);
                const roleSnapshot = await get(roleRef);
                if (roleSnapshot.exists()) {
                    const roleData = roleSnapshot.val();
                    // Сохраняем ID пользователя, ID роли и название роли в куки
                    Cookies.set('userId', user.uid);
                    Cookies.set('roleId', userData.role);
                    //Cookies.set('roleName', roleData.rusname);
                }
            }

            setShowAuthPush(false);
            navigate(0); // Перезагрузка страницы
        } catch (error) {
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
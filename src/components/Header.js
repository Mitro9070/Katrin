import '../styles/Header.css';
import { useState, useEffect, useRef } from 'react';  // Импорт useRef для доступа к DOM
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import notificationImg from '../images/notification.svg';
import NotificationPush from './NotificationPush';
import Cookies from 'js-cookie';
import SearchBar from './SearchBar'; // Импортируем компонент поиска

function Header({ setShowAuthPush }) {
    const [ShowNotificationsSettings, setShowNotificationsSettings] = useState(false);
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userColor, setUserColor] = useState('');
    const [roleName, setRoleName] = useState('');
    const navigate = useNavigate();

    // Используем useRef для определения области меню пользователя
    const userMenuRef = useRef(null);

    useEffect(() => {
        const storedUserId = Cookies.get('userId');

        if (storedUserId) {
            const userRef = ref(database, `Users/${storedUserId}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setUser(userData);
                    setUserColor('#' + Math.floor(Math.random() * 16777215).toString(16));

                    const roleRef = ref(database, `Roles/${userData.role}`);
                    get(roleRef).then((roleSnapshot) => {
                        if (roleSnapshot.exists()) {
                            const roleData = roleSnapshot.val();
                            setRoleName(roleData.rusname);
                            Cookies.set('roleName', roleData.rusname);
                        }
                    });
                }
            });
        }
    }, []);

    const setShowNotificationsSettingsHandler = () => {
        setShowNotificationsSettings(!ShowNotificationsSettings);
    };

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                setUser(null);
                Cookies.remove('userId');
                Cookies.remove('roleId');
                Cookies.remove('roleName');
                navigate('/'); // Перенаправляем на главную страницу
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    };

    const getInitials = (name, surname) => {
        if (!name || !surname) return '';
        return `${name[0]}${surname[0]}`;
    };

    const handleClickOutside = (event) => {
        // Закрываем меню, если клик был вне его области
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
            setShowUserMenu(false);
        }
    };

    useEffect(() => {
        // Добавляем обработчик кликов
        document.addEventListener('mousedown', handleClickOutside);

        // Удаляем обработчик кликов при размонтировании
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="header">
            <SearchBar />
            <div
                className="header-user"
                onClick={() => setShowUserMenu(!showUserMenu)}
            >
                {user ? (
                    user.image ? (
                        <img
                            src={user.image}
                            alt="User"
                            className="header-user-img"
                        />
                    ) : (
                        <div
                            className="header-user-initials"
                            style={{ backgroundColor: userColor }}
                        >
                            {getInitials(user.Name, user.surname)}
                        </div>
                    )
                ) : (
                    <div
                        className="header-follow"
                        onClick={() => setShowAuthPush(true)}
                    >
                        <p>Войти</p>
                    </div>
                )}
                {showUserMenu && user && (
                    <div className="header-user-menu" ref={userMenuRef}>
                        <div className="header-user-menu-item">{`${user.Name || ''} ${user.surname || ''}`}</div>
                        <div className="header-user-menu-item">{roleName}</div>
                        <div className="header-user-menu-item">Мой профиль</div>
                        <div
                            className="header-user-menu-item"
                            onClick={handleSignOut}
                        >
                            Выход
                        </div>
                    </div>
                )}
            </div>
            <div
                className="header-notifications"
                onClick={() => setShowNotificationsSettingsHandler()}
            >
                <img src={notificationImg} alt="Notifications" />
            </div>
            {ShowNotificationsSettings && (
                <NotificationPush
                    setShowAuthPush={setShowAuthPush}
                    setShowNotiPush={setShowNotificationsSettingsHandler}
                />
            )}
        </div>
    );
}

export default Header;
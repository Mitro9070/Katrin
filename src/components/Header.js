import { useState, useEffect, useRef } from 'react';  // Импорт useRef для доступа к DOM
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import notificationImg from '../images/notification.svg';
import NotificationPush from './NotificationPush';
import '../styles/Header.css';
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
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                position: 'fixed',
                top: 0,
                left: '285px',
                width: 'calc(100% - 285px)',
                height: '70px',
                backgroundColor: '#FFFFFF',
                zIndex: 999,
                padding: '0 30px', // Отступы по горизонтали
            }}
        >
            {/* Поиск */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <SearchBar />
            </div>

            {/* Колокольчик уведомлений */}
            <div
                onClick={setShowNotificationsSettingsHandler}
                style={{
                    cursor: 'pointer',
                    marginRight: '30px', // Отступ справа между колокольчиком и иконкой пользователя
                }}
            >
                <img
                    src={notificationImg}
                    alt="Notifications"
                    style={{ width: '34px', height: '34px' }}
                />
            </div>

            {/* Аватар пользователя или кнопка "Войти" */}
            <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                    cursor: 'pointer',
                    position: 'relative',
                }}
            >
                {user ? (
                    user.image ? (
                        <img
                            src={user.image}
                            alt="User"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '140px'
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: userColor,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '18px',
                                fontWeight: '500',
                                color: '#FFFFFF',
                            }}
                        >
                            {getInitials(user.Name, user.surname)}
                        </div>
                    )
                ) : (
                    <div
                        onClick={() => setShowAuthPush(true)}
                        style={{
                            border: '1px solid #0C8CE9',
                            borderRadius: '20px',
                            padding: '7px 20px',
                            color: '#0C8CE9',
                            cursor: 'pointer',
                        }}
                    >
                        <p style={{ margin: 0 }}>Войти</p>
                    </div>
                )}
                {showUserMenu && user && (
                    <div
                        ref={userMenuRef}
                        style={{
                            position: 'absolute',
                            top: '50px',
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 100,
                            width: '200px',
                        }}
                    >
                        <div
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #ddd',
                            }}
                        >
                            {`${user.Name || ''} ${user.surname || ''}`}
                        </div>
                        <div
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #ddd',
                            }}
                        >
                            {roleName}
                        </div>
                        <div
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #ddd',
                            }}
                        >
                            Мой профиль
                        </div>
                        <div
                            style={{
                                padding: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={handleSignOut}
                        >
                            Выход
                        </div>
                    </div>
                )}
            </div>

            {/* Компонент уведомлений (если открыт) */}
            {ShowNotificationsSettings && (
                <NotificationPush
                    setShowAuthPush={setShowAuthPush}
                    setShowNotiPush={setShowNotificationsSettingsHandler}
                />
            )}
        </div>
    );
}

// Add this line at the end to export the Header component
export default Header;
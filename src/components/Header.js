import '../styles/Header.css';
import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import notificationImg from '../images/notification.svg';
import NotificationPush from './NotificationPush';
import Cookies from 'js-cookie';

function Header({ setShowAuthPush }) {
    const [ShowNotificationsSettings, setShowNotificationsSettings] = useState(false);
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userColor, setUserColor] = useState('');
    const [roleName, setRoleName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = Cookies.get('userId');
        const storedRoleName = Cookies.get('roleName');

        if (storedUserId) {
            setUser({ id: storedUserId });
            setUserColor('#' + Math.floor(Math.random() * 16777215).toString(16));
            setRoleName(storedRoleName);
        }
    }, []);

    const setShowNotificationsSettingsHandler = () => {
        setShowNotificationsSettings(() => !ShowNotificationsSettings);
    };

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            setUser(null);
            Cookies.remove('userId');
            Cookies.remove('roleId');
            Cookies.remove('permissions');
            Cookies.remove('roleName');
            navigate(0); // Перезагрузка страницы
        }).catch((error) => {
            console.error('Ошибка при выходе из системы:', error);
        });
    };

    const getInitials = (name, surname) => {
        if (!name || !surname) return '';
        return `${name[0]}${surname[0]}`;
    };

    return (
        <div className="header">
            <div className="header-search">
                <p>Поиск</p>
            </div>
            <div className="header-user" onClick={() => setShowUserMenu(!showUserMenu)}>
                {user ? (
                    user.image ? (
                        <img src={user.image} alt="User" className="header-user-img" />
                    ) : (
                        <div className="header-user-initials" style={{ backgroundColor: userColor }}>
                            {getInitials(user.Name, user.surname)}
                        </div>
                    )
                ) : (
                    <div className="header-follow" onClick={() => setShowAuthPush(true)}>
                        <p>Подписаться</p>
                    </div>
                )}
                {showUserMenu && user && (
                    <div className="header-user-menu">
                        <div className="header-user-menu-item">{`${user.Name || ''} ${user.surname || ''}`}</div>
                        <div className="header-user-menu-item">{roleName}</div>
                        <div className="header-user-menu-item">Мой профиль</div>
                        <div className="header-user-menu-item" onClick={handleSignOut}>Выход</div>
                    </div>
                )}
            </div>
            <div className="header-notifications" onClick={() => setShowNotificationsSettingsHandler()}>
                <img src={notificationImg} alt="Notifications" />
            </div>
            {ShowNotificationsSettings && (
                <NotificationPush setShowAuthPush={setShowAuthPush} setShowNotiPush={setShowNotificationsSettingsHandler} />
            )}
        </div>
    );
}

export default Header;
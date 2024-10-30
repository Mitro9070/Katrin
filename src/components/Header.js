import '../styles/Header.css';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebaseConfig';
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
        const auth = getAuth();
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
                        }
                    });
                }
            });
        }

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(database, `Users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setUser(userData);
                    setUserColor('#' + Math.floor(Math.random() * 16777215).toString(16));
                    Cookies.set('userId', user.uid);

                    const roleRef = ref(database, `Roles/${userData.role}`);
                    const roleSnapshot = await get(roleRef);
                    if (roleSnapshot.exists()) {
                        const roleData = roleSnapshot.val();
                        setRoleName(roleData.rusname);
                        Cookies.set('permissions', JSON.stringify(roleData.permissions));
                    }
                }
                setShowUserMenu(false); // Закрываем меню по умолчанию
                const currentPage = Cookies.get('currentPage');
                if (!currentPage || currentPage === '/') {
                    navigate('/'); // Переходим на главную страницу
                }
            } else {
                setUser(null);
                Cookies.remove('userId');
                Cookies.remove('permissions');
            }
        });
    }, [navigate]);

    const setShowNotificationsSettingsHandler = () => {
        setShowNotificationsSettings(() => !ShowNotificationsSettings);
    };

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            setUser(null);
            Cookies.remove('userId');
            Cookies.remove('permissions');
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
import '../styles/Header.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationImg from '../images/notification.svg';
import mailIcon from '../images/mail.png';
import openEmailIcon from '../images/open-email.png';
import trashIcon from '../images/trash-delete.png';
import Cookies from 'js-cookie';
import SearchBar from './SearchBar';
import NotificationsListener from '../utils/NotificationsListener';
import Modal from '../modal/Modal';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

function Header({ setShowAuthPush }) {
    const [user, setUser] = useState(null);
    const [roleName, setRoleName] = useState('');
    const [userColor, setUserColor] = useState('');
    const [userImageSrc, setUserImageSrc] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    const userId = Cookies.get('userId');
    const token = Cookies.get('token');
    const roleId = Cookies.get('roleId') || '2'; // Получаем роль пользователя из куки
    console.log('айдишечкапользователя2:', roleId);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationsList, setShowNotificationsList] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [areAllChecked, setAreAllChecked] = useState(false);
    const notificationsRef = useRef(null);

    useEffect(() => {
        if (userId && token) {
            const fetchUserData = async () => {
                try {
                    const response = await fetch(`${serverUrl}/api/users/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Ошибка при получении данных пользователя');
                    }

                    const userData = await response.json();
                    setUser(userData);

                    // Случайный цвет для аватара без изображения
                    setUserColor('#' + Math.floor(Math.random() * 16777215).toString(16));

                    // Если у пользователя есть изображение, загружаем его
                    if (userData.image) {
                        const imageResponse = await fetch(`${serverUrl}/api/webdav/image?url=${encodeURIComponent(userData.image)}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });

                        if (imageResponse.ok) {
                            const blob = await imageResponse.blob();
                            const imageObjectUrl = URL.createObjectURL(blob);
                            setUserImageSrc(imageObjectUrl);
                        } else {
                            console.error('Ошибка при загрузке изображения пользователя');
                        }
                    }

                    // Получаем название роли на русском языке
                    const roleResponse = await fetch(`${serverUrl}/api/roles/${userData.role}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (roleResponse.ok) {
                        const roleData = await roleResponse.json();
                        setRoleName(roleData.rusname);
                        Cookies.set('roleName', roleData.rusname);
                    } else {
                        console.error('Ошибка при получении данных роли');
                    }
                } catch (error) {
                    console.error('Ошибка при загрузке данных пользователя:', error);
                }
            };

            fetchUserData();
        }
    }, [userId, token]);

    useEffect(() => {
        // Обновляем количество непрочитанных уведомлений
        const unread = notifications.filter((notif) => !notif.read).length;
        setAreAllChecked(selectedNotifications.length === notifications.length && notifications.length > 0);
        setUnreadCount(unread);
    }, [selectedNotifications, notifications]);

    const handleSignOut = () => {
        // Удаляем данные пользователя из состояния и куков
        setUser(null);
        Cookies.remove('userId');
        Cookies.remove('token');
        Cookies.remove('email');
        Cookies.remove('role');
        Cookies.remove('roleName');
        navigate('/'); // Перенаправляем на главную страницу
    };

    const getInitials = (name, surname) => {
        if (!name || !surname) return '';
        return `${name[0]}${surname[0]}`.toUpperCase();
    };

    const handleClickOutside = (event) => {
        // Закрываем меню, если клик был вне области меню пользователя или уведомлений
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
            setShowUserMenu(false);
        }
        if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
            setShowNotificationsList(false);
        }
    };

    useEffect(() => {
        // Добавляем обработчик кликов
        document.addEventListener('mousedown', handleClickOutside);

        // Удаляем обработчик кликов при размонтировании
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        console.log('Clicked notification:', notification);

        try {
            // Помечаем уведомление как прочитанное
            await fetch(`${serverUrl}/api/notifications/mark-as-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ notificationIds: [notification.id] }),
            });

            // Обновляем локальное состояние
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) =>
                    notif.id === notification.id ? { ...notif, read: true } : notif
                )
            );

            setShowNotificationsList(false);

            // Обрабатываем навигацию в зависимости от типа уведомления
            const notificationType = notification.type.toLowerCase();

            switch (notificationType) {
                case 'новость':
                    navigate(`/news/${notification.targetid}`);
                    break;
                case 'событие':
                    navigate(`/events/${notification.targetid}`);
                    break;
                case 'устройство':
                case 'новое устройство':
                    navigate(`/devices/${notification.targetid}`);
                    break;
                case 'сотрудник':
                    navigate(`/profile/${notification.targetid}`);
                    break;
                default:
                    console.warn('Неизвестный тип уведомления:', notification.type);
                    break;
            }
        } catch (error) {
            console.error('Ошибка при обработке клика по уведомлению:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter((notif) => !notif.read);
        if (unreadNotifications.length === 0) return;

        const notificationIds = unreadNotifications.map((notif) => notif.id);

        try {
            await fetch(`${serverUrl}/api/notifications/mark-as-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ notificationIds }),
            });

            // Обновляем локальное состояние
            setNotifications((prevNotifications) =>
                prevNotifications.map((notif) => ({ ...notif, read: true }))
            );
        } catch (error) {
            console.error('Ошибка при пометке всех уведомлений как прочитанных:', error);
        }
    };

    const handleDeleteSelectedNotifications = () => {
        if (selectedNotifications.length === 0) return;

        // Показать модальное окно подтверждения
        setShowDeleteModal(true);
    };

    const confirmDeleteSelectedNotifications = async () => {
        try {
            await fetch(`${serverUrl}/api/notifications`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ notificationIds: selectedNotifications }),
            });

            // Обновляем локальное состояние
            setNotifications((prevNotifications) =>
                prevNotifications.filter((notif) => !selectedNotifications.includes(notif.id))
            );
            setSelectedNotifications([]);
            setAreAllChecked(false);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Ошибка при удалении уведомлений:', error);
        }
    };

    const handleCheckboxChange = (e, notificationId) => {
        e.stopPropagation();
        let updatedSelectedNotifications;
        if (e.target.checked) {
            updatedSelectedNotifications = [...selectedNotifications, notificationId];
        } else {
            updatedSelectedNotifications = selectedNotifications.filter(id => id !== notificationId);
        }
        setSelectedNotifications(updatedSelectedNotifications);
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setAreAllChecked(checked);
        if (checked) {
            const allNotificationIds = notifications.map(notification => notification.id);
            setSelectedNotifications(allNotificationIds);
        } else {
            setSelectedNotifications([]);
        }
    };
    return (
        <div className="header">
            {/* Подключаем NotificationsListener */}
            <NotificationsListener setNotifications={setNotifications} />

            <SearchBar />
            <div
                className="header-user"
                onClick={() => setShowUserMenu(!showUserMenu)}
            >
                {user ? (
                    userImageSrc ? (
                        <img
                            src={userImageSrc}
                            alt="User"
                            className="header-user-img"
                        />
                    ) : (
                        <div
                            className="header-user-initials"
                            style={{ backgroundColor: userColor }}
                        >
                            {getInitials(user.name, user.surname)}
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
                        <div className="header-user-menu-item">{`${user.name || ''} ${user.surname || ''}`}</div>
                        <div className="header-user-menu-item">{roleName}</div>
                        <div
                            className="header-user-menu-item"
                            onClick={() => navigate(`/profile/${userId}`)}
                        >
                            Мой профиль
                        </div>
                        <div
                            className="header-user-menu-item"
                            onClick={handleSignOut}
                        >
                            Выход
                        </div>
                    </div>
                )}
            </div>
            {/* Блок уведомлений */}
            <div
                className="header-notifications"
                onClick={() => setShowNotificationsList(!showNotificationsList)}
                ref={notificationsRef}
            >
                <img src={notificationImg} alt="Notifications" />
                {unreadCount > 0 && (
                    <div className="notification-count">{unreadCount}</div>
                )}
                {showNotificationsList && (
                    <div className="notifications-list" ref={notificationsRef}>
                        {/* Заголовок уведомлений */}
                        <div className="notifications-header">
                            <div className="notifications-header-left">
                                <input
                                    type="checkbox"
                                    checked={areAllChecked}
                                    onChange={handleSelectAll}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span>Уведомления</span>
                            </div>
                            <div className="notifications-actions">
                                <img
                                    src={openEmailIcon}
                                    alt="Отметить все как прочитанные"
                                    className="mark-all-read-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAllAsRead();
                                    }}
                                    title="Отметить все как прочитанные"
                                />
                                <img
                                    src={trashIcon}
                                    alt="Удалить выбранные"
                                    className={`delete-selected-icon ${selectedNotifications.length === 0 ? 'disabled' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSelectedNotifications();
                                    }}
                                    title="Удалить выбранные"
                                    style={{ cursor: selectedNotifications.length === 0 ? 'not-allowed' : 'pointer' }}
                                />
                            </div>
                        </div>

                        {/* Список уведомлений */}
                        <div className="notifications-list-content">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.includes(notification.id)}
                                        onChange={(e) => handleCheckboxChange(e, notification.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <img
                                        src={!notification.read ? mailIcon : openEmailIcon}
                                        alt="Notification Icon"
                                        className="notification-icon"
                                    />
                                    <div className="notification-content">
                                        <span className="notification-message">{notification.message}</span>
                                        <span className="notification-timestamp">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    {notification.imageurl && (
                                        <img
                                            src={notification.imageurl}
                                            alt="Notification"
                                            className="notification-image"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Модальное окно для подтверждения удаления */}
            {showDeleteModal && (
                <Modal onClose={() => setShowDeleteModal(false)}>
                    <p>{`Вы уверены, что хотите удалить выбранные сообщения (${selectedNotifications.length})?`}</p>
                    <button onClick={confirmDeleteSelectedNotifications}>Да</button>
                    <button onClick={() => setShowDeleteModal(false)}>Нет</button>
                </Modal>
            )}
        </div>
    );
}
export default Header;
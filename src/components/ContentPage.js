import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';

// Импортируем изображения
import imgFilterIcon from '../images/filter.svg';
import imgCheckIcon from '../images/checkmark.png';
import imgCloseCancelIcon from '../images/close cancel x.png';
import imgLocationIcon from '../images/location.png';
import imgChatGroupIcon from '../images/chat-group.png';
import imgMoreHorIcon from '../images/more-hor.png';
import imgRefreshRepeatIcon from '../images/refresh repeat.png'; // Новая иконка

import '../styles/ContentPage.css'; // Добавьте стили для ContentPage

const ContentPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [currentTab, setCurrentTab] = useState('News');
    const [newsData, setNewsData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [subTab, setSubTab] = useState('Draft');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenuId, setShowMenuId] = useState(null);

    const navigate = useNavigate();

    const roleId = Cookies.get('roleId');
    const permissions = getPermissions(roleId);
    const userId = Cookies.get('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId) {
                    navigate('/');
                    return;
                }

                switch (roleId) {
                    case '1': // Администратор
                        if (!permissions.processingEvents && !permissions.processingNews && !permissions.publishingNews && !permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '3': // Авторизованный пользователь
                    case '6': // Техник
                        if (!permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '4': // Контент менеджер
                        if (!permissions.processingNews) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '5': // Менеджер событий
                        if (!permissions.processingEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                const newsRef = ref(database, 'News');
                const eventsRef = ref(database, 'Events');
                const usersRef = ref(database, 'Users');

                const [newsSnapshot, eventsSnapshot, usersSnapshot] = await Promise.all([get(newsRef), get(eventsRef), get(usersRef)]);
                const users = usersSnapshot.val();

                const filteredNewsData = [];
                const filteredEventsData = [];

                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const organizer = users[item.organizer];
                        const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                        if ((roleId === '3' || roleId === '6') && item.organizer !== userId) return;
                        if (roleId === '5' && item.organizer !== userId) return;
                        filteredNewsData.push({
                            ...item,
                            organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                            id: childSnapshot.key
                        });
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const organizer = users[item.organizer];
                        const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                        if ((roleId === '3' || roleId === '4' || roleId === '6') && item.organizer !== userId) return;
                        filteredEventsData.push({
                            ...item,
                            organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                            id: childSnapshot.key
                        });
                    });
                }

                setNewsData(filteredNewsData);
                setEventsData(filteredEventsData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        Cookies.set('currentPage', 'content');
    }, [navigate, roleId, permissions, userId]);

    const changeCurrentTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
    };

    const changeSubTabHandler = (e) => {
        const selectedSubTab = e.target.dataset.subtab;
        setSubTab(selectedSubTab);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            if (currentTab === 'News') {
                const newsRef = ref(database, `News/${id}`);
                const newsSnapshot = await get(newsRef);
                if (newsSnapshot.exists()) {
                    const newsItem = newsSnapshot.val();
                    newsItem.status = newStatus;
                    await set(newsRef, newsItem);

                    // Обновим новости и состояние
                    const usersRef = ref(database, 'Users');
                    const usersSnapshot = await get(usersRef);
                    const users = usersSnapshot.val();

                    const updatedNewsData = newsData.map(news => {
                        if (news.id === id) {
                            return {
                                ...newsItem,
                                organizerName: `${users[newsItem.organizer]?.surname || ''} ${users[newsItem.organizer]?.Name ? users[newsItem.organizer].Name.charAt(0) + '.' : ''}`.trim(),
                                id: news.id
                            };
                        }
                        return news;
                    });

                    setNewsData(updatedNewsData);
                }
            } else if (currentTab === 'Events') {
                const eventRef = ref(database, `Events/${id}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                    const eventItem = eventSnapshot.val();
                    eventItem.status = newStatus;
                    await set(eventRef, eventItem);

                    // Обновим события и состояние
                    const usersRef = ref(database, 'Users');
                    const usersSnapshot = await get(usersRef);
                    const users = usersSnapshot.val();

                    const updatedEventsData = eventsData.map(event => {
                        if (event.id === id) {
                            return {
                                ...eventItem,
                                organizerName: `${users[eventItem.organizer]?.surname || ''} ${users[eventItem.organizer]?.Name ? users[eventItem.organizer].Name.charAt(0) + '.' : ''}`.trim(),
                                id: event.id
                            };
                        }
                        return event;
                    });

                    setEventsData(updatedEventsData);
                }
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    // Функция для парсинга даты из postData и ее конвертации в корректный формат
    const parseDate = (dateString) => {
        // Логирование полученной строки даты
        console.log('Исходная строка даты:', dateString);

        // Разделяем строку на дату и время
        const [date, time] = dateString.split(', ');

        // Разделяем дату на части
        const [day, month, year] = date.split('.');

        // Формируем строку для объекта Date
        const formattedDateString = `${year}-${month}-${day}T${time}`;
        
        // Логирование строки формата ISO
        console.log('Форматированная строка даты:', formattedDateString);

        // Создаем и возвращаем объект Date
        const parsedDate = new Date(formattedDateString);
        
        // Логирование объекта Date
        console.log('Объект Date:', parsedDate);

        return parsedDate;
    };

    const renderItemsAsTable = (items) => {
        return (
            <table>
                <tbody>
                    {items.map((item) => (
                        <React.Fragment key={item.id}>
                            <tr>
                                <td colSpan="6" style={{ padding: '0' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="2" viewBox="0 0 1095 2" fill="none">
                                        <path d="M0 1H1095" stroke="#989898" strokeWidth="1" strokeLinecap="square" strokeDasharray="4 4"/>
                                    </svg>
                                </td>
                            </tr>
                            <tr className="table-row">
                                <td style={{ width: '40px', height: '40px', padding: '10px' }}>
                                    <input type="checkbox" />
                                </td>
                                <td style={{
                                    width: '150px',
                                    height: '40px',
                                    color: '#525252',
                                    fontFeatureSettings: "'liga' off, 'clig' off",
                                    fontFamily: 'Montserrat',
                                    fontSize: '16px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: '125%',
                                    padding: '10px'
                                }}>
                                    {parseDate(item.postData).toLocaleString()}
                                </td>
                                <td style={{
                                    width: '570px',
                                    color: '#525252',
                                    fontFeatureSettings: "'liga' off, 'clig' off",
                                    fontFamily: 'Montserrat',
                                    fontSize: '16px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: '125%',
                                    padding: '10px'
                                }}>
                                    {item.title}
                                </td>
                                <td style={{
                                    width: '120px',
                                    color: '#525252',
                                    fontFeatureSettings: "'liga' off, 'clig' off",
                                    fontFamily: 'Montserrat',
                                    fontSize: '16px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: '125%',
                                    padding: '10px'
                                }}>
                                    {item.organizerName !== 'Неизвестно' && item.organizerName}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {item.status === 'На модерации' && (
                                        <div className="custom-approve-reject-buttons">
                                            <button title="Одобрить" className="custom-approve-btn" onClick={() => handleStatusChange(item.id, 'Одобрено')}>
                                                <img src={imgCheckIcon} alt="Одобрить" />
                                            </button>
                                            <button title="Отклонить" className="custom-reject-btn" onClick={() => handleStatusChange(item.id, 'Отклонено')}>
                                                <img src={imgCloseCancelIcon} alt="Отклонить" />
                                            </button>
                                        </div>
                                    )}
                                    {item.status === 'Одобрено' && (
                                        <button title="Опубликовать" className="custom-publish-btn" onClick={() => handleStatusChange(item.id, 'Опубликовано')}>
                                            <img src={imgLocationIcon} alt="Опубликовать" />
                                        </button>
                                    )}
                                    {item.status === 'Опубликовано' && (
                                        <button title="Снять с публикации" className="custom-unpublish-btn" onClick={() => handleStatusChange(item.id, 'Одобрено')}>
                                            <img src={imgRefreshRepeatIcon} alt="Снять с публикации" />
                                        </button>
                                    )}
                                </td>
                                <td style={{ padding: '10px', position: 'relative' }}>
                                    <div className="comments-menu-buttons">
                                        <button className="comments-btn">
                                            <img src={imgChatGroupIcon} alt="Комментарии" />
                                        </button>
                                        <button className="menu-btn" onClick={() => setShowMenuId(showMenuId === item.id ? null : item.id)}>
                                            <img src={imgMoreHorIcon} alt="Меню" />
                                        </button>
                                    </div>
                                    {/* Отображаем меню только для текущего элемента */}
                                    {showMenuId === item.id && (
                                        <div className="comments-menu">
                                            <div className="comments-menu-item"><Link to={`/details/${item.id}`}>Посмотреть</Link></div>
                                            <div className="comments-menu-item"><Link to={`/edit/${item.id}`}>Редактировать</Link></div>
                                            <div className="comments-menu-item" onClick={() => handleStatusChange(item.id, 'Архив')}>В архив</div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="content-page page-content">
            <div className="content-page-head noselect">
                <p className={`content-page-head-tab ${currentTab === 'News' ? 'content-page-head-tab-selected' : ''}`} data-tab="News" onClick={changeCurrentTabHandler}>Новости</p>
                <p className={`content-page-head-tab ${currentTab === 'Events' ? 'content-page-head-tab-selected' : ''}`} data-tab="Events" onClick={changeCurrentTabHandler}>События</p>
            </div>
            <div className="content-page-head-2 noselect">
                <div className="subtabs">
                    <p className={`subtab ${subTab === 'Draft' ? 'subtab-selected' : ''}`} data-subtab="Draft" onClick={changeSubTabHandler}>Черновик</p>
                    <p className={`subtab ${subTab === 'Archive' ? 'subtab-selected' : ''}`} data-subtab="Archive" style={{ marginRight: '20px' }}>Архив</p>
                    <p className={`subtab ${subTab === 'Trash' ? 'subtab-selected' : ''}`} data-subtab="Trash" style={{ marginRight: '20px' }}>Корзина</p>
                    <div className="filter" style={{ marginRight: '20px' }}>
                        <img src={imgFilterIcon} alt="filter" />
                        <p className="filter-text">Фильтр</p>
                    </div>
                </div>
                <div className="content-page-btn-add" onClick={() => setIsAddPage(true)}>
                    <p>Создать новость</p>
                </div>
            </div>
            <div className="content-page-content">
                {currentTab === 'News' && !isAddPage && (
                    <>
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Объявления</h2>
                        {renderItemsAsTable(newsData.filter(item => item.elementType === 'Объявления'))}
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Устройства и ПО</h2>
                        {renderItemsAsTable(newsData.filter(item => item.elementType === 'Устройства и ПО'))}
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Мероприятия</h2>
                        {renderItemsAsTable(newsData.filter(item => item.elementType === 'Мероприятия'))}
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Технические новости</h2>
                        {renderItemsAsTable(newsData.filter(item => item.elementType === 'Тех. новости' || item.elementType === 'Технические новости'))}
                    </>
                )}
                {currentTab === 'Events' && !isAddPage && (
                    <>
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Объявления</h2>
                        {renderItemsAsTable(eventsData.filter(item => item.elementType === 'Объявления'))}
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Устройства и ПО</h2>
                        {renderItemsAsTable(eventsData.filter(item => item.elementType === 'Устройства и ПО'))}
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Мероприятия</h2>
                        {renderItemsAsTable(eventsData.filter(item => item.elementType === 'Мероприятия'))}
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Технические новости</h2>
                        {renderItemsAsTable(eventsData.filter(item => item.elementType === 'Тех. новости' || item.elementType === 'Технические новости'))}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ContentPage;
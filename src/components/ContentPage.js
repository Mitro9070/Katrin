import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import BidForm from './BidForm';
import TableComponent from './TableComponent'; // Импорт TableComponent

import imgFilterIcon from '../images/filter.svg';
import '../styles/ContentPage.css';

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

                        if ((roleId === '3' || roleId === '4' || roleId === '6') && item.organизатор !== userId) return;
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

                    const updatedNewsData = newsData.map(news => {
                        if (news.id === id) {
                            return {
                                ...newsItem,
                                id: news.id
                            };
                        }
                        return news;
                    });

                    setNewsData(updatedNewsData.filter(news => subTab !== 'Archive' || news.status === 'Архив'));
                }
            } else if (currentTab === 'Events') {
                const eventRef = ref(database, `Events/${id}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                    const eventItem = eventSnapshot.val();
                    eventItem.status = newStatus;
                    await set(eventRef, eventItem);

                    const updatedEventsData = eventsData.map(event => {
                        if (event.id === id) {
                            return {
                                ...eventItem,
                                id: event.id
                            };
                        }
                        return event;
                    });

                    setEventsData(updatedEventsData.filter(event => subTab !== 'Archive' || event.status === 'Архив'));
                }
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    return (
        <div className="content-page page-content">
            {isAddPage ? (
                <BidForm setIsAddPage={setIsAddPage} typeForm={currentTab === 'News' ? 'News' : 'Events'} />
            ) : (
                <>
                    <div className="content-page-head noselect">
                        {(roleId === '1' || roleId === '4') && (
                            <p className={`content-page-head-tab ${currentTab === 'News' ? 'content-page-head-tab-selected' : ''}`} data-tab="News" onClick={changeCurrentTabHandler}>Новости</p>
                        )}
                        {(roleId === '1' || roleId === '5') && (
                            <p className={`content-page-head-tab ${currentTab === 'Events' ? 'content-page-head-tab-selected' : ''}`} data-tab="Events" onClick={changeCurrentTabHandler}>События</p>
                        )}
                    </div>
                    <div className="content-page-head-2 noselect">
                        <div className="subtabs">
                            <p className={`subtab ${subTab === 'Draft' ? 'subtab-selected' : ''}`} data-subtab="Draft" onClick={changeSubTabHandler}>Черновик</p>
                            <p className={`subtab ${subTab === 'Archive' ? 'subtab-selected' : ''}`} data-subtab="Archive" onClick={changeSubTabHandler} style={{ marginRight: '20px' }}>Архив</p>
                            <p className={`subtab ${subTab === 'Trash' ? 'subtab-selected' : ''}`} data-subtab="Trash" onClick={changeSubTabHandler} style={{ marginRight: '20px' }}>Корзина</p>
                            <div className="filter" style={{ marginRight: '20px' }}>
                                <img src={imgFilterIcon} alt="filter" />
                                <p className="filter-text">Фильтр</p>
                            </div>
                        </div>
                        {subTab !== 'Archive' && (
                            <div className="content-page-btn-add" onClick={() => setIsAddPage(true)}>
                                <p>{currentTab === 'News' ? 'Создать новость' : 'Создать событие'}</p>
                            </div>
                        )}
                    </div>
                    <div className="content-page-content">
                        {currentTab === 'News' && (
                            <>
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Объявления</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && item.elementType === 'Объявления')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Объявления')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Устройства и ПО</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && item.elementType === 'Устройства и ПО')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Устройства и ПО')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Мероприятия</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && item.elementType === 'Мероприятия')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Мероприятия')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Технические новости</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && (item.elementType === 'Тех. новости' || item.elementType === 'Технические новости'))} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Тех. новости' || item.elementType === 'Технические новости')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                )}
                            </>
                        )}
                        {currentTab === 'Events' && (
                            <>
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Внутренние события</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={eventsData.filter(item => item.status === 'Архив' && item.elementType === 'Внутреннее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                ) : (
                                    <TableComponent items={eventsData.filter(item => item.elementType === 'Внутреннее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Внешние события</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={eventsData.filter(item => item.status === 'Архив' && item.elementType === 'Внешнее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                ) : (
                                    <TableComponent items={eventsData.filter(item => item.elementType === 'Внешнее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
            <Footer />
        </div>
    );
};

export default ContentPage;
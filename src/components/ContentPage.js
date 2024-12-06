import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import BidForm from './BidForm';
import TableComponent from './TableComponent'; // Импорт TableComponent
import EditBidForm from './EditBidPage'; // Импорт EditBidForm

import imgFilterIcon from '../images/filter.svg';
import '../styles/ContentPage.css';

const ContentPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [editMode, setEditMode] = useState(false); // Режим редактирования
    const [editTypeForm, setEditTypeForm] = useState(''); // Тип формы для редактирования
    const [editBidId, setEditBidId] = useState(null); // ID редактируемой заявки
    const [currentTab, setCurrentTab] = useState('News');
    const [newsData, setNewsData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [subTab, setSubTab] = useState('Draft');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenuId, setShowMenuId] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const roleId = Cookies.get('roleId');
    const permissions = getPermissions(roleId);
    const userId = Cookies.get('userId');

    const fetchData = async () => {
        try {
            if (!userId) {
                navigate('/');
                return;
            }

            setLoading(true);

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
                    if (!permissions.processingNews && !permissions.processingEvents) {
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

            // Обработка данных новостей
            if (newsSnapshot.exists()) {
                const newsData = newsSnapshot.val();
                for (const key in newsData) {
                    const item = newsData[key];
                    const organizer = users[item.organizer];
                    const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                    if ((roleId === '3' || roleId === '6') && item.organizer !== userId) continue;
                    filteredNewsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: key
                    });
                }
            }

            // Обработка данных событий
            if (eventsSnapshot.exists()) {
                const eventsData = eventsSnapshot.val();
                for (const key in eventsData) {
                    const item = eventsData[key];
                    let organizerName = "Неизвестно";

                    if (item.organizer) {
                        const userRef = ref(database, `Users/${item.organizer}`);
                        const snapshot = await get(userRef);

                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            organizerName = `${userData.surname || ''} ${userData.Name ? userData.Name.charAt(0) + '.' : ''}`.trim();
                        } else {
                            organizerName = item.organizer;
                        }
                    }

                    if ((roleId === '3' || roleId === '4' || roleId === '6') && item.organizer !== userId) continue;
                    filteredEventsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: key
                    });
                }
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

    useEffect(() => {
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
                }
            } else if (currentTab === 'Events') {
                const eventRef = ref(database, `Events/${id}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                    const eventItem = eventSnapshot.val();
                    eventItem.status = newStatus;
                    await set(eventRef, eventItem);
                }
            }

            // Перезагружаем данные
            await fetchData();
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    const handleEdit = (typeForm, id) => {
        setEditMode(true);
        setEditTypeForm(typeForm);
        setEditBidId(id);
    };

    const handleCloseEdit = () => {
        setEditMode(false);
        setEditTypeForm('');
        setEditBidId(null);
    }

    return (
        <div className="content-page page-content">
            {isAddPage && <BidForm setIsAddPage={setIsAddPage} typeForm={currentTab === 'News' ? 'News' : 'Events'} />}
            {editMode && <EditBidForm typeForm={editTypeForm} id={editBidId} />}
            {!isAddPage && !editMode && (
                <>
                    <div className="content-page-head noselect">
                        {(roleId === '1' || roleId === '4') && (
                            <p className={`content-page-head-tab ${currentTab === 'News' ? 'content-page-head-tab-selected' : ''}`} data-tab="News" onClick={changeCurrentTabHandler}>Новости</p>
                        )}
                        {(roleId === '1' || roleId === '4' || roleId === '5') && (
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
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && item.elementType === 'Объявления')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Объявления')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Устройства и ПО</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && item.elementType === 'Устройства и ПО')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Устройства и ПО')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Мероприятия</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && item.elementType === 'Мероприятия')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Мероприятия')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Технические новости</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={newsData.filter(item => item.status === 'Архив' && (item.elementType === 'Тех. новости' || item.elementType === 'Технические новости'))} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                ) : (
                                    <TableComponent items={newsData.filter(item => item.elementType === 'Тех. новости' || item.elementType === 'Технические новости')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                )}
                            </>
                        )}
                        {currentTab === 'Events' && (
                            <>
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Внутренние события</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={eventsData.filter(item => item.status === 'Архив' && item.elementType === 'Внутреннее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                ) : (
                                    <TableComponent items={eventsData.filter(item => item.elementType === 'Внутреннее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                )}
                                <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Внешние события</h2>
                                {subTab === 'Archive' ? (
                                    <TableComponent items={eventsData.filter(item => item.status === 'Архив' && item.elementType === 'Внешнее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                ) : (
                                    <TableComponent items={eventsData.filter(item => item.elementType === 'Внешнее событие')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} handleEdit={handleEdit} />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ContentPage;
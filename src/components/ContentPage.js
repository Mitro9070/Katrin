import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, remove, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import BidForm from './BidForm';
import TableComponent from './TableComponent';
import EditBidForm from './EditBidPage';

import imgFilterIcon from '../images/filter.svg';
import '../styles/ContentPage.css';

const ContentPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editTypeForm, setEditTypeForm] = useState('');
    const [editBidId, setEditBidId] = useState(null);
    const [currentTab, setCurrentTab] = useState('News');
    const [newsData, setNewsData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [deletedNewsData, setDeletedNewsData] = useState([]);
    const [deletedEventsData, setDeletedEventsData] = useState([]);
    const [subTab, setSubTab] = useState('Draft');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenuId, setShowMenuId] = useState(null);

    const navigate = useNavigate();
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
                case '1':
                case '4':
                    break;
                case '3':
                case '6':
                    if (!permissions.submissionNews && !permissions.submissionEvents) {
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                    }
                    break;
                case '5':
                    if (!permissions.processingEvents) {
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                    }
                    break;
                default:
                    throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
            }

            const newsRef = ref(database, 'News');
            const eventsRef = ref(database, 'Events');
            const deletedNewsRef = ref(database, 'Deleted/News');
            const deletedEventsRef = ref(database, 'Deleted/Events');
            const usersRef = ref(database, 'Users');

            const [
                newsSnapshot,
                eventsSnapshot,
                deletedNewsSnapshot,
                deletedEventsSnapshot,
                usersSnapshot
            ] = await Promise.all([
                get(newsRef),
                get(eventsRef),
                get(deletedNewsRef),
                get(deletedEventsRef),
                get(usersRef)
            ]);

            const users = usersSnapshot.val();

            const filteredNewsData = [];
            const filteredEventsData = [];
            const filteredDeletedNewsData = [];
            const filteredDeletedEventsData = [];

            // Обработка данных новостей
            if (newsSnapshot.exists()) {
                const newsData = newsSnapshot.val();
                for (const key in newsData) {
                    const item = newsData[key];
                    const organizer = users[item.owner];
                    const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                    if ((roleId === '3' || roleId === '6') && item.owner !== userId) continue;
                    filteredNewsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: key
                    });
                }

                filteredNewsData.sort((a, b) => new Date(b.postData) - new Date(a.postData));
            }

            // Обработка данных удалённых новостей
            if (deletedNewsSnapshot.exists()) {
                const deletedNews = deletedNewsSnapshot.val();
                for (const key in deletedNews) {
                    const item = deletedNews[key];
                    const organizer = users[item.owner];
                    const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                    if ((roleId === '3' || roleId === '6') && item.owner !== userId) continue;
                    filteredDeletedNewsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: key
                    });
                }

                filteredDeletedNewsData.sort((a, b) => new Date(b.deletedDate) - new Date(a.deletedDate));
            }

            // Обработка данных событий
            if (eventsSnapshot.exists()) {
                const eventsData = eventsSnapshot.val();
                for (const key in eventsData) {
                    const item = eventsData[key];
                    let organizerName = 'Неизвестно';

                    if (item.owner) {
                        const userRef = ref(database, `Users/${item.owner}`);
                        const snapshot = await get(userRef);

                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            organizerName = `${userData.surname || ''} ${userData.Name ? userData.Name.charAt(0) + '.' : ''}`.trim();
                        } else {
                            organizerName = item.owner;
                        }
                    }

                    if ((roleId === '3' || roleId === '6') && item.owner !== userId) continue;
                    filteredEventsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: key
                    });
                }

                filteredEventsData.sort((a, b) => new Date(b.postData) - new Date(a.postData));
            }

            // Обработка данных удалённых событий
            if (deletedEventsSnapshot.exists()) {
                const deletedEvents = deletedEventsSnapshot.val();
                for (const key in deletedEvents) {
                    const item = deletedEvents[key];
                    let organizerName = 'Неизвестно';

                    if (item.owner) {
                        const userRef = ref(database, `Users/${item.owner}`);
                        const snapshot = await get(userRef);

                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            organizerName = `${userData.surname || ''} ${userData.Name ? userData.Name.charAt(0) + '.' : ''}`.trim();
                        } else {
                            organizerName = item.owner;
                        }
                    }

                    if ((roleId === '3' || roleId === '6') && item.owner !== userId) continue;
                    filteredDeletedEventsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: key
                    });
                }

                filteredDeletedEventsData.sort((a, b) => new Date(b.deletedDate) - new Date(a.deletedDate));
            }

            setNewsData(filteredNewsData);
            setEventsData(filteredEventsData);
            setDeletedNewsData(filteredDeletedNewsData);
            setDeletedEventsData(filteredDeletedEventsData);
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

    const handleView = (typeForm, id) => {
        
        navigate(`/${typeForm.toLowerCase()}/${id}`);
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

            await fetchData();
        } catch (error) {
            console.error('Ошибка при изменении статуса:', error);
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
    };

    const handleDelete = async (id) => {
        try {
            const currentDate = new Date().toISOString();
            const deleteInitiator = userId;

            if (currentTab === 'News') {
                const newsRef = ref(database, `News/${id}`);
                const newsSnapshot = await get(newsRef);
                if (newsSnapshot.exists()) {
                    const newsItem = newsSnapshot.val();
                    newsItem.deletedDate = currentDate;
                    newsItem.deleteInitiator = deleteInitiator;

                    const deletedNewsRef = ref(database, `Deleted/News/${id}`);
                    await set(deletedNewsRef, newsItem);
                    await remove(newsRef);
                }
            } else if (currentTab === 'Events') {
                const eventRef = ref(database, `Events/${id}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                    const eventItem = eventSnapshot.val();
                    eventItem.deletedDate = currentDate;
                    eventItem.deleteInitiator = deleteInitiator;

                    const deletedEventsRef = ref(database, `Deleted/Events/${id}`);
                    await set(deletedEventsRef, eventItem);
                    await remove(eventRef);
                }
            }

            await fetchData();
        } catch (error) {
            console.error('Ошибка при удалении:', error);
        }
    };

    const handleRestore = async (id) => {
        try {
            const restoreInitiator = userId;

            if (currentTab === 'News') {
                const deletedNewsRef = ref(database, `Deleted/News/${id}`);
                const deletedNewsSnapshot = await get(deletedNewsRef);
                if (deletedNewsSnapshot.exists()) {
                    const newsItem = deletedNewsSnapshot.val();
                    newsItem.restoredInitiator = restoreInitiator;
                    delete newsItem.deletedDate;
                    delete newsItem.deleteInitiator;

                    const newsRef = ref(database, `News/${id}`);
                    await set(newsRef, newsItem);
                    await remove(deletedNewsRef);
                }
            } else if (currentTab === 'Events') {
                const deletedEventsRef = ref(database, `Deleted/Events/${id}`);
                const deletedEventSnapshot = await get(deletedEventsRef);
                if (deletedEventSnapshot.exists()) {
                    const eventItem = deletedEventSnapshot.val();
                    eventItem.restoredInitiator = restoreInitiator;
                    delete eventItem.deletedDate;
                    delete eventItem.deleteInitiator;

                    const eventRef = ref(database, `Events/${id}`);
                    await set(eventRef, eventItem);
                    await remove(deletedEventsRef);
                }
            }

            await fetchData();
            setSubTab('Draft');
        } catch (error) {
            console.error('Ошибка при восстановлении:', error);
        }
    };

    return (
        <div className="content-page page-content">
            {isAddPage && (
                <BidForm
                    setIsAddPage={setIsAddPage}
                    typeForm={currentTab === 'News' ? 'News' : 'Events'}
                />
            )}
            {editMode && <EditBidForm typeForm={editTypeForm} id={editBidId} />}
            {!isAddPage && !editMode && (
                <>
                    <div className="content-page-head noselect">
                        {(roleId === '1' || roleId === '4') && (
                            <p
                                className={`content-page-head-tab ${
                                    currentTab === 'News' ? 'content-page-head-tab-selected' : ''
                                }`}
                                data-tab="News"
                                onClick={changeCurrentTabHandler}
                            >
                                Новости
                            </p>
                        )}
                        {(roleId === '1' || roleId === '4' || roleId === '5') && (
                            <p
                                className={`content-page-head-tab ${
                                    currentTab === 'Events' ? 'content-page-head-tab-selected' : ''
                                }`}
                                data-tab="Events"
                                onClick={changeCurrentTabHandler}
                            >
                                События
                            </p>
                        )}
                    </div>
                    <div className="content-page-head-2 noselect">
                        <div className="subtabs">
                            <p
                                className={`subtab ${subTab === 'Draft' ? 'subtab-selected' : ''}`}
                                data-subtab="Draft"
                                onClick={changeSubTabHandler}
                            >
                                Черновик
                            </p>
                            <p
                                className={`subtab ${subTab === 'Archive' ? 'subtab-selected' : ''}`}
                                data-subtab="Archive"
                                onClick={changeSubTabHandler}
                                style={{ marginRight: '20px' }}
                            >
                                Архив
                            </p>
                            <p
                                className={`subtab ${subTab === 'Trash' ? 'subtab-selected' : ''}`}
                                data-subtab="Trash"
                                onClick={changeSubTabHandler}
                                style={{ marginRight: '20px' }}
                            >
                                Корзина
                            </p>
                            <div className="filter" style={{ marginRight: '20px' }}>
                                <img src={imgFilterIcon} alt="filter" />
                                <p className="filter-text">Фильтр</p>
                            </div>
                        </div>
                        {subTab !== 'Archive' && subTab !== 'Trash' && (
                            <div
                                className="content-page-btn-add"
                                onClick={() => setIsAddPage(true)}
                            >
                                <p>
                                    {currentTab === 'News' ? 'Создать новость' : 'Создать событие'}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="content-page-content">
                        {loading ? (
                            <Loader />
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <>
                                {currentTab === 'News' && (
                                    <>
                                        {/* Раздел "Объявления" */}
                                        <h2
                                            style={{
                                                color: '#525252',
                                                fontFamily: 'Montserrat',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Объявления
                                        </h2>
                                        <TableComponent
                                            items={
                                                subTab === 'Trash'
                                                    ? deletedNewsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Объявления'
                                                      )
                                                    : subTab === 'Archive'
                                                    ? newsData.filter(
                                                          (item) =>
                                                              item.status === 'Архив' &&
                                                              item.elementType === 'Объявления'
                                                      )
                                                    : newsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Объявления' &&
                                                              item.status !== 'Архив'
                                                      )
                                            }
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onRestore={handleRestore}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                            currentTab={currentTab}
                                            subTab={subTab}
                                            setShowMenuId={setShowMenuId}
                                            showMenuId={showMenuId}
                                        />
                                        {/* Раздел "Устройства и ПО" */}
                                        <h2
                                            style={{
                                                color: '#525252',
                                                fontFamily: 'Montserrat',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Устройства и ПО
                                        </h2>
                                        <TableComponent
                                            items={
                                                subTab === 'Trash'
                                                    ? deletedNewsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Устройства и ПО'
                                                      )
                                                    : subTab === 'Archive'
                                                    ? newsData.filter(
                                                          (item) =>
                                                              item.status === 'Архив' &&
                                                              item.elementType === 'Устройства и ПО'
                                                      )
                                                    : newsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Устройства и ПО' &&
                                                              item.status !== 'Архив'
                                                      )
                                            }
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onRestore={handleRestore}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                            currentTab={currentTab}
                                            subTab={subTab}
                                            setShowMenuId={setShowMenuId}
                                            showMenuId={showMenuId}
                                        />
                                        {/* Раздел "Мероприятия" */}
                                        <h2
                                            style={{
                                                color: '#525252',
                                                fontFamily: 'Montserrat',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Мероприятия
                                        </h2>
                                        <TableComponent
                                            items={
                                                subTab === 'Trash'
                                                    ? deletedNewsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Мероприятия'
                                                      )
                                                    : subTab === 'Archive'
                                                    ? newsData.filter(
                                                          (item) =>
                                                              item.status === 'Архив' &&
                                                              item.elementType === 'Мероприятия'
                                                      )
                                                    : newsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Мероприятия' &&
                                                              item.status !== 'Архив'
                                                      )
                                            }
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onRestore={handleRestore}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                            currentTab={currentTab}
                                            subTab={subTab}
                                            setShowMenuId={setShowMenuId}
                                            showMenuId={showMenuId}
                                        />
                                        {/* Раздел "Технические новости" */}
                                        <h2
                                            style={{
                                                color: '#525252',
                                                fontFamily: 'Montserrat',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Технические новости
                                        </h2>
                                        <TableComponent
                                            items={
                                                subTab === 'Trash'
                                                    ? deletedNewsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Тех. новости' ||
                                                              item.elementType === 'Технические новости'
                                                      )
                                                    : subTab === 'Archive'
                                                    ? newsData.filter(
                                                          (item) =>
                                                              item.status === 'Архив' &&
                                                              (item.elementType === 'Тех. новости' ||
                                                                  item.elementType ===
                                                                      'Технические новости')
                                                      )
                                                    : newsData.filter(
                                                          (item) =>
                                                              (item.elementType === 'Тех. новости' ||
                                                                  item.elementType ===
                                                                      'Технические новости') &&
                                                              item.status !== 'Архив'
                                                      )
                                            }
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onRestore={handleRestore}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                            currentTab={currentTab}
                                            subTab={subTab}
                                            setShowMenuId={setShowMenuId}
                                            showMenuId={showMenuId}
                                        />
                                    </>
                                )}
                                {currentTab === 'Events' && (
                                    <>
                                        {/* Раздел "Внутренние события" */}
                                        <h2
                                            style={{
                                                color: '#525252',
                                                fontFamily: 'Montserrat',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Внутренние события
                                        </h2>
                                        <TableComponent
                                            items={
                                                subTab === 'Trash'
                                                    ? deletedEventsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Внутреннее событие'
                                                      )
                                                    : subTab === 'Archive'
                                                    ? eventsData.filter(
                                                          (item) =>
                                                              item.status === 'Архив' &&
                                                              item.elementType === 'Внутреннее событие'
                                                      )
                                                    : eventsData.filter(
                                                          (item) =>
                                                              item.elementType ===
                                                                  'Внутреннее событие' &&
                                                              item.status !== 'Архив'
                                                      )
                                            }
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onRestore={handleRestore}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                            currentTab={currentTab}
                                            subTab={subTab}
                                            setShowMenuId={setShowMenuId}
                                            showMenuId={showMenuId}
                                        />
                                        {/* Раздел "Внешние события" */}
                                        <h2
                                            style={{
                                                color: '#525252',
                                                fontFamily: 'Montserrat',
                                                fontSize: '18px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Внешние события
                                        </h2>
                                        <TableComponent
                                            items={
                                                subTab === 'Trash'
                                                    ? deletedEventsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Внешнее событие'
                                                      )
                                                    : subTab === 'Archive'
                                                    ? eventsData.filter(
                                                          (item) =>
                                                              item.status === 'Архив' &&
                                                              item.elementType === 'Внешнее событие'
                                                      )
                                                    : eventsData.filter(
                                                          (item) =>
                                                              item.elementType === 'Внешнее событие' &&
                                                              item.status !== 'Архив'
                                                      )
                                            }
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onRestore={handleRestore}
                                            onEdit={handleEdit}
                                            onView={handleView}
                                            currentTab={currentTab}
                                            subTab={subTab}
                                            setShowMenuId={setShowMenuId}
                                            showMenuId={showMenuId}
                                        />
                                    </>
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
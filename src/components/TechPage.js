import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, set, remove } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import BidForm from './BidForm';
import TableComponent from './TableComponentTech'; // Импорт TableComponentTech
import EditBidForm from './EditBidPage';

import imgFilterIcon from '../images/filter.svg';
import '../styles/ContentPage.css';

const TechPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [currentTab, setCurrentTab] = useState('TechNews');
    const [newsData, setNewsData] = useState([]);
    const [deletedNewsData, setDeletedNewsData] = useState([]);
    const [subTab, setSubTab] = useState('Draft');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenuId, setShowMenuId] = useState(null);
    const [editBidId, setEditBidId] = useState(null);
    const [isEditPage, setIsEditPage] = useState(false);

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

            switch (roleId) {
                case '1': // Администратор
                    if (!permissions.processingEvents && !permissions.processingNews && !permissions.publishingNews && !permissions.submissionNews && !permissions.submissionEvents) {
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                    }
                    break;
                case '6': // Техник
                    if (!permissions.submissionNews && !permissions.submissionEvents) {
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                    }
                    break;
                default:
                    throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
            }

            const newsRef = ref(database, 'News');
            const deletedNewsRef = ref(database, 'DeletedTech');
            const usersRef = ref(database, 'Users');

            const [newsSnapshot, deletedNewsSnapshot, usersSnapshot] = await Promise.all([get(newsRef), get(deletedNewsRef), get(usersRef)]);
            const users = usersSnapshot.val();

            const filteredNewsData = [];
            const filteredDeletedNewsData = [];

            if (newsSnapshot.exists()) {
                newsSnapshot.forEach((childSnapshot) => {
                    const item = childSnapshot.val();
                    const organizer = users[item.owner];
                    const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                    filteredNewsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: childSnapshot.key
                    });
                });
            }

            if (deletedNewsSnapshot.exists()) {
                deletedNewsSnapshot.forEach((childSnapshot) => {
                    const item = childSnapshot.val();
                    const organizer = users[item.owner];
                    const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                    filteredDeletedNewsData.push({
                        ...item,
                        organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                        id: childSnapshot.key
                    });
                });
            }

            setNewsData(filteredNewsData);
            setDeletedNewsData(filteredDeletedNewsData);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        Cookies.set('currentPage', 'tech-news');
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
            const newsRef = ref(database, `News/${id}`);
            const newsSnapshot = await get(newsRef);
            if (newsSnapshot.exists()) {
                const newsItem = newsSnapshot.val();
                newsItem.status = newStatus;
                await set(newsRef, newsItem);
                await fetchData();
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const currentDate = new Date().toISOString();
            const deleteInitiator = userId;

            const newsRef = ref(database, `News/${id}`);
            const newsSnapshot = await get(newsRef);
            if (newsSnapshot.exists()) {
                const newsItem = newsSnapshot.val();
                newsItem.deletedDate = currentDate;
                newsItem.deleteInitiator = deleteInitiator;

                const deletedNewsRef = ref(database, `DeletedTech/${id}`);
                await set(deletedNewsRef, newsItem);
                await remove(newsRef);
            }

            await fetchData();
        } catch (error) {
            console.error('Ошибка при удалении:', error);
        }
    };

    const handleRestore = async (id) => {
        try {
            const restoreInitiator = userId;

            const deletedNewsRef = ref(database, `DeletedTech/${id}`);
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

            await fetchData();
            // Переключаем на вкладку "Черновик"
            setSubTab('Draft');
        } catch (error) {
            console.error('Ошибка при восстановлении:', error);
        }
    };

    const handleEdit = (currentTab, id, referrer) => {
        setIsEditPage(true);
        setEditBidId(id);
    };

    const sortedNewsData = newsData.sort((a, b) => new Date(b.postData) - new Date(a.postData)); // Сортировка новостей по postData

    const handleView = (typeForm, id) => {
        // Реализует логику перехода на страницу просмотра

        navigate(`/news/${id}`);
    };

    return (
        <div className="content-page page-content">
            {isAddPage ? (
                <BidForm setIsAddPage={setIsAddPage} typeForm="TechNews" />
            ) : isEditPage ? (
                <EditBidForm setIsEditPage={setIsEditPage} typeForm="TechNews" id={editBidId} />
            ) : (
                <>
                    <div className="content-page-head noselect">
                        <p className={`content-page-head-tab ${currentTab === 'TechNews' ? 'content-page-head-tab-selected' : ''}`} data-tab="TechNews" onClick={changeCurrentTabHandler}>Тех. новости</p>
                    </div>
                    <div className="content-page-head-2 noselect">
                        <div className="subtabs">
                            <p className={`subtab ${subTab === 'Draft' ? 'subtab-selected' : ''}`} data-subtab="Draft" onClick={changeSubTabHandler}>Черновик</p>
                            <p className={`subtab ${subTab === 'Archive' ? 'subtab-selected' : ''}`} data-subtab="Archive" style={{ marginRight: '20px' }} onClick={() => setSubTab('Archive')}>Архив</p>
                            <p className={`subtab ${subTab === 'Trash' ? 'subtab-selected' : ''}`} data-subtab="Trash" onClick={changeSubTabHandler} style={{ marginRight: '20px' }}>Корзина</p>
                            <div className="filter" style={{ marginRight: '20px' }}>
                                <img src={imgFilterIcon} alt="filter" />
                                <p className="filter-text">Фильтр</p>
                            </div>
                        </div>
                        {subTab !== 'Archive' && (
                            <div className="content-page-btn-add" onClick={() => setIsAddPage(true)}>
                                <p>Создать тех. новость</p>
                            </div>
                        )}
                    </div>
                    <div className="content-page-content">
                        <h2 style={{ color: '#525252', fontFamily: 'Montserrat', fontSize: '18px', fontWeight: '600' }}>Технические новости</h2>
                        {subTab === 'Trash' ? (
                            <TableComponent
                                items={deletedNewsData}
                                onRestore={handleRestore}
                                onView={handleView}
                                currentTab={currentTab}
                                subTab={subTab}
                                setShowMenuId={setShowMenuId}
                                showMenuId={showMenuId}
                            />
                        ) : (
                            <TableComponent
                                items={sortedNewsData.filter(
                                    item => (subTab === 'Archive' ? item.status === 'Архив' : item.status !== 'Архив') &&
                                        (item.elementType === 'Тех. новости' || item.elementType === 'Технические новости')
                                )}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                onView={handleView}
                                currentTab={currentTab}
                                subTab={subTab}
                                setShowMenuId={setShowMenuId}
                                showMenuId={showMenuId}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TechPage;
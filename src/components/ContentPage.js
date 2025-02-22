// src/components/ContentPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import BidForm from './BidForm';
import TableComponent from './TableComponent';
import EditBidForm from './EditBidPage';
import {
    fetchTrashItems,
    restoreTrashItem,
    deleteTrashItem,
    clearTrash,
} from '../Controller/TrashController';
import imgFilterIcon from '../images/filter.svg';
import '../styles/ContentPage.css';

import { fetchNews, deleteNews, editNews } from '../Controller/NewsController';
import { fetchEvents, deleteEvent, editEvent } from '../Controller/EventsController';
import { fetchUsers } from '../Controller/UsersController';

const ContentPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editTypeForm, setEditTypeForm] = useState('');
    const [editBidId, setEditBidId] = useState(null);
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

    const fetchData = async () => {
        try {
            if (!userId) {
                navigate('/');
                return;
            }

            setLoading(true);

            // Проверка прав доступа (оставим без изменений)
            // ...

            const users = await fetchUsers();

            let processedNewsData = [];
            let processedEventsData = [];

            if (subTab === 'Trash') {
                // Если выбрана вкладка "Корзина", загружаем данные из корзины
                if (currentTab === 'News') {
                    const trashNewsItems = await fetchTrashItems('news');
                    processedNewsData = Array.isArray(trashNewsItems) ? trashNewsItems.map(item => {
                        const organizer = users.find(user => user.id === item.owner);
                        const organizerName = organizer ? `${organizer.surname || ''} ${organizer.name ? organizer.name.charAt(0) + '.' : ''}`.trim() : 'Неизвестно';

                        return {
                            ...item,
                            organizerName,
                        };
                    }) : [];
                    setNewsData(processedNewsData);
                } else if (currentTab === 'Events') {
                    const trashEventsItems = await fetchTrashItems('events');
                    processedEventsData = Array.isArray(trashEventsItems) ? trashEventsItems.map(item => {
                        const organizer = users.find(user => user.id === item.owner);
                        const organizerName = organizer ? `${organizer.surname || ''} ${organizer.name ? organizer.name.charAt(0) + '.' : ''}`.trim() : 'Неизвестно';

                        return {
                            ...item,
                            organizerName,
                        };
                    }) : [];
                    setEventsData(processedEventsData);
                }
            } else {
                // Если выбрана не "Корзина", загружаем обычные данные
                // Загрузка данных новостей
                const newsResponse = await fetchNews();
                let newsItems = newsResponse.news || [];

                // Загрузка данных событий
                const eventsResponse = await fetchEvents();
                let eventsItems = eventsResponse.events || [];

                // Фильтрация данных по роли пользователя
                if (roleId !== '1' && roleId !== '4') {
                    newsItems = newsItems.filter(item => item.owner === userId);
                    eventsItems = eventsItems.filter(item => item.owner === userId);
                }

                // Обработка данных новостей
                processedNewsData = newsItems.map(item => {
                    const organizer = users.find(user => user.id === item.owner);
                    const organizerName = organizer ? `${organizer.surname || ''} ${organizer.name ? organizer.name.charAt(0) + '.' : ''}`.trim() : 'Неизвестно';

                    return {
                        ...item,
                        organizerName,
                    };
                });

                // Обработка данных событий
                processedEventsData = eventsItems.map(item => {
                    const organizer = users.find(user => user.id === item.owner);
                    const organizerName = organizer ? `${organizer.surname || ''} ${organizer.name ? organizer.name.charAt(0) + '.' : ''}`.trim() : 'Неизвестно';

                    return {
                        ...item,
                        organizerName,
                    };
                });

                setNewsData(processedNewsData);
                setEventsData(processedEventsData);
            }

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
    }, [navigate, roleId, permissions, userId, subTab, currentTab]);

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

    const handleStatusChange = async (id, newStatus, typeForm) => {
        try {
            // Находим элемент в данных
            let item;
            if (typeForm === 'News') {
                item = newsData.find(newsItem => newsItem.id === id);
            } else if (typeForm === 'Events') {
                item = eventsData.find(eventItem => eventItem.id === id);
            }

            if (!item) {
                console.error('Элемент не найден');
                return;
            }

            // Создаём новый объект FormData
            const formData = new FormData();

            // Заполняем FormData всеми полями существующей записи, кроме вычисляемых или лишних полей
            for (const key in item) {
                if (item.hasOwnProperty(key) && key !== 'id' && key !== 'organizerName' && item[key] !== null && item[key] !== undefined) {
                    if (key === 'images' || key === 'existingImages') {
                        // Пропускаем обработку изображений здесь, если они не меняются
                        continue;
                    } else if (Array.isArray(item[key])) {
                        formData.append(key, JSON.stringify(item[key]));
                    } else {
                        formData.append(key, item[key]);
                    }
                }
            }

            // Обрабатываем изображения, если нужно
            if (item.image) {
                const existingImages = [];
                existingImages.push(item.image);
                formData.append('existingImages', JSON.stringify(existingImages));
            }

            // Обновляем статус
            formData.set('status', newStatus);

            // Отправляем данные на сервер
            if (typeForm === 'News') {
                await editNews(id, formData);
            } else if (typeForm === 'Events') {
                await editEvent(id, formData);
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

    const handleDelete = async (id, typeForm) => {
        try {
            if (subTab === 'Trash') {
                // Если мы в корзине, удаляем элемент навсегда
                if (typeForm === 'News') {
                    await deleteTrashItem(id, 'news');
                } else if (typeForm === 'Events') {
                    await deleteTrashItem(id, 'events');
                }
            } else {
                // Если мы не в корзине, перемещаем элемент в корзину
                if (typeForm === 'News') {
                    await deleteNews(id);
                } else if (typeForm === 'Events') {
                    await deleteEvent(id);
                }
            }
            await fetchData();
        } catch (error) {
            console.error('Ошибка при удалении:', error);
        }
    };

    const handleRestore = async (id, typeForm) => {
        try {
            if (typeForm === 'News') {
                await restoreTrashItem(id, 'news');
            } else if (typeForm === 'Events') {
                await restoreTrashItem(id, 'events');
            }
            await fetchData();
        } catch (error) {
            console.error('Ошибка при восстановлении элемента из корзины:', error);
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
            {editMode && (
                <EditBidForm
                    typeForm={editTypeForm}
                    id={editBidId}
                    setIsEditPage={handleCloseEdit}
                />
            )}
            {!isAddPage && !editMode && (
                <>
                    <div className="content-page-head noselect">
                        {(roleId === '1' || roleId === '4') && (
                            <p
                                className={`content-page-head-tab ${currentTab === 'News' ? 'content-page-head-tab-selected' : ''}`}
                                data-tab="News"
                                onClick={changeCurrentTabHandler}
                            >
                                Новости
                            </p>
                        )}
                        {(roleId === '1' || roleId === '4' || roleId === '5') && (
                            <p
                                className={`content-page-head-tab ${currentTab === 'Events' ? 'content-page-head-tab-selected' : ''}`}
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
                                        {/* Разделы новостей по типу */}
                                        {['Объявления', 'Устройства и ПО', 'Мероприятия', 'Тех. новости'].map((elementType) => (
                                            <div key={elementType}>
                                                <h2
                                                    style={{
                                                        color: '#525252',
                                                        fontFamily: 'Montserrat',
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {elementType}
                                                </h2>
                                                <TableComponent
                                                    items={
                                                        newsData.filter((item) => {
                                                            if (item.elementtype !== elementType) return false;
                                                
                                                            if (subTab === 'Trash') {
                                                                // В корзине отображаем все элементы для данного типа
                                                                return true;
                                                            } else if (subTab === 'Archive') {
                                                                return item.status === 'Архив';
                                                            } else {
                                                                return item.status !== 'Архив' && item.status !== 'Удалено';
                                                            }
                                                        })
                                                    }
                                                    onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus, currentTab)}
                                                    onDelete={(id) => handleDelete(id, currentTab)}
                                                    onRestore={(id) => handleRestore(id, currentTab)}
                                                    onEdit={(id) => handleEdit(currentTab, id)}
                                                    onView={handleView}
                                                    currentTab={currentTab}
                                                    subTab={subTab}
                                                    setShowMenuId={setShowMenuId}
                                                    showMenuId={showMenuId}
                                                />
                                            </div>
                                        ))}
                                    </>
                                )}
                                {currentTab === 'Events' && (
                                    <>
                                        {/* Разделы событий по типу */}
                                        {['Внутреннее событие', 'Внешнее событие'].map((elementType) => (
                                            <div key={elementType}>
                                                <h2
                                                    style={{
                                                        color: '#525252',
                                                        fontFamily: 'Montserrat',
                                                        fontSize: '18px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {elementType}
                                                </h2>
                                                <TableComponent
                                                     items={
                                                        eventsData.filter((item) => {
                                                            if (item.elementtype !== elementType) return false;
                                                
                                                            if (subTab === 'Trash') {
                                                                // В корзине отображаем все элементы для данного типа
                                                                return true;
                                                            } else if (subTab === 'Archive') {
                                                                return item.status === 'Архив';
                                                            } else {
                                                                return item.status !== 'Архив' && item.status !== 'Удалено';
                                                            }
                                                        })
                                                    }
                                                    onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus, 'Events')}
                                                    onDelete={(id) => handleDelete(id, 'Events')}
                                                    onRestore={(id) => handleRestore(id, 'Events')}
                                                    onEdit={(id) => handleEdit('Events', id)}
                                                    onView={() => { }}
                                                    currentTab={currentTab}
                                                    subTab={subTab}
                                                    setShowMenuId={setShowMenuId}
                                                    showMenuId={showMenuId}
                                                />
                                            </div>
                                        ))}
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
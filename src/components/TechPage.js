// src/components/TechPage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import BidForm from './BidForm';
import TableComponent from './TableComponentTech'; // Импорт TableComponentTech
import EditBidForm from './EditBidPage';

import imgFilterIcon from '../images/filter.svg';
import '../styles/ContentPage.css';

import { fetchNews, deleteNews, editNews } from '../Controller/NewsController';
import { fetchUsers } from '../Controller/UsersController';
import {
    fetchTrashItems,
    restoreTrashItem,
    deleteTrashItem,
} from '../Controller/TrashController';

const TechPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [currentTab, setCurrentTab] = useState('TechNews');
    const [newsData, setNewsData] = useState([]);
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
            // Проверяем, авторизован ли пользователь
            if (!userId) {
                navigate('/');
                return;
            }

            setLoading(true);

            // Проверяем права доступа на основе роли пользователя
            if (roleId !== '1' && roleId !== '6') {
                throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
            }

            const users = await fetchUsers();

            let processedNewsData = [];

            if (subTab === 'Trash') {
                // Если выбрана вкладка "Корзина", загружаем данные из корзины
                const trashNewsItems = await fetchTrashItems('news');
                processedNewsData = Array.isArray(trashNewsItems)
                    ? trashNewsItems
                          .filter((item) => item.elementtype === 'Тех. новости')
                          .map((item) => {
                              const organizer = users.find((user) => user.id === item.owner);
                              const organizerName = organizer
                                  ? `${organizer.surname || ''} ${
                                        organizer.name ? organizer.name.charAt(0) + '.' : ''
                                    }`.trim()
                                  : 'Неизвестно';

                              return {
                                  ...item,
                                  organizerName,
                              };
                          })
                    : [];
            } else {
                // Если выбрана не "Корзина", загружаем обычные данные
                const newsResponse = await fetchNews();
                let newsItems = newsResponse.news || [];

                // Фильтруем только технические новости
                newsItems = newsItems.filter((item) => item.elementtype === 'Тех. новости');

                // Фильтрация данных по роли пользователя
                if (roleId === '6') {
                    // Техники видят только свои новости
                    newsItems = newsItems.filter((item) => item.owner === userId);
                }

                // Обработка данных новостей
                processedNewsData = newsItems.map((item) => {
                    const organizer = users.find((user) => user.id === item.owner);
                    const organizerName = organizer
                        ? `${organizer.surname || ''} ${
                              organizer.name ? organizer.name.charAt(0) + '.' : ''
                          }`.trim()
                        : 'Неизвестно';

                    return {
                        ...item,
                        organizerName,
                    };
                });
            }

            setNewsData(processedNewsData);
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
    }, [navigate, roleId, permissions, userId, subTab]);

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
            // Находим элемент в данных
            const item = newsData.find((newsItem) => newsItem.id === id);

            if (!item) {
                console.error('Элемент не найден');
                return;
            }

            // Создаём новый объект FormData
            const formData = new FormData();

            // Заполняем FormData всеми полями существующей записи, кроме вычисляемых или лишних полей
            for (const key in item) {
                if (
                    item.hasOwnProperty(key) &&
                    key !== 'id' &&
                    key !== 'organizerName' &&
                    item[key] !== null &&
                    item[key] !== undefined
                ) {
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
            await editNews(id, formData);

            await fetchData();
        } catch (error) {
            console.error('Ошибка при изменении статуса:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            if (subTab === 'Trash') {
                // Если мы в корзине, удаляем элемент навсегда
                await deleteTrashItem(id, 'news');
            } else {
                // Если мы не в корзине, перемещаем элемент в корзину
                await deleteNews(id);
            }
            await fetchData();
        } catch (error) {
            console.error('Ошибка при удалении:', error);
        }
    };

    const handleRestore = async (id) => {
        try {
            await restoreTrashItem(id, 'news');
            await fetchData();
            // Переключаем на вкладку "Черновик"
            setSubTab('Draft');
        } catch (error) {
            console.error('Ошибка при восстановлении:', error);
        }
    };

    const handleEdit = (currentTab, id) => {
        setIsEditPage(true);
        setEditBidId(id);
    };

    const sortedNewsData = newsData.sort((a, b) => new Date(b.postdata) - new Date(a.postdata)); // Сортировка новостей по postdata

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
                        <p
                            className={`content-page-head-tab ${
                                currentTab === 'TechNews' ? 'content-page-head-tab-selected' : ''
                            }`}
                            data-tab="TechNews"
                            onClick={changeCurrentTabHandler}
                        >
                            Тех. новости
                        </p>
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
                        {subTab !== 'Archive' && (
                            <div className="content-page-btn-add" onClick={() => setIsAddPage(true)}>
                                <p>Создать тех. новость</p>
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
                                            ? newsData
                                            : sortedNewsData.filter((item) => {
                                                  if (subTab === 'Archive') {
                                                      return item.status === 'Архив';
                                                  } else {
                                                      return item.status !== 'Архив';
                                                  }
                                              })
                                    }
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    onRestore={handleRestore}
                                    onView={handleView}
                                    currentTab={currentTab}
                                    subTab={subTab}
                                    setShowMenuId={setShowMenuId}
                                    showMenuId={showMenuId}
                                />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TechPage;
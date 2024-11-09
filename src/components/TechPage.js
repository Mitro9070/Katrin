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

const TechPage = () => {
    const [isAddPage, setIsAddPage] = useState(false);
    const [currentTab, setCurrentTab] = useState('TechNews');
    const [newsData, setNewsData] = useState([]);
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
                    
                    case '6': // Техник
                        if (!permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                const newsRef = ref(database, 'News');
                const usersRef = ref(database, 'Users');

                const [newsSnapshot, usersSnapshot] = await Promise.all([get(newsRef), get(usersRef)]);
                const users = usersSnapshot.val();

                const filteredNewsData = [];

                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const organizer = users[item.organizer];
                        const organizerName = `${organizer?.surname || ''} ${organizer?.Name ? organizer.Name.charAt(0) + '.' : ''}`.trim();

                        if (item.status === 'Архив') {
                            filteredNewsData.push({
                                ...item,
                                organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                                id: childSnapshot.key
                            });
                        } else if (roleId !== '5' || item.organizer === userId) {
                            filteredNewsData.push({
                                ...item,
                                organizerName: organizerName !== '' ? organizerName : 'Неизвестно',
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                setNewsData(filteredNewsData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

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
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    return (
        <div className="content-page page-content">
            {isAddPage ? (
                <BidForm setIsAddPage={setIsAddPage} typeForm="TechNews" />
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
                        {subTab === 'Archive' ? (
                            // Отображение таблицы с новостями в статусе "Архив"
                            <TableComponent items={newsData.filter(item => item.status === 'Архив' && (item.elementType === 'Тех. новости' || item.elementType === 'Технические новости'))} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                        ) : (
                            // Отображение таблицы с новостями, которые не находятся в статусе "Архив"
                            <TableComponent items={newsData.filter(item => item.elementType === 'Тех. новости' || item.elementType === 'Технические новости')} onStatusChange={handleStatusChange} currentTab={currentTab} subTab={subTab} setShowMenuId={setShowMenuId} showMenuId={showMenuId} />
                        )}
                    </div>
                </>
            )}
            <Footer />
        </div>
    );
};

export default TechPage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import StandartCard from '../components/StandartCard';
import EditBidPage from './EditBidPage';

import imgFilterIcon from '../images/filter.svg';
import imgEyeOpened from '../images/eye-opened.svg';
import imgEdit from '../images/edit.png';

import '../styles/BidPage.css';
import BidForm from './BidForm';

const BidPage = () => {
    const [BidCurrentTab, setBidCurrentTab] = useState('News');
    const [IsAddPage, setIsAddPage] = useState(false);
    const [isEditPage, setIsEditPage] = useState(false); 
    const [editMode, setEditMode] = useState(false);
    const [editTypeForm, setEditTypeForm] = useState('');
    const [editBidId, setEditBidId] = useState(null);
    const [newsData, setNewsData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const roleId = Cookies.get('roleId');
    const permissions = getPermissions(roleId);
    const userId = Cookies.get('userId');
    const userEmail = Cookies.get('userEmail');

    // useEffect для загрузки данных по приему ролей и прав
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId) {
                    navigate('/');
                    return;
                }

                // References to Firebase Database
                const newsRef = ref(database, 'News');
                const eventsRef = ref(database, 'Events');

                const [newsSnapshot, eventsSnapshot] = await Promise.all([
                    get(newsRef),
                    get(eventsRef)
                ]);

                const newsData = [];
                const eventsData = [];

                // Основной цикл для создания набора новостей и событий
                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        // Администратор видит все, остальные пользователи видят только свои
                        if (roleId !== '1' && item.organizer !== userId) return;
                        newsData.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        // Администратор видит все, остальные пользователи видят только свои
                        if (roleId !== '1' && item.organizer !== userId) return;
                        eventsData.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    });
                }

                setNewsData(newsData);
                setEventsData(eventsData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        Cookies.set('currentPage', 'bid');
    }, [navigate, roleId, permissions, userId]);

    const changeCurrentBidTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setBidCurrentTab(selectedTab);
    };

    const handleStatusChange = async (id, newStatus, type) => {
        try {
            const refPath = type === 'News' ? `News/${id}` : `Events/${id}`;
            const dataRef = ref(database, refPath);
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const dataItem = snapshot.val();
                dataItem.status = newStatus;
                await set(dataRef, dataItem);

                if (type === 'News') {
                    setNewsData(newsData.map(news => news.id === id ? { ...news, status: newStatus } : news));
                } else {
                    setEventsData(eventsData.map(event => event.id === id ? { ...event, status: newStatus } : event));
                }
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    const handleAddNews = async (newsItem) => {
        try {
            const newsRef = ref(database, 'News');
            const newNewsRef = push(newsRef);
            await set(newNewsRef, {
                ...newsItem,
                organizer: userId,
                organizer_email: userEmail
            });
            setNewsData([...newsData, { ...newsItem, id: newNewsRef.key, organizer: userId, organizer_email: userEmail }]);
        } catch (error) {
            console.error("Ошибка при добавлении новости:", error);
        }
    };

    const handleAddEvent = async (eventItem) => {
        try {
            const eventsRef = ref(database, 'Events');
            const newEventRef = push(eventsRef);
            await set(newEventRef, {
                ...eventItem,
                organizer: userId,
                organizer_email: userEmail
            });
            setEventsData([...eventsData, { ...eventItem, id: newEventRef.key, organizer: userId, organizer_email: userEmail }]);
        } catch (error) {
            console.error("Ошибка при добавлении события:", error);
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

    const renderNews = (status) => {
        return newsData.filter(news => news.status === status && (roleId === '1' || news.organizer === userId)).map(news => (
            <div key={news.id} className="news-card-container">
                <StandartCard
                    status={news.status}
                    publicDate={news.postData}
                    title={news.title}
                    text={news.text}
                    images={news.images}
                />
                <div className="news-card-actions">
                    <Link to={`/news/${news.id}`} className="news-card-eye-link" title="Посмотреть новость">
                        <img src={imgEyeOpened} alt="Посмотреть" className="news-card-eye-icon" />
                    </Link>
                    {status === 'На модерации' && (
                        <img 
                            src={imgEdit} 
                            alt="Редактировать" 
                            className="news-card-edit-icon" 
                            title="Редактировать новость" 
                            onClick={() => handleEdit('News', news.id)} 
                        />
                    )}
                    {status === 'Архив' && (
                        <button className="view-btn" onClick={() => handleStatusChange(news.id, 'Одобрено', 'News')}>
                            <img src={imgEyeOpened} alt="Из архива" />
                            <span>Из архива</span>
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    const renderEvents = (status) => {
        return eventsData.filter(event => event.status === status && (roleId === '1' || event.organizer === userId)).map(event => (
            <div key={event.id} className="news-card-container">
                <StandartCard
                    status={event.status}
                    publicDate={event.postData}
                    title={event.title}
                    text={event.text}
                    images={event.images}
                />
                <div className="news-card-actions">
                    <Link to={`/events/${event.id}`} className="news-card-eye-link" title="Посмотреть событие">
                        <img src={imgEyeOpened} alt="Посмотреть" className="news-card-eye-icon" />
                    </Link>
                    {status === 'На модерации' && (
                        <img 
                            src={imgEdit} 
                            alt="Редактировать" 
                            className="news-card-edit-icon" 
                            title="Редактировать событие" 
                            onClick={() => handleEdit('Events', event.id)} 
                        />
                    )}
                    {status === 'Архив' && (
                        <button className="view-btn" onClick={() => handleStatusChange(event.id, 'Одобрено', 'Events')}>
                            <img src={imgEyeOpened} alt="Из архива" />
                            <span>Из архива</span>
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    if (loading) return <Loader/>;
    if (error) return <p>{error}</p>;

    if (isEditPage) {
        return <EditBidPage setIsEditPage={setIsEditPage} typeForm={BidCurrentTab} id={editBidId} />;
    }

    return (
        <div className="bid-page page-content">
            {editMode ? (
                <EditBidPage 
                    setIsEditPage={handleCloseEdit} 
                    typeForm={editTypeForm} 
                    id={editBidId} 
                />
            ) : IsAddPage ? (
                <BidForm 
                    setIsAddPage={setIsAddPage} 
                    typeForm={BidCurrentTab} 
                    onAdd={BidCurrentTab === 'News' ? handleAddNews : handleAddEvent} 
                />
            ) : (
                <>
                    <div className="bid-page-head noselect">
                        <p className={`bid-page-head-tab ${BidCurrentTab === 'News' ? 'bid-page-head-tab-selected' : ''}`} data-tab="News" onClick={changeCurrentBidTabHandler}>Новости</p>
                        <p className={`bid-page-head-tab ${BidCurrentTab === 'Events' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Events" onClick={changeCurrentBidTabHandler}>События</p>
                        <div className="bid-page-btn-add" onClick={() => setIsAddPage(true)}>
                            <p>Предложить {BidCurrentTab === 'News' ? 'новость' : 'событие'}</p>
                        </div>
                    </div>
                    <div className="bid-page-head-2 noselect">
                        <div className="filter">
                            <img src={imgFilterIcon} alt="" />
                            <p>Фильтр</p>
                        </div>
                    </div>
                    <div className="bid-page-content">
                        {BidCurrentTab === 'News' && (
                            <>
                                <h2>Новые заявки</h2>
                                {renderNews('На модерации')}
                                <h2>Одобренные заявки</h2>
                                {renderNews('Одобрено')}
                                <h2>Опубликованные новости</h2>
                                {renderNews('Опубликовано')}
                                <h2>Отклоненные заявки</h2>
                                {renderNews('Отклонено')}
                            </>
                        )}
                        {BidCurrentTab === 'Events' && (
                            <>
                                <h2>Новые заявки</h2>
                                {renderEvents('На модерации')}
                                <h2>Одобренные заявки</h2>
                                {renderEvents('Одобрено')}
                                <h2>Опубликованные события</h2>
                                {renderEvents('Опубликовано')}
                                <h2>Отклоненные заявки</h2>
                                {renderEvents('Отклонено')}
                            </>
                        )}
                    </div>
                   
                </>
            )}
        </div>
    );
};

export default BidPage;
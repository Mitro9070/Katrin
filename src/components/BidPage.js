import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import StandartCard from '../components/StandartCard';
import CommentInput from '../components/CommentInput'; // Импорт компонента CommentInput

import imgArchiveIcon from '../images/archive.svg';
import imgFilterIcon from '../images/filter.svg';
import imgCheckIcon from '../images/checkmark.svg';
import imgTrashIcon from '../images/trash.svg';
import imgViewIcon from '../images/view.png';

import '../styles/BidPage.css';
import BidForm from './BidForm';

const BidPage = () => {
    const [IsAddPage, setIsAddPage] = useState(false);
    const [IsArchive, setIsArchive] = useState(false);
    const [BidCurrentTab, setBidCurrentTab] = useState('News');
    const [newsData, setNewsData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const roleId = Cookies.get('roleId');
    const permissions = getPermissions(roleId);
    const userId = Cookies.get('userId');
    const isRole3 = roleId === '3';

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId) {
                    navigate('/'); // Переадресация на главную страницу для гостей
                    return;
                }

                switch (roleId) {
                    case '1': // Администратор
                        if (!permissions.processingEvents && !permissions.processingNews && !permissions.publishingNews && !permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '3': // Авторизованный пользователь
                        if (!permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                const newsRef = ref(database, 'News');
                const eventsRef = ref(database, 'Events');

                const [newsSnapshot, eventsSnapshot] = await Promise.all([
                    get(newsRef),
                    get(eventsRef)
                ]);

                const newsData = [];
                const eventsData = [];

                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        if (roleId === '3' && item.organizer !== userId) return;
                        newsData.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        if (roleId === '3' && item.organizer !== userId) return;
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

    const handleStatusChange = async (id, newStatus, comment = '') => {
        try {
            if (BidCurrentTab === 'News') {
                const newsRef = ref(database, `News/${id}`);
                const newsSnapshot = await get(newsRef);
                if (newsSnapshot.exists()) {
                    const newsItem = newsSnapshot.val();
                    newsItem.status = newStatus;
                    if (comment) {
                        if (!newsItem.comments) {
                            newsItem.comments = [];
                        }
                        newsItem.comments.push(comment);
                    }
                    await set(newsRef, newsItem);
                    setNewsData(newsData.map(news => news.id === id ? newsItem : news));
                }
            } else if (BidCurrentTab === 'Events') {
                const eventRef = ref(database, `Events/${id}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                    const eventItem = eventSnapshot.val();
                    eventItem.status = newStatus;
                    if (comment) {
                        if (!eventItem.comments) {
                            eventItem.comments = [];
                        }
                        eventItem.comments.push(comment);
                    }
                    await set(eventRef, eventItem);
                    setEventsData(eventsData.map(event => event.id === id ? eventItem : event));
                }
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    const renderNews = (status) => {
        return newsData.filter(news => news.status === status).map(news => (
            <div key={news.id} className="news-card-container">
                <StandartCard
                    status={news.status}
                    publicDate={news.postData}
                    title={news.title}
                    text={news.text}
                    images={news.images}
                />
                {!isRole3 && (
                    <div className="news-card-comment">
                        <CommentInput
                            placeholder='Добавить комментарий'
                            onBlur={(e) => handleStatusChange(news.id, news.status, e.target.value)}
                        />
                    </div>
                )}
                <div className="news-card-actions">
                    {status === 'На модерации' && !isRole3 && (
                        <>
                            <button className="approve-btn" onClick={() => handleStatusChange(news.id, 'Одобрено')}>
                                <img src={imgCheckIcon} alt="Одобрить" />
                                <span>Одобрить заявку</span>
                            </button>
                            <button className="reject-btn" onClick={() => handleStatusChange(news.id, 'Отклонено')}>
                                <img src={imgTrashIcon} alt="Отклонить" />
                                <span>Отклонить заявку</span>
                            </button>
                        </>
                    )}
                    {status === 'Одобрено' && !isRole3 && (
                        <button className="publish-btn" onClick={() => handleStatusChange(news.id, 'Опубликовано')}>
                            <img src={imgCheckIcon} alt="Опубликовать" />
                            <span>Опубликовать</span>
                        </button>
                    )}
                    {status === 'Опубликовано' && !isRole3 && (
                        <>
                            <button className="view-btn">
                                <Link to={`/news/${news.id}`} >
                                    <img src={imgViewIcon} alt="Посмотреть" />
                                    <span>Посмотреть новость</span>
                                </Link>
                            </button>
                            <button className="view-btn" onClick={() => handleStatusChange(news.id, 'Одобрено')}>
                                <img src={imgTrashIcon} alt="Снять с публикации" />
                                <span>Снять с публикации</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        ));
    };

    const renderEvents = (status) => {
        return eventsData.filter(event => event.status === status).map(event => (
            <div key={event.id} className="news-card-container">
                <StandartCard
                    status={event.status}
                    publicDate={event.postData}
                    title={event.title}
                    text={event.text}
                    images={event.images}
                />
                {!isRole3 && (
                    <div className="news-card-comment">
                        <CommentInput
                            placeholder='Добавить комментарий'
                            onBlur={(e) => handleStatusChange(event.id, event.status, e.target.value)}
                        />
                    </div>
                )}
                <div className="news-card-actions">
                    {status === 'На модерации' && !isRole3 && (
                        <>
                            <button className="approve-btn" onClick={() => handleStatusChange(event.id, 'Одобрено')}>
                                <img src={imgCheckIcon} alt="Одобрить" />
                                <span>Одобрить заявку</span>
                            </button>
                            <button className="reject-btn" onClick={() => handleStatusChange(event.id, 'Отклонено')}>
                                <img src={imgTrashIcon} alt="Отклонить" />
                                <span>Отклонить заявку</span>
                            </button>
                        </>
                    )}
                    {status === 'Одобрено' && !isRole3 && (
                        <button className="publish-btn" onClick={() => handleStatusChange(event.id, 'Опубликовано')}>
                            <img src={imgCheckIcon} alt="Опубликовать" />
                            <span>Опубликовать</span>
                        </button>
                    )}
                    {status === 'Опубликовано' && !isRole3 && (
                        <>
                            <button className="view-btn">
                                <Link to={`/events/${event.id}`} >
                                    <img src={imgViewIcon} alt="Посмотреть" />
                                    <span>Посмотреть событие</span>
                                </Link>
                            </button>
                            <button className="view-btn" onClick={() => handleStatusChange(event.id, 'Одобрено')}>
                                <img src={imgTrashIcon} alt="Снять с публикации" />
                                <span>Снять с публикации</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        ));
    };

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="bid-page page-content">
            <div className="bid-page-head noselect">
                <p className={`bid-page-head-tab ${BidCurrentTab === 'News' ? 'bid-page-head-tab-selected' : ''}`} data-tab="News" onClick={changeCurrentBidTabHandler}>Новости</p>
                <p className={`bid-page-head-tab ${BidCurrentTab === 'Events' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Events" onClick={changeCurrentBidTabHandler}>События</p>
                {!IsAddPage && (
                    <div className="bid-page-btn-add" onClick={() => setIsAddPage(true)}>
                        <p>Предложить {BidCurrentTab === 'News' ? 'новость' : 'событие'}</p>
                    </div>
                )}
            </div>
            {!IsAddPage && (
                <div className="bid-page-head-2 noselect">
                    <div className="filter">
                        <img src={imgFilterIcon} alt="" />
                        <p>Фильтр</p>
                    </div>
                    <div className={`archive ${IsArchive ? 'archive-active' : ''}`} onClick={() => setIsArchive(!IsArchive)}>
                        <img src={imgArchiveIcon} alt="" />
                        <p>Архив</p>
                    </div>
                </div>
            )}
            <div className="bid-page-content">
                {BidCurrentTab === 'News' && !IsAddPage && (
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
                {BidCurrentTab === 'Events' && !IsAddPage && (
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
                {BidCurrentTab === 'News' && IsAddPage && (
                    <BidForm setIsAddPage={setIsAddPage} typeForm={'News'} />
                )}
                {BidCurrentTab === 'Events' && IsAddPage && (
                    <BidForm setIsAddPage={setIsAddPage} typeForm={'Events'} />
                )}
            </div>
            <Footer />
        </div>
    );
};

export default BidPage;
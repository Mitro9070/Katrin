import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, get, set, push } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';
import Footer from './Footer';
import StandartCard from '../components/StandartCard';

import imgFilterIcon from '../images/filter.svg';
import imgViewIcon from '../images/view.png';  // Import the image for view button

import '../styles/BidPage.css';
import BidForm from './BidForm';

const BidPage = () => {
    const [IsAddPage, setIsAddPage] = useState(false);
    const [BidCurrentTab, setBidCurrentTab] = useState('News');
    const [newsData, setNewsData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const roleId = Cookies.get('roleId');
    const permissions = getPermissions(roleId);
    const userId = Cookies.get('userId');
    const userEmail = Cookies.get('userEmail');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId) {
                    navigate('/');
                    return;
                }

                switch (roleId) {
                    case '1':
                        if (!permissions.processingEvents && !permissions.processingNews && !permissions.publishingNews && !permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к админу.');
                        }
                        break;
                    case '3':
                    case '6':
                        if (!permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к админу.');
                        }
                        break;
                    case '4':
                        if (!permissions.processingNews && !permissions.publishingNews) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к админу.');
                        }
                        break;
                    case '5':
                        if (!permissions.processingEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к админу.');
                        }
                        break;
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к админу.');
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
                        if ((roleId === '3' || roleId === '6') && item.organizer !== userId) return;
                        if (roleId === '5' && item.organизатор !== userId) return;
                        newsData.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        if ((roleId === '3' || roleId === '4' || roleId === '6') && item.organизатор !== userId) return;
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
                <div className="news-card-actions">
                    <button className="view-btn">
                        <Link to={`/news/${news.id}`}>
                            <img src={imgViewIcon} alt="Посмотреть" />
                            <span>Посмотреть новость</span>
                        </Link>
                    </button>
                    {status === 'Архив' && (
                        <button className="view-btn" onClick={() => handleStatusChange(news.id, 'Одобрено', 'News')}>
                            <img src={imgViewIcon} alt="Из архива" />
                            <span>Из архива</span>
                        </button>
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
                <div className="news-card-actions">
                    <button className="view-btn">
                        <Link to={`/events/${event.id}`}>
                            <img src={imgViewIcon} alt="Посмотреть"/>
                            <span>Посмотреть событие</span>
                        </Link>
                    </button>
                    {status === 'Архив' && (
                        <button className="view-btn" onClick={() => handleStatusChange(event.id, 'Одобрено', 'Events')}>
                            <img src={imgViewIcon} alt="Из архива" />
                            <span>Из архива</span>
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    if (loading) return <Loader/>;
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
                       {/*  <h2>Заявки из архива</h2>
                        {renderNews('Архив')} */}
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
                       {/*  <h2>Заявки из архива</h2>
                        {renderEvents('Архив')} */}
                    </>
                )}
                {BidCurrentTab === 'News' && IsAddPage && (
                    <BidForm setIsAddPage={setIsAddPage} typeForm={'News'} onAdd={handleAddNews} />
                )}
                {BidCurrentTab === 'Events' && IsAddPage && (
                    <BidForm setIsAddPage={setIsAddPage} typeForm={'Events'} onAdd={handleAddEvent} />
                )}
            </div>
            <Footer />
        </div>
    );
};

export default BidPage;
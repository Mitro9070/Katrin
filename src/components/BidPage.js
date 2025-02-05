// src\components\BidPage.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import Loader from './Loader';

import StandartCard from '../components/StandartCard';
import EditBidPage from './EditBidPage';

import imgFilterIcon from '../images/filter.svg';
import imgEyeOpened from '../images/eye-opened.svg';
import imgEdit from '../images/edit.png';
import noFoto from '../images/nofoto2.jpg';
import eventsPlaceholder from '../images/events.jpg';

import '../styles/BidPage.css';
import BidForm from './BidForm';

import { fetchNews, addNews, editNews, deleteNews } from '../Controller/NewsController';
import { fetchEvents, addEvent, editEvent, deleteEvent } from '../Controller/EventsController';
import { getImageUrl } from '../utils/getImageUrl';

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

    const roleId = Cookies.get('roleId') || '2';
    const permissions = getPermissions(roleId);
    const userId = Cookies.get('userId');
    const userEmail = Cookies.get('userEmail');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!userId) {
                    navigate('/');
                    return;
                }

                // Загрузка данных новостей
                const newsResponse = await fetchNews();
                let newsDataItems = newsResponse.news || [];

                // Загрузка данных событий
                const eventsResponse = await fetchEvents();
                let eventsDataItems = eventsResponse || [];

                // Фильтрация данных по роли пользователя
                if (roleId !== '1') {
                    newsDataItems = newsDataItems.filter(item => item.owner === userId);
                    eventsDataItems = eventsDataItems.filter(item => item.owner === userId);
                }

                setNewsData(newsDataItems);
                setEventsData(eventsDataItems);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        Cookies.set('currentPage', 'bid');
    }, [navigate, roleId, userId]);

    const changeCurrentBidTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setBidCurrentTab(selectedTab);
    };

    const handleStatusChange = async (id, newStatus, type) => {
        try {
            if (type === 'News') {
                const newsItem = newsData.find(news => news.id === id);
                if (newsItem) {
                    const updatedNews = { ...newsItem, status: newStatus };
                    await editNews(id, updatedNews);
                    setNewsData(newsData.map(news => news.id === id ? updatedNews : news));
                }
            } else {
                const eventItem = eventsData.find(event => event.id === id);
                if (eventItem) {
                    const updatedEvent = { ...eventItem, status: newStatus };
                    await editEvent(id, updatedEvent);
                    setEventsData(eventsData.map(event => event.id === id ? updatedEvent : event));
                }
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    };

    const handleAddNews = async (newsItem) => {
        try {
            const newNews = await addNews({
                ...newsItem,
                owner: userId,
                organizer_email: userEmail,
            });
            setNewsData([...newsData, { ...newNews, ...newsItem, owner: userId, organizer_email: userEmail }]);
            setIsAddPage(false);
        } catch (error) {
            console.error("Ошибка при добавлении новости:", error);
        }
    };

    const handleAddEvent = async (eventItem) => {
        try {
            const newEvent = await addEvent({
                ...eventItem,
                owner: userId,
                organizer_email: userEmail,
            });
            setEventsData([...eventsData, { ...newEvent, ...eventItem, owner: userId, organizer_email: userEmail }]);
            setIsAddPage(false);
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
        return newsData
            .filter(news => news.status === status && (roleId === '1' || news.owner === userId))
            .sort((a, b) => new Date(b.postData) - new Date(a.postData))
            .map(news => (
                <div key={news.id} className="news-card-container">
                    <StandartCard
                        publicDate={news.postData}
                        title={news.title}
                        text={news.text}
                        images={news.image ? [getImageUrl(news.image)] : [noFoto]}
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
                        {(status === 'Архив' || status === 'Отклонено') && (
                            <button className="view-btn" onClick={() => handleStatusChange(news.id, 'На модерации', 'News')}>
                                <img src={imgEyeOpened} alt="Из архива" />
                                <span>На модерацию</span>
                            </button>
                        )}
                    </div>
                </div>
            ));
    };

    const renderEvents = (status) => {
        return eventsData
            .filter(event => event.status === status && (roleId === '1' || event.owner === userId))
            .sort((a, b) => new Date(b.postData) - new Date(a.postData))
            .map(event => (
                <div key={event.id} className="news-card-container">
                    <StandartCard
                        publicDate={event.postData}
                        title={event.title}
                        text={event.text}
                        images={event.image ? [getImageUrl(event.image)] : [eventsPlaceholder]}
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
{(status === 'Архив' || status === 'Отклонено') && (
    <button className="view-btn" onClick={() => handleStatusChange(event.id, 'На модерации', 'Events')}>
        <img src={imgEyeOpened} alt="На модерацию" />
        <span>На модерацию</span>
    </button>
)}
</div>
</div>
));
};

if (loading) return <Loader />;
if (error) return <p>{error}</p>;

if (editMode) {
    return (
        <EditBidPage 
            setIsEditPage={handleCloseEdit} 
            typeForm={editTypeForm} 
            id={editBidId} 
        />
    );
}

return (
    <div className="bid-page page-content">
        {IsAddPage ? (
            <BidForm 
                setIsAddPage={setIsAddPage} 
                typeForm={BidCurrentTab} 
                onAdd={BidCurrentTab === 'News' ? handleAddNews : handleAddEvent} 
            />
        ) : (
            <>
                <div className="bid-page-head noselect">
                    <p
                        className={`bid-page-head-tab ${BidCurrentTab === 'News' ? 'bid-page-head-tab-selected' : ''}`}
                        data-tab="News"
                        onClick={changeCurrentBidTabHandler}
                    >
                        Новости
                    </p>
                    <p
                        className={`bid-page-head-tab ${BidCurrentTab === 'Events' ? 'bid-page-head-tab-selected' : ''}`}
                        data-tab="Events"
                        onClick={changeCurrentBidTabHandler}
                    >
                        События
                    </p>
                    <div className="bid-page-btn-add" onClick={() => setIsAddPage(true)}>
                        <p>Предложить {BidCurrentTab === 'News' ? 'новость' : 'событие'}</p>
                    </div>
                </div>
                <div className="bid-page-head-2 noselect">
                    <div className="filter">
                        <img src={imgFilterIcon} alt="Фильтр" />
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
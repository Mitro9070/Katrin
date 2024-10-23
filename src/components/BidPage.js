import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { Link } from 'react-router-dom';
import { navigationStore } from '../stores/NavigationStore';
import { newsContentStore } from '../stores/NewsContentStore';
import { bidContentStore } from '../stores/BidContentStore';

import imgArchiveIcon from '../images/archive.svg';
import imgFilterIcon from '../images/filter.svg';
import imgCheckIcon from '../images/checkmark.svg'; // Импортируем иконку
import imgTrashIcon from '../images/trash.svg'; // Импортируем иконку
import imgViewIcon from '../images/view.png'; // Импортируем иконку просмотра

import '../styles/BidPage.css';
import BidForm from './BidForm';
import Footer from './Footer';
import StandartCard from '../components/StandartCard';
import CommentInput from '../components/CommentInput';

const BidPage = observer(() => {
    const [IsAddPage, setIsAddPage] = useState(false);
    const [IsArchive, setIsArchive] = useState(false);
    const [BidCurrentTab, setBidCurrentTab] = useState('News');

    useEffect(() => {
        setBidCurrentTab(navigationStore.currentBidTab);
        console.log(navigationStore.currentBidTab);
        if (navigationStore.currentBidTab === 'News') {
            newsContentStore.fetchData();
        } else if (navigationStore.currentBidTab === 'Events') {
            bidContentStore.fetchData();
        }
    }, []);

    const changeCurrentBidTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setBidCurrentTab(selectedTab);
        navigationStore.setCurrentBidTab(selectedTab);
        if (selectedTab === 'News') {
            newsContentStore.fetchData();
        } else if (selectedTab === 'Events') {
            bidContentStore.fetchData();
        }
    };

    const handleStatusChange = action(async (id, newStatus, comment = '') => {
        try {
            if (BidCurrentTab === 'News') {
                const newsItem = newsContentStore.getNewsById(id);
                newsItem.status = newStatus;
                if (comment) {
                    if (!newsItem.comments) {
                        newsItem.comments = [];
                    }
                    newsItem.comments.push(comment);
                }
                await newsContentStore.updateNews(id, newsItem);
                newsContentStore.fetchData();
            } else if (BidCurrentTab === 'Events') {
                const bidItem = bidContentStore.getWithId(BidCurrentTab, id)[0];
                bidItem.status = newStatus;
                if (comment) {
                    if (!bidItem.comments) {
                        bidItem.comments = [];
                    }
                    bidItem.comments.push(comment);
                }
                await bidContentStore.updateBid(id, bidItem);
                bidContentStore.fetchData();
            }
        } catch (error) {
            console.error("Ошибка при изменении статуса:", error);
        }
    });

    const renderNews = (status) => {
        return newsContentStore.News.filter(news => news.status === status).map(news => (
            <div key={news.id} className="news-card-container">
                <StandartCard
                    status={news.status}
                    publicDate={news.postData}
                    title={news.title}
                    text={news.text}
                    images={news.images}
                />
                <div className="news-card-comment">
                    <CommentInput
                        placeholder='Добавить комментарий'
                        onBlur={(e) => handleStatusChange(news.id, news.status, e.target.value)}
                    />
                </div>
                <div className="news-card-actions">
                    {status === 'На модерации' && (
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
                    {status === 'Одобрено' && (
                        <button className="publish-btn" onClick={() => handleStatusChange(news.id, 'Опубликовано')}>
                            <img src={imgCheckIcon} alt="Опубликовать" />
                            <span>Опубликовать</span>
                        </button>
                    )}
                    {status === 'Опубликовано' && (
                        <button className="view-btn">
                            <Link to={`/news/${news.id}`} >
                                <img src={imgViewIcon} alt="Посмотреть" />
                                <span>Посмотреть новость</span>
                            </Link>
                        </button>
                    )}
                </div>
            </div>
        ));
    };

    const renderEvents = (status) => {
        return bidContentStore.getWithStatus(BidCurrentTab, status).map(bid => (
            <div key={bid.id} className="news-card-container">
                <StandartCard
                    status={bid.status}
                    publicDate={bid.postData}
                    title={bid.title}
                    text={bid.text}
                    images={bid.images}
                />
                <div className="news-card-comment">
                    <CommentInput
                        placeholder='Добавить комментарий'
                        onBlur={(e) => handleStatusChange(bid.id, bid.status, e.target.value)}
                    />
                </div>
                <div className="news-card-actions">
                    {status === 'На модерации' && (
                        <>
                            <button className="approve-btn" onClick={() => handleStatusChange(bid.id, 'Одобрено')}>
                                <img src={imgCheckIcon} alt="Одобрить" />
                                <span>Одобрить заявку</span>
                            </button>
                            <button className="reject-btn" onClick={() => handleStatusChange(bid.id, 'Отклонено')}>
                                <img src={imgTrashIcon} alt="Отклонить" />
                                <span>Отклонить заявку</span>
                            </button>
                        </>
                    )}
                    {status === 'Одобрено' && (
                        <button className="publish-btn" onClick={() => handleStatusChange(bid.id, 'Опубликовано')}>
                            <img src={imgCheckIcon} alt="Опубликовать" />
                            <span>Опубликовать</span>
                        </button>
                    )}
                    {status === 'Опубликовано' && (
                        <button className="view-btn">
                            <Link to={`/events/${bid.id}`} className="link-btn">
                                <img src={imgViewIcon} alt="Посмотреть" />
                                <span>Посмотреть событие</span>
                            </Link>
                        </button>
                    )}
                </div>
            </div>
        ));
    };

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
});

export default BidPage;
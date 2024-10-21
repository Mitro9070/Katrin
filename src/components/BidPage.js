import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { navigationStore } from '../stores/NavigationStore';
import { newsContentStore } from '../stores/NewsContentStore';

import imgArchiveIcon from '../images/archive.svg';
import imgFilterIcon from '../images/filter.svg';
import imgCheckIcon from '../images/checkmark.svg'; // Импортируем иконку
import imgTrashIcon from '../images/trash.svg'; // Импортируем иконку

import '../styles/BidPage.css';
import BidForm from './BidForm';
import Footer from './Footer';
import StandartCard from '../components/StandartCard';
import CustomInput from '../components/CustomInput';

const BidPage = observer(() => {
    const [IsAddPage, setIsAddPage] = useState(false);
    const [IsArchive, setIsArchive] = useState(false);
    const [BidCurrentTab, setBidCurrentTab] = useState('News');

    useEffect(() => {
        setBidCurrentTab(navigationStore.currentBidTab);
        console.log(navigationStore.currentBidTab);
        newsContentStore.fetchData();
    }, []);

    const changeCurrentBidTabHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setBidCurrentTab(selectedTab);
        navigationStore.setCurrentBidTab(selectedTab);
    };

    const handleStatusChange = action(async (id, newStatus, comment = '') => {
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
    });

    const renderNews = (status) => {
        return newsContentStore.News.filter(news => news.status === status).map(news => (
            <div key={news.id} className="news-card">
                <StandartCard
                    status={news.status}
                    publicDate={news.postData}
                    title={news.title}
                    text={news.text}
                    images={news.images}
                />
                <div className="news-card-comment">
                    <CustomInput
                        width='100%'
                        placeholder='Добавить комментарий'
                        onBlur={(e) => handleStatusChange(news.id, news.status, e.target.value)}
                    />
                </div>
                <div className="news-card-actions">
                    {status === 'На модерации' && (
                        <>
                            <button className="approve-btn" onClick={() => handleStatusChange(news.id, 'Одобрено')}>
                                <img src={imgCheckIcon} alt="Одобрить" />
                                Одобрить заявку
                            </button>
                            <button className="reject-btn" onClick={() => handleStatusChange(news.id, 'Отклонено')}>
                                <img src={imgTrashIcon} alt="Отклонить" />
                                Отклонить заявку
                            </button>
                        </>
                    )}
                    {status === 'Одобрено' && (
                        <button className="publish-btn" onClick={() => handleStatusChange(news.id, 'Опубликовано')}>
                            Опубликовать
                        </button>
                    )}
                    {status === 'Опубликовано' && (
                        <button className="view-btn" onClick={() => window.open(news.link, '_blank')}>
                            Посмотреть новость
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
                        {renderNews('На модерации')}
                        <h2>Одобренные заявки</h2>
                        {renderNews('Одобрено')}
                        <h2>Опубликованные новости</h2>
                        {renderNews('Опубликовано')}
                        <h2>Отклоненные заявки</h2>
                        {renderNews('Отклонено')}
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
import '../styles/NewsPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { navigationStore } from '../stores/NavigationStore';
import { newsContentStore } from '../stores/NewsContentStore';
import StandartCard from './StandartCard';

const NewsPage = observer(() => {
    const [currentTab, setCurrentTab] = useState('All');

    useEffect(() => {
        setCurrentTab(() => navigationStore.currentNewsTab);
        newsContentStore.fetchData();
    }, []);

    const newsTypeList = { 'Ads': 'Объявления', 'Devices': 'Устройства и ПО', 'Activity': 'Мероприятия' };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentNewsTab(selectedTab);
    };

    const renderNews = (type) => {
        // Сортируем новости: сначала по дате (новые впереди), затем без даты в конце
        const sortedNews = [...newsContentStore.News].sort((a, b) => {
            if (!a.postData) return 1;
            if (!b.postData) return -1;
            return new Date(b.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + b.postData.split(', ')[1]) - 
                   new Date(a.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + a.postData.split(', ')[1]);
        });

        if (type) {
            return sortedNews.filter(news => news.elementType === type).map(e => (
                <Link to={`/news/${e.id}`} key={e.id}>
                    <StandartCard title={e.title} text={e.text} publicDate={e.postData} images={e.images} />
                </Link>
            ));
        } else {
            return sortedNews.map(e => (
                <Link to={`/news/${e.id}`} key={e.id}>
                    <StandartCard title={e.title} text={e.text} publicDate={e.postData} images={e.images} />
                </Link>
            ));
        }
    };

    return (
        <div className="page-content news-page">
            <div className="bid-page-head noselect">
                <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                <p className={`bid-page-head-tab ${currentTab === 'Ads' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Ads" onClick={onTabClickHandler}>Объявления</p>
                <p className={`bid-page-head-tab ${currentTab === 'Devices' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Devices" onClick={onTabClickHandler}>Устройства и ПО</p>
                <p className={`bid-page-head-tab ${currentTab === 'Activity' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Activity" onClick={onTabClickHandler}>Мероприятия</p>
            </div>
            <div className="news-page-content">
                {currentTab !== 'All' && renderNews(newsTypeList[currentTab])}
                {currentTab === 'All' && renderNews()}
            </div>
        </div>
    );
});

export default NewsPage;
import { useState, useEffect } from 'react';
import { navigationStore } from '../stores/NavigationStore';
import { newsContentStore } from '../stores/NewsContentStore';
import { useParams, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import MainContentSinglePage from './MainContentSinglePage';
import NotFoundPage from './NotFoundPage';

import Loader from "./Loader";

const SingleNewsPage = observer(() => {
    const { id } = useParams();
    const [currentTab, setCurrentTab] = useState('All');
    const [news, setNews] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchNews() {
            try {
                setCurrentTab(navigationStore.currentNewsTab);
                await newsContentStore.fetchData();  // Подгружаем данные
                const fetchedNews = newsContentStore.getNewsById(id);
                if (fetchedNews) {
                    setNews(fetchedNews);
                } else {
                    setError('Новость не найдена');
                }
            } catch (err) {
                setError('Ошибка при загрузке новости');
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, [id]);

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentNewsTab(selectedTab);
    }

    if (loading) return <div className="page-content single-news-page block-slide-loader"><Loader /></div>;  // Индикатор загрузки
    if (error) return <NotFoundPage />;  // Обработка ошибки

    return (  
        <div className="page-content single-news-page">
            <Link to={'/news'}>
                <div className="bid-page-head noselect">
                    <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Ads' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Ads" onClick={onTabClickHandler}>Объявления</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Devices' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Devices" onClick={onTabClickHandler}>Устройства и ПО</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Activity' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Activity" onClick={onTabClickHandler}>Мероприятия</p>
                </div>
            </Link>
            <MainContentSinglePage linkTo={'/news'} onClick={() => navigationStore.setCurrentNewsTab(currentTab)} data={news} />
        </div>
    );
});

export default SingleNewsPage;

import '../styles/SingleEventsPage.css';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { navigationStore } from '../stores/NavigationStore';
import { bidContentStore } from '../stores/BidContentStore';
import MainContentSinglePage from './MainContentSinglePage';
import Footer from './Footer';
import NotFoundPage from './NotFoundPage';

import Loader from "./Loader";

const SingleEventsPage = observer(() => {
    const { id } = useParams();
    const [currentTab, setCurrentTab] = useState('All');
    const [event, setEvent] = useState({});
    const [loading, setLoading] = useState(true); // Индикатор загрузки
    const [error, setError] = useState(null); // Обработка ошибок

    useEffect(() => {
        async function fetchEvent() {
            try {
                setCurrentTab(navigationStore.currentNewsTab);
                await bidContentStore.fetchData(); // Асинхронная загрузка данных
                const fetchedEvent = bidContentStore.getWithId('Events', id)[0];
                if (fetchedEvent) {
                    setEvent(fetchedEvent);
                } else {
                    setError('Событие не найдено');
                }
            } catch (err) {
                setError('Ошибка при загрузке события');
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [id]);

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab;
        setCurrentTab(selectedTab);
        navigationStore.setCurrentNewsTab(selectedTab);
    }

    if (loading) return <div className="page-content single-events-page block-slide-loader"><Loader /></div>;  // Показ индикатора загрузки
    if (error) return <NotFoundPage />;  // Показ сообщения об ошибке

    return (
        <div className="page-content single-events-page">
            <Link to={'/events'}>
                <div className="bid-page-head noselect">
                    <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Ads' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Ads" onClick={onTabClickHandler}>Объявления</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Devices' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Devices" onClick={onTabClickHandler}>Устройства и ПО</p>
                    <p className={`bid-page-head-tab ${currentTab === 'Activity' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Activity" onClick={onTabClickHandler}>Мероприятия</p>
                </div>
            </Link>
            <MainContentSinglePage linkTo={'/events'} onClick={() => navigationStore.setCurrentNewsTab(currentTab)} data={event} isEvent={true} />
            <Footer />
        </div>
    );
});

export default SingleEventsPage;
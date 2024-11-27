import '../styles/SingleEventsPage.css';
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import MainContentSinglePage from './MainContentSinglePage';
import Footer from './Footer';
import NotFoundPage from './NotFoundPage';
import Loader from "./Loader";

const SingleEventsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('All');
    const [event, setEvent] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const referrer = new URLSearchParams(location.search).get('referrer') || '/events';

    useEffect(() => {
        async function fetchEvent() {
            try {
                const eventRef = ref(database, `Events/${id}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                    setEvent(eventSnapshot.val());
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
    };

    const handleBack = () => {
        navigate(referrer); // Возвращаемся на переданную страницу или на главную
    };

    if (loading) return <div className="page-content single-events-page block-slide-loader"><Loader /></div>;  // Показ индикатора загрузки
    if (error) return <NotFoundPage />;  // Показ сообщения об ошибке

    return (
        <div className="page-content single-events-page">
            <Link to={referrer} onClick={handleBack} className="back-button">Назад</Link>
            {/* <div className="bid-page-head noselect">
                <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                <p className={`bid-page-head-tab ${currentTab === 'Ads' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Ads" onClick={onTabClickHandler}>Объявления</p>
                <p className={`bid-page-head-tab ${currentTab === 'Devices' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Devices" onClick={onTabClickHandler}>Устройства и ПО</p>
                <p className={`bid-page-head-tab ${currentTab === 'Activity' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Activity" onClick={onTabClickHandler}>Мероприятия</p>
            </div> */}
            <MainContentSinglePage linkTo={referrer} data={event} isEvent={true} />
           
        </div>
    );
};

export default SingleEventsPage;
import '../styles/SingleEventsPage.css';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { eventsStore } from '../stores/EventsStore';
import MainContentSinglePage from './MainContentSinglePage';
import Footer from './Footer';
import NotFoundPage from './NotFoundPage';

import Loader from "./Loader";

const SingleEventsPage = observer(() => {
    const { id } = useParams();
    const [event, setEvent] = useState({});
    const [loading, setLoading] = useState(true); // Индикатор загрузки
    const [error, setError] = useState(null); // Обработка ошибок

    useEffect(() => {
        async function fetchEvent() {
            try {
                await eventsStore.fetchData(); // Асинхронная загрузка данных
                const fetchedEvent = eventsStore.getEventById(id);
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

    if (loading) return <div className="page-content single-events-page block-slide-loader"><Loader /></div>;  // Показ индикатора загрузки
    if (error) return <NotFoundPage />;  // Показ сообщения об ошибке

    return (
        <div className="page-content single-events-page">
            <MainContentSinglePage linkTo={'/events'} onClick={() => {}} data={event} isEvent={true} />
            <Footer />
        </div>
    );
});

export default SingleEventsPage;
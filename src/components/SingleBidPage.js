import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/SingleBidPage.css';
import { observer } from 'mobx-react-lite';
import { bidContentStore } from '../stores/BidContentStore';
import { navigationStore } from '../stores/NavigationStore';
import MainContentSinglePage from './MainContentSinglePage';
import NotFoundPage from './NotFoundPage';

import Loader from "./Loader";

const SingleBidPage = observer(() => {
    const { bidType, id } = useParams();
    const [bid, setBid] = useState({});
    const [loading, setLoading] = useState(true);  // Индикатор загрузки
    const [error, setError] = useState(null);  // Обработка ошибок

    const statusesList = {
        'В процессе': 'В процессе рассмотрения администратором',
        'Одобрено': 'Одобрено администратором',
        'Отклонено': 'Отклонено администратором'
    };

    useEffect(() => {
        async function fetchBid() {
            try {
                await bidContentStore.fetchData();  // Асинхронная загрузка данных
                const fetchedBid = bidContentStore.getWithId(bidType, id)[0];
                if (fetchedBid) {
                    setBid(fetchedBid);
                } else {
                    setError('Заявка не найдена');
                }
            } catch (err) {
                setError('Ошибка при загрузке заявки');
            } finally {
                setLoading(false);
            }
        }

        fetchBid();
    }, [bidType, id]);

    if (loading) return <div className="page-content single-news-page block-slide-loader"><Loader /></div>;  // Показ индикатора загрузки
    if (error) return <NotFoundPage />;  // Показ сообщения об ошибке

    return (
        <div className="page-content single-bid-page">
            <div className="bid-page-head noselect">
                <Link to='/bid' onClick={() => navigationStore.setCurrentBidTab(bid?.eventType ? 'Events' : 'News')}>
                    <p className={`bid-page-head-tab ${bid?.eventType ? '' : 'bid-page-head-tab-selected'}`} data-tab="News">
                        Новости
                    </p>
                </Link>
                <Link to='/bid'>
                    <p className={`bid-page-head-tab ${bid?.eventType ? 'bid-page-head-tab-selected' : ''}`} data-tab="Events" onClick={() => navigationStore.setCurrentBidTab(bid?.eventType ? 'Events' : 'News')}>
                        События
                    </p>
                </Link>
            </div>
            <MainContentSinglePage linkTo={'/bid'} onClick={() => navigationStore.setCurrentBidTab(bid?.eventType ? 'Events' : 'News')} data={bid} status={statusesList[bid?.status]} />
        </div>
    );
});

export default SingleBidPage;

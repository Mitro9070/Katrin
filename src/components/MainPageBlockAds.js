import { useState, useEffect, useRef } from "react";
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import { Link } from 'react-router-dom';

import '../styles/MainPageBlockAds.css';

import imgFixedIcon from '../images/fixed.svg';
import Loader from "./Loader";

function MainPageBlockAds() {
    const [importantAds, setImportantAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const adsWrapperRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const newsRef = ref(database, 'News');
                const eventsRef = ref(database, 'Events');

                const [newsSnapshot, eventsSnapshot] = await Promise.all([
                    get(newsRef),
                    get(eventsRef)
                ]);

                const importantAds = [];

                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const displayUpToDate = new Date(item.display_up_to);
                        const today = new Date();
                        if (item.status === 'Опубликовано' && item.elementType === 'Объявления' && displayUpToDate >= today) {
                            importantAds.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const displayUpToDate = new Date(item.display_up_to);
                        const today = new Date();
                        if (item.status === 'Опубликовано' && item.elementType === 'Объявления' && displayUpToDate >= today) {
                            importantAds.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                // Разделение на фиксированные и обычные объявления
                const fixedAds = importantAds.filter(ad => ad.fixed);
                const regularAds = importantAds.filter(ad => !ad.fixed);

                // Сортировка фиксированных и обычных объявлений по дате
                const sortedFixedAds = fixedAds.sort((a, b) => new Date(b.postData) - new Date(a.postData));
                const sortedRegularAds = regularAds.sort((a, b) => new Date(b.postData) - new Date(a.postData));

                // Объединение фиксированных и обычных объявлений
                const sortedAds = [...sortedFixedAds, ...sortedRegularAds];

                setImportantAds(sortedAds);
            } catch (err) {
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        }

        fetchData(); // Вызываем функцию загрузки данных
    }, []);

    const handleScroll = () => {
        // Логика для обработки скролла, если необходима
    };

    if (loading) return <div className="main-page-block-ads custom-scrollbar main-page-block-ads-loader"><Loader /></div>; // Состояние загрузки
    if (error) return <p>{error}</p>; // Обработка ошибок

    return (
        <div className="main-page-block-ads custom-scrollbar" ref={adsWrapperRef} onScroll={handleScroll}>
            <div className="ads-container">
                {importantAds.length > 0 && (
                    importantAds.map((ad) => (
                        <Link to={`/${ad.elementType === 'Объявления' ? 'news' : 'events'}/${ad.id}`} key={ad.id}>
                            <div className="important-ad-string">
                                {ad.fixed && <img src={imgFixedIcon} alt="Закреплено" />}
                                <div className="main-page-block-ad">
                                    <p>{ad.title}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default MainPageBlockAds;
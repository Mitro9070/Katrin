import { useState, useEffect } from "react";
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
                        if (item.status === 'Опубликовано' && item.fixed) {
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
                        if (item.status === 'Опубликовано' && item.fixed) {
                            importantAds.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                setImportantAds(importantAds);
            } catch (err) {
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        }

        fetchData(); // Вызываем функцию загрузки данных
    }, []);

    if (loading) return <div className="main-page-block-ads custom-scrollbar main-page-block-ads-loader"><Loader /></div>; // Состояние загрузки
    if (error) return <p>{error}</p>; // Обработка ошибок

    return ( 
        <div className="main-page-block-ads custom-scrollbar">
            {importantAds.length > 0 && ( 
                importantAds.map((ad) => (
                    <Link to={`/${ad.elementType === 'Объявления' ? 'news' : 'events'}/${ad.id}`} key={ad.id}>
                        <div className="important-ad-string">
                            <img src={imgFixedIcon} alt="Закреплено" />
                            <div className="main-page-block-ad">
                                <p>{ad.title}</p>  
                            </div>
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
}

export default MainPageBlockAds;
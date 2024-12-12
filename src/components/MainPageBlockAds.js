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
                const today = new Date();

                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const displayUpToDate = new Date(item.display_up_to);
                        const postDate = new Date(item.postData);

                        // Добавляем логику для фильтрации и отображения
                        if (item.status === 'Опубликовано' && item.elementType === 'Объявления') {
                            if (item.fixed) {
                                // Если display_up_to не задано, показываем на 2 дня с момента postData
                                if (!item.display_up_to && (postDate <= today && postDate >= new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)))) {
                                    importantAds.push({
                                        ...item,
                                        id: childSnapshot.key
                                    });
                                } else if (displayUpToDate >= today) {
                                    importantAds.push({
                                        ...item,
                                        id: childSnapshot.key
                                    });
                                }
                            } else if (displayUpToDate >= today) {
                                importantAds.push({
                                    ...item,
                                    id: childSnapshot.key
                                });
                            }
                        }
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        const displayUpToDate = new Date(item.display_up_to);
                        if (item.status === 'Опубликовано' && item.elementType === 'Объявления' && displayUpToDate >= today) {
                            importantAds.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                // Сортировка фиксированных объявлений от новых к старым
                importantAds.sort((a, b) => new Date(b.postData) - new Date(a.postData));

                setImportantAds(importantAds);
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

    if (loading) return <div className="main-page-block-ads custom-scrollbar main-page-block-ads-loader"><Loader /></div>;
    if (error) return <p>{error}</p>;

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
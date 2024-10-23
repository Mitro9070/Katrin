import { useState, useEffect } from "react";
import { newsContentStore } from '../stores/NewsContentStore';
import { Link } from 'react-router-dom';

import '../styles/MainPageBlockAds.css';

import imgFixedIcon from '../images/fixed.svg';
import Loader from "./Loader";

function MainPageBlockAds() {
    const [ads, setAds] = useState([]);
    const [importantAds, setImportantAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                await newsContentStore.fetchData(); // Ждём завершения загрузки данных
                let allAds = newsContentStore.News.filter(news => news.elementType === 'Объявления' && news.status === 'Опубликовано');
                
                const currentDate = new Date();

                // Разделяем объявления на важные и обычные
                setImportantAds(allAds.filter((ad) => ad.fixed));

                setAds(allAds.filter((ad) => !ad.fixed));
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
                    <Link to={`/news/${ad.id}`} key={ad.id}>
                        <div className="important-ad-string">
                            <img src={imgFixedIcon} alt="" />
                            <div className="main-page-block-ad">
                                <p>{ad.title}</p>  
                            </div>
                        </div>
                    </Link>
                ))
            )}
            {ads.length > 0 && ( 
                ads.map((ad) => (
                    <Link to={`/news/${ad.id}`} key={ad.id}>
                        <div className="main-page-block-ad">
                            <p>{ad.title}</p>  
                        </div>
                    </Link>
                ))
            )} 
        </div>
    );
}

export default MainPageBlockAds;
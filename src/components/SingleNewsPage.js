import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

import MainContentSinglePage from './MainContentSingleNewsPage';
import NotFoundPage from './NotFoundPage';
import Loader from "./Loader";

import { fetchNewsById } from '../Controller/NewsController';
import { fetchUserById } from '../Controller/UsersController';

const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

const SingleNewsPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('All');
    const [news, setNews] = useState({});
    const [authorName, setAuthorName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получаем реферер из URL или устанавливаем по умолчанию главную страницу
    const referrer = new URLSearchParams(location.search).get('referrer') || '/';

    useEffect(() => {
        async function fetchNews() {
            try {
                const fetchedNews = await fetchNewsById(id);
                if (fetchedNews) {
                    const transformedNews = {
                        ...fetchedNews,
                        postData: fetchedNews.postdata || '',
                        elementType: fetchedNews.elementtype || '',
                        images: fetchedNews.images || [],
                    };
                    setNews(transformedNews);

                    // Получаем данные автора новости
                    const userId = fetchedNews.owner;
                    if (userId) {
                        const userData = await fetchUserById(userId);
                        if (userData) {
                            const fullName = `${userData.name || ''} ${userData.surname || ''}`.trim();
                            setAuthorName(fullName || 'Неизвестный автор');
                        } else {
                            // Пользователь не найден
                            setAuthorName('Неизвестный автор');
                        }
                    } else {
                        setAuthorName('Неизвестный автор');
                    }
                } else {
                    setError('Новость не найдена');
                }
            } catch (err) {
                console.error('Ошибка при загрузке новости:', err);
                setError('Ошибка при загрузке новости');
            } finally {
                setLoading(false);
            }
        }

        fetchNews();
    }, [id]);

    const getImageUrl = (imageUrl) => {
        return `${serverUrl}/api/webdav/image?url=${encodeURIComponent(imageUrl)}`;
    };

    const handleBack = () => {
        navigate(referrer); // Возвращаемся на предыдущую страницу или на главную
    };

    if (loading) return (
        <div className="page-content single-news-page block-slide-loader">
            <Loader />
        </div>
    );
    if (error) return <NotFoundPage />; // Страница ошибки, если новость не найдена

    return (
        <div className="page-content single-news-page">
            <Link to={referrer} className="back-button" onClick={handleBack}>Назад</Link>
            {/* Компонент для отображения основного содержимого новости */}
            <MainContentSinglePage
                linkTo={referrer}
                onClick={() => setCurrentTab(currentTab)}
                data={news}
                getImageUrl={getImageUrl} // Передаём функцию получения URL изображения
            />
            {/* Отображаем информацию об авторе новости */}
            {authorName && (
                <p className="bid-list-card-author">Автор: {authorName}</p>
            )}
        </div>
    );
};

export default SingleNewsPage;
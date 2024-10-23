import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';

import '../styles/MainPage.css';
import MainPageBlockList from './MainPageBlockList';
import MainPageBlockSlide from './MainPageBlockSlide';

import iconHintImg from '../images/hint-ring.svg';
import iconMainInImg from '../images/mail-in.svg';
import iconBatchImg from '../images/batch.svg';
import iconPencilImg from '../images/pencil.svg';
import EditMainMenuPush from './EditMainMenuPush';

import Footer from './Footer';
import MainPageBlockAds from './MainPageBlockAds';
import Loader from './Loader';
import QuestionPush from './QuestionPush';
import InitiativePush from './InitiativePush';

const MainPage = observer(() => {
    const [fixedNews, setFixedNews] = useState([]);
    const [publishedNews, setPublishedNews] = useState([]);
    const [publishedEvents, setPublishedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const newsRef = ref(database, 'News');
                const eventsRef = ref(database, 'Events');

                const [newsSnapshot, eventsSnapshot] = await Promise.all([
                    get(newsRef),
                    get(eventsRef)
                ]);

                const newsData = [];
                const eventsData = [];

                if (newsSnapshot.exists()) {
                    newsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        if (item.status === 'Опубликовано') {
                            newsData.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                if (eventsSnapshot.exists()) {
                    eventsSnapshot.forEach((childSnapshot) => {
                        const item = childSnapshot.val();
                        if (item.status === 'Опубликовано') {
                            eventsData.push({
                                ...item,
                                id: childSnapshot.key
                            });
                        }
                    });
                }

                const fixedNews = newsData.filter(news => news.fixed);
                const publishedNews = newsData;
                const publishedEvents = eventsData;

                setFixedNews(fixedNews);
                setPublishedNews(publishedNews);
                setPublishedEvents(publishedEvents);
            } catch (err) {
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [ShowEditMainMenuPush, setShowEditMainMenuPush] = useState(false);
    const [ShowQuestionPush, setShowQuestionPush] = useState(false);
    const [ShowInitiativePush, setShowInitiativePush] = useState(false);

    const setShowEditMainMenuPushHandler = () => {
        setShowEditMainMenuPush(() => !ShowEditMainMenuPush);
    };

    const setShowQuestionPushHandler = () => {
        setShowQuestionPush(() => !ShowQuestionPush);
    };

    const setShowInitiativePushHandler = () => {
        setShowInitiativePush(() => !ShowInitiativePush);
    };

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="main-page page-content noselect">
            <div className="main-page-head">
                <p className="welcome-text">{`Добрый день, Имя!`}</p>
                <img src={iconPencilImg} alt="" className="edit-main-page-img" onClick={setShowEditMainMenuPushHandler} />
            </div>
            <div className="main-page-content">
                {fixedNews.length > 0 && <MainPageBlockAds />}
                {publishedNews.length > 0 && (
                    <MainPageBlockSlide name={'Новости'} data={publishedNews} className="news" />
                )}
                {publishedEvents.length > 0 && (
                    <MainPageBlockSlide name={'События'} data={publishedEvents} />
                )}
                <MainPageBlockList name={'Дни рождения'} list={[]} />
                <MainPageBlockList name={'Новые сотрудники'} list={[]} />
                <div className="main-page-btn main-page-btn-red" onClick={setShowQuestionPushHandler}>
                    <img src={iconHintImg} alt="" />
                    <p>Задать вопрос</p>
                </div>
                <div className="main-page-btn" onClick={setShowInitiativePushHandler}>
                    <img src={iconMainInImg} alt="" />
                    <p>Предложить инициативу</p>
                </div>
                <a href="#">
                    <div className="main-page-btn">
                        <img src={iconBatchImg} alt="" />
                        <p>Пройти опрос</p>
                    </div>
                </a>
            </div>
            {ShowEditMainMenuPush && (
                <EditMainMenuPush setShowEditMainMenuPush={setShowEditMainMenuPushHandler} />
            )}
            {ShowQuestionPush && (
                <QuestionPush setShowQuestionPush={setShowQuestionPushHandler} />
            )}
            {ShowInitiativePush && (
                <InitiativePush setShowInitiativePush={setShowInitiativePushHandler} />
            )}
            <Footer />
        </div>
    );
});

export default MainPage;
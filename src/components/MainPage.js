import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import Loader from './Loader'; // Импорт компонента Loader
import MainPageBlockList from './MainPageBlockList'; // Импортируем необходимые компоненты
import MainPageBlockSlide from './MainPageBlockSlide';
import MainPageBlockAds from './MainPageBlockAds';
import EditMainMenuPush from './EditMainMenuPush';
import QuestionPush from './QuestionPush';
import InitiativePush from './InitiativePush';
import Footer from './Footer';

import iconHintImg from '../images/hint-ring.svg'; // Импортируем иконки
import iconMainInImg from '../images/mail-in.svg';
import iconBatchImg from '../images/batch.svg';
import iconPencilImg from '../images/pencil.svg';

import '../styles/MainPage.css'; // Импортируем стили

const MainPage = () => {
    const [publishedNews, setPublishedNews] = useState([]);
    const [publishedEvents, setPublishedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('Гость');
    const [permissions, setPermissions] = useState({ homepage: true, newspage: true, devicepage: true, calendarevents: true });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = Cookies.get('userId');
                const roleId = Cookies.get('roleId');

                // Если пользователь не авторизован, используем значения по умолчанию
                if (!userId || !roleId) {
                    setUserName('Гость');
                    // Разрешения по умолчанию
                    setPermissions({ homepage: true, newspage: true, devicepage: true, calendarevents: true });
                } else {
                    const roleRef = ref(database, `Roles/${roleId}`);
                    const roleSnapshot = await get(roleRef);
                    if (roleSnapshot.exists()) {
                        const roleData = roleSnapshot.val();
                        setPermissions(roleData.permissions);
                        console.log('Role data:', roleData);
                    } else {
                        throw new Error('Роль не найдена');
                    }

                    const userRef = ref(database, `Users/${userId}`);
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        setUserName(userData.Name);
                    } else {
                        throw new Error('Пользователь не найден');
                    }
                }

                // Проверяем разрешения для доступа к странице
                if (!permissions.homepage) {
                    throw new Error('У вас нет доступа к этой странице');
                }

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

                // Сортировка новостей по дате публикации в порядке убывания
                newsData.sort((a, b) => new Date(b.postData) - new Date(a.postData));

                setPublishedNews(newsData);
                setPublishedEvents(eventsData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Убираем зависимости, чтобы избежать бесконечного цикла

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
                <p className="welcome-text">{`Добрый день, ${userName}!`}</p>
                <img src={iconPencilImg} alt="" className="edit-main-page-img" onClick={setShowEditMainMenuPushHandler} />
            </div>
            <div className="main-page-content">
                <MainPageBlockAds />
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
};

export default MainPage;
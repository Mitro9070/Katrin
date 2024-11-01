import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';

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
import { getPermissions } from '../utils/Permissions';

const MainPage = observer(() => {
    const [publishedNews, setPublishedNews] = useState([]);
    const [publishedEvents, setPublishedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permissions, setPermissions] = useState({ homepage: true, newspage: true, devicepage: true, calendarevents: true });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [userName, setUserName] = useState('Гость');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = Cookies.get('userId');
                const roleId = Cookies.get('roleId') || '2'; // Default role ID for "Гость"
                const permissions = getPermissions(roleId);

                setPermissions(permissions);

                switch (roleId) {
                    case '1': // Администратор
                    case '3': // Авторизованный пользователь
                    case '4': // Контент менеджер
                    case '5': // менеджер событий
                    case '6': // техник
                        if (!permissions.homepage) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '2': // Гость
                        if (!permissions.homepage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                if (userId) {
                    const userRef = ref(database, `Users/${userId}`);
                    const userSnapshot = await get(userRef);
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        setUserName(userData.Name);
                    }
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

                newsData.sort((a, b) => new Date(b.postData) - new Date(a.postData));

                setPublishedNews(newsData);
                setPublishedEvents(eventsData);
            } catch (err) {
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        Cookies.set('currentPage', 'main');
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
});

export default MainPage;
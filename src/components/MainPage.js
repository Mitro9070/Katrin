import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';

import '../styles/MainPage.css';
import MainPageBlockList from './MainPageBlockList';
import NewsBlockSlide from './NewsBlockSlide';
import EventsBlockSlide from './EventsBlockSlide';

import iconHintImg from '../images/hint-ring.svg';
import iconMainInImg from '../images/mail-in.svg';
import iconBatchImg from '../images/batch.svg';
import iconPencilImg from '../images/pencil.svg';
import noNewsImage from '../images/NoNews.png';
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
    const [birthdays, setBirthdays] = useState([]);
    const [newEmployees, setNewEmployees] = useState([]);
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
                const usersRef = ref(database, 'Users');

                const [newsSnapshot, eventsSnapshot, usersSnapshot] = await Promise.all([
                    get(newsRef),
                    get(eventsRef),
                    get(usersRef)
                ]);

                const newsData = [];
                const eventsData = [];
                const birthdaysData = [];
                const newEmployeesData = [];

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

                if (usersSnapshot.exists()) {
                    const today = new Date();
                    const nextMonth = new Date(today);
                    nextMonth.setDate(today.getDate() + 30);

                    today.setHours(0, 0, 0, 0); 
                    nextMonth.setHours(23, 59, 59, 999); 

                    const lastMonth = new Date(today);
                    lastMonth.setDate(today.getDate() - 30);

                    usersSnapshot.forEach((childSnapshot) => {
                        const user = childSnapshot.val();
                        const birthday = new Date(user.birthday.includes('-') ? user.birthday : user.birthday.split('.').reverse().join('-'));
                        birthday.setFullYear(today.getFullYear());

                        const createdAt = new Date(user.createdAt);

                        if (birthday >= today && birthday <= nextMonth) {
                            birthdaysData.push({
                                id: childSnapshot.key,
                                name: user.Name,
                                surname: user.surname,
                                lastname: user.lastname,
                                position: user.position,
                                birthday: birthday.toISOString().split('T')[0]
                            });
                        }

                        if (createdAt >= lastMonth && createdAt <= today) {
                            newEmployeesData.push({
                                id: childSnapshot.key,
                                name: user.Name,
                                surname: user.surname,
                                lastname: user.lastname,
                                position: user.position,
                                createdAt: createdAt.toISOString()
                            });
                        }
                    });
                }

                console.log("Birthdays data:", birthdaysData);
                console.log("New Employees data:", newEmployeesData);

                setPermissions(permissions);
                newEmployeesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                newsData.sort((a, b) => new Date(b.postData) - new Date(a.postData));

                setPublishedNews(newsData);
                setPublishedEvents(eventsData);
                setBirthdays(birthdaysData);
                setNewEmployees(newEmployeesData);
            } catch (err) {
                console.error('Не удалось загрузить данные:', err);
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
                <NewsBlockSlide 
                    name={'Новости'} 
                    data={publishedNews.length > 0 ? publishedNews : [
                        {
                            id: 'no-news',
                            title: 'Отсутствие новостей - уже хорошие новости!',
                            images: [noNewsImage],
                            postData: new Date().toISOString()
                        }
                    ]} 
                    className="news" 
                />
                <EventsBlockSlide 
                    name={'События'} 
                    data={publishedEvents.length > 0 ? publishedEvents : [
                        {
                            id: 'no-events',
                            title: 'Иногда отсутствие чего-то говорит о многом',
                            start_date: new Date().toISOString()
                        }
                    ]} 
                />
                <MainPageBlockList name={'Дни рождения'} list={birthdays} isBirthday />
                <MainPageBlockList name={'Новые сотрудники'} list={newEmployees} />
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
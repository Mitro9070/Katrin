import { useState, useEffect, useMemo } from 'react';
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
import Footer from './Footer';
import MainPageBlockAds from './MainPageBlockAds';
import Loader from './Loader';
import QuestionPush from './QuestionPush';
import InitiativePush from './InitiativePush';
import EditMainMenuPush from './EditMainMenuPush';
import { getPermissions } from '../utils/Permissions';
import useApi from '../hooks/useApi';
import { fetchUserById } from '../Controller/UsersController';
import { getNextMonthDate, isWithinDateRange } from '../utils/formatDate';


const MainPage = () => {
    const [permissions, setPermissions] = useState({ homepage: true, newspage: true, devicepage: true, calendarevents: true });
    const [modalMessage, setModalMessage] = useState('');
    const [userName, setUserName] = useState('Гость');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const userId = Cookies.get('userId');
    const roleId = Cookies.get('roleId') || '2';

    // Управление модальными окнами
    const [modals, setModals] = useState({
        editMenu: false,
        question: false,
        initiative: false,
    });

    const toggleModal = (modalName) => {
        setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
    };

    // Проверка прав доступа
    useEffect(() => {
        const permissions = getPermissions(roleId);
        setPermissions(permissions);
       
        if (roleId !== '2') {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }

        if (!permissions.homepage) {
            if (roleId === '2') {
                setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
            } else {
                setModalMessage('Недостаточно прав для данной страницы. Обратитесь к администратору.');
            }
        }

        Cookies.set('currentPage', 'main');
    }, [roleId]);

    // Мемоизация endpoints и options
    const newsEndpoint = useMemo(() => '/api/news?page=1', []);
    const eventsEndpoint = useMemo(() => '/api/events?page=1', []);
    const usersEndpoint = useMemo(() => '/api/users?page=1', []);
    const apiOptions = useMemo(() => ({}), []);

    // Получение новостей
    const { data: newsData, error: newsError, loading: newsLoading } = useApi(newsEndpoint, apiOptions);

    const publishedNewsData = useMemo(() => {
        if (newsData) {
            const filteredNews = newsData.news.filter((item) => item.status === 'Опубликовано');
            return filteredNews.sort((a, b) => new Date(b.postdata) - new Date(a.postdata));
        }
        return [];
    }, [newsData]);

    // Получение событий
    const { data: eventsData, error: eventsError, loading: eventsLoading } = useApi(eventsEndpoint, apiOptions);

    const publishedEventsData = useMemo(() => {
        if (eventsData) {
            const filteredEvents = eventsData.events.filter((item) => item.status === 'Опубликовано');
            return filteredEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        }
        return [];
    }, [eventsData]);

    // Получение пользователей
    const { data: usersData, error: usersError, loading: usersLoading } = useApi(usersEndpoint, apiOptions);

    // Обработка пользователей для дней рождения и новых сотрудников
    const { birthdays, newEmployees } = useMemo(() => {
        const birthdaysData = [];
        const newEmployeesData = [];
        if (usersData) {
            const usersArray = usersData.users;
            const today = new Date();
            const nextMonth = getNextMonthDate();
            today.setHours(0, 0, 0, 0);
            nextMonth.setHours(23, 59, 59, 999);
            const lastMonth = new Date(today);
            lastMonth.setDate(today.getDate() - 30);

            usersArray.forEach((user) => {
                // Обработка дней рождения
                const birthdayDate = new Date(user.birthday);
                const birthdayThisYear = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());

                if (isWithinDateRange(birthdayThisYear, today, nextMonth)) {
                    birthdaysData.push({
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        lastname: user.lastname,
                        position: user.position,
                        birthday: birthdayThisYear.toISOString().split('T')[0],
                    });
                }

                // Обработка новых сотрудников
                const createdAt = new Date(user.createdat);
                if (isWithinDateRange(createdAt, lastMonth, today)) {
                    newEmployeesData.push({
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        lastname: user.lastname,
                        position: user.position,
                        createdAt: createdAt.toISOString(),
                    });
                }
            });
        }
        return { birthdays: birthdaysData, newEmployees: newEmployeesData };
    }, [usersData]);

    // Получение имени пользователя
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                if (userId) {
                    const userData = await fetchUserById(userId);
                    setUserName(userData.name);
                } else {
                    setUserName('Гость');
                }
            } catch (error) {
                console.error('Не удалось загрузить данные пользователя:', error);
            }
        };

        fetchUserName();
    }, [userId]);

    // Проверка загрузки и ошибок
    if (newsLoading || eventsLoading || usersLoading) return <Loader />;
    if (newsError || eventsError || usersError) return <p>Не удалось загрузить данные</p>;
    if (modalMessage) return <p>{modalMessage}</p>;

    return (
        <div className="main-page page-content noselect">
            <div className="main-page-head">
                <p className="welcome-text">{`Добрый день, ${userName}!`}</p>
                {isLoggedIn && (
                    <img
                        src={iconPencilImg}
                        alt=""
                        className="edit-main-page-img"
                        onClick={() => toggleModal('editMenu')}
                    />
                )}
            </div>
            <div className="main-page-content">
                {/* Блок закрепленных объявлений */}
                <MainPageBlockAds />

                {/* Блок новостей */}
                <NewsBlockSlide
                    name={'Новости'}
                    data={
                        publishedNewsData.length > 0
                            ? publishedNewsData
                            : [
                                  {
                                      id: 'no-news',
                                      title: 'Отсутствие новостей - уже хорошие новости!',
                                      images: [noNewsImage],
                                      postdata: new Date().toISOString(),
                                  },
                              ]
                    }
                    className="news"
                />

                {/* Блок событий */}
                <EventsBlockSlide
                    name={'События'}
                    data={
                        publishedEventsData.length > 0
                            ? publishedEventsData
                            : [
                                  {
                                      id: 'no-events',
                                      title: 'Иногда отсутствие чего-то говорит о многом',
                                      start_date: new Date().toISOString(),
                                  },
                              ]
                    }
                />

                {/* Список дней рождения */}
                <MainPageBlockList name={'Дни рождения'} list={birthdays} isBirthday />
                {/* Список новых сотрудников */}
                <MainPageBlockList name={'Новые сотрудники'} list={newEmployees} />

                {/* Кнопка для задать вопрос */}
                <div
                    className={`main-page-btn main-page-btn-red ${!isLoggedIn ? 'disabled' : ''}`}
                    onClick={isLoggedIn ? () => toggleModal('question') : null}
                >
                    <img src={iconHintImg} alt="" />
                    <p>Задать вопрос</p>
                </div>

                {/* Кнопка для предложить инициативу */}
                <div
                    className={`main-page-btn ${!isLoggedIn ? 'disabled' : ''}`}
                    onClick={isLoggedIn ? () => toggleModal('initiative') : null}
                >
                    <img src={iconMainInImg} alt="" />
                    <p>Предложить инициативу</p>
                </div>

                {/* Кнопка для пройти опрос */}
                <div className="main-page-btn disabled">
                    <img src={iconBatchImg} alt="" />
                    <p>Пройти опрос</p>
                </div>
            </div>

            {/* Показать модальные окна, если флаги установлены */}
            {modals.editMenu && (
                <EditMainMenuPush setShowEditMainMenuPush={() => toggleModal('editMenu')} />
            )}
            {modals.question && (
                <QuestionPush setShowQuestionPush={() => toggleModal('question')} />
            )}
            {modals.initiative && (
                <InitiativePush setShowInitiativePush={() => toggleModal('initiative')} />
            )}
            <Footer />
        </div>
    );
};

export default MainPage;
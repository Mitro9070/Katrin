import '../styles/NewsPage.css'; // Импорт стилей для страницы новостей
import { useState, useEffect } from 'react'; // Импорт хуков useState и useEffect из React
import { Link, useNavigate } from 'react-router-dom'; // Импорт компонента Link из react-router-dom для навигации
import StandartCard from './StandartCard'; // Импорт компонента StandartCard для отображения карточек новостей
import { ref, get } from 'firebase/database'; // Импорт функций ref и get из firebase/database для работы с базой данных Firebase
import { database } from '../firebaseConfig'; // Импорт конфигурации Firebase
import Cookies from 'js-cookie'; // Импорт библиотеки js-cookie для работы с куки
import Loader from './Loader'; // Импорт компонента Loader для отображения индикатора загрузки
import { getPermissions } from '../utils/Permissions'; // Импорт функции getPermissions для получения разрешений

const NewsPage = () => {
    const [currentTab, setCurrentTab] = useState('All'); // Состояние для текущей вкладки
    const [news, setNews] = useState([]); // Состояние для новостей
    const [currentPage, setCurrentPage] = useState(1); // Состояние для текущей страницы
    const itemsPerPage = 6; // Количество элементов на странице
    const [permissions, setPermissions] = useState({ newspage: false }); // Состояние для разрешений пользователя
    const [userName, setUserName] = useState('Гость'); // Состояние для имени пользователя
    const [showModal, setShowModal] = useState(false); // Состояние для отображения модального окна
    const [modalMessage, setModalMessage] = useState(''); // Состояние для сообщения в модальном окне
    const [loading, setLoading] = useState(true); // Состояние для индикатора загрузки
    const [error, setError] = useState(null); // Состояние для обработки ошибок
    const navigate = useNavigate();

    const roleId = Cookies.get('roleId'); // Получение идентификатора роли из куки

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = Cookies.get('userId');
                const roleId = Cookies.get('roleId') || '2'; // Default role ID for "Гость"
                const permissions = getPermissions(roleId);

                setPermissions(permissions);

                switch (roleId) {
                    case '1': // Администратор
                        if (!permissions.processingEvents && !permissions.processingNews && !permissions.publishingNews && !permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '3': // Авторизованный пользователь
                        if (!permissions.submissionNews && !permissions.submissionEvents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '2': // Гость
                        if (!permissions.newspage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    case '4': // Контент-менеджер
                        if (!permissions.newspage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    case '5': // Менеджер событий
                        if (!permissions.newspage) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true); // Отображение модального окна с сообщением
                            return;
                        }
                        break;
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                await fetchNews(); // Загрузка новостей
                //await fetchEvents(); // Загрузка событий
                //await fetchDevices(); // Загрузка устройств при монтировании компонента
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные'); // Установка сообщения об ошибке
            } finally {
                setLoading(false); // Отключение индикатора загрузки
            }
        };

        fetchData(); // Вызов функции загрузки данных
        Cookies.set('currentPage', 'news');
    }, [navigate]);

    const fetchNews = async () => {
        try {
            const newsRef = ref(database, 'News'); // Ссылка на данные новостей в базе данных Firebase
            const snapshot = await get(newsRef); // Получение данных новостей из базы данных
            if (snapshot.exists()) {
                const newsData = [];
                snapshot.forEach(childSnapshot => {
                    const item = childSnapshot.val(); // Получение данных новости
                    if (item.status === 'Опубликовано') {
                        newsData.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    }
                });
                setNews(newsData); // Установка состояния новостей
            }
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error); // Обработка ошибки загрузки новостей
        }
    };

    const newsTypeList = { 'Ads': 'Объявления', 'Devices': 'Устройства и ПО', 'Activity': 'Мероприятия', 'TechNews': 'Тех. новости' }; // Список типов новостей

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab; // Получение выбранной вкладки
        setCurrentTab(selectedTab); // Установка текущей вкладки
        setCurrentPage(1); // Сброс текущей страницы при смене вкладки
    };

    const renderNews = (type) => {
        const sortedNews = [...news].sort((a, b) => {
            if (!a.postData) return 1;
            if (!b.postData) return -1;
            return new Date(b.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + b.postData.split(', ')[1]) - 
                   new Date(a.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + a.postData.split(', ')[1]);
        });

        if (type) {
            const filteredNews = sortedNews.filter(news => news.elementType === type && news.status === 'Опубликовано');
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

            return currentItems.map(e => (
                <Link to={`/news/${e.id}`} key={e.id}>
                    <StandartCard title={e.title} text={e.text} publicDate={e.postData} images={e.images} />
                </Link>
            ));
        } else {
            const filteredNews = sortedNews.filter(news => news.status === 'Опубликовано' && news.elementType !== 'Тех. новости');
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

            return currentItems.map(e => (
                <Link to={`/news/${e.id}`} key={e.id}>
                    <StandartCard title={e.title} text={e.text} publicDate={e.postData} images={e.images} />
                </Link>
            ));
        }
    };

    const renderAll = () => {
        const sortedNews = [...news].sort((a, b) => {
            if (!a.postData) return 1;
            if (!b.postData) return -1;
            return new Date(b.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + b.postData.split(', ')[1]) - 
                   new Date(a.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + a.postData.split(', ')[1]);
        }).filter(news => news.status === 'Опубликовано' && news.elementType !== 'Тех. новости');

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = sortedNews.slice(indexOfFirstItem, indexOfLastItem);

        return currentItems.map(e => (
            <Link to={`/news/${e.id}`} key={e.id}>
                <StandartCard title={e.title} text={e.text} publicDate={e.postData} images={e.images} />
            </Link>
        ));
    };

    const getFilteredItems = () => {
        if (currentTab === 'All') {
            return news.filter(news => news.elementType !== 'Тех. новости');
        } else if (currentTab === 'TechNews') {
            return news.filter(news => news.elementType === 'Тех. новости');
        } else {
            return news.filter(news => news.elementType === newsTypeList[currentTab]);
        }
    };

    const filteredItems = getFilteredItems();

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredItems.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => (
        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <a onClick={() => setCurrentPage(number)} className="page-link">
                {number}
            </a>
        </li>
    ));

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="page-content news-page">
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <p>{modalMessage}</p>
                        <button onClick={() => setShowModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}
            <div className="bid-page-head noselect">
                <p className={`bid-page-head-tab ${currentTab === 'All' ? 'bid-page-head-tab-selected' : ''}`} data-tab="All" onClick={onTabClickHandler}>Все</p>
                {(roleId === '1' || roleId === '6') && (
                    <p className={`bid-page-head-tab ${currentTab === 'TechNews' ? 'bid-page-head-tab-selected' : ''}`} data-tab="TechNews" onClick={onTabClickHandler}>Тех. новости</p>
                )}
                <p className={`bid-page-head-tab ${currentTab === 'Ads' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Ads" onClick={onTabClickHandler}>Объявления</p>
                <p className={`bid-page-head-tab ${currentTab === 'Devices' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Devices" onClick={onTabClickHandler}>Устройства и ПО</p>
                <p className={`bid-page-head-tab ${currentTab === 'Activity' ? 'bid-page-head-tab-selected' : ''}`} data-tab="Activity" onClick={onTabClickHandler}>Мероприятия</p>
            </div>
            <div className="news-page-content">
                {currentTab === 'TechNews' && renderNews('Тех. новости')}
                {currentTab !== 'All' && currentTab !== 'TechNews' && renderNews(newsTypeList[currentTab])}
                {currentTab === 'All' && renderAll()}
            </div>
            {filteredItems.length > itemsPerPage || currentPage > 1 ? (
                <ul className="pagination">
                    {renderPageNumbers}
                </ul>
            ) : null}
        </div>
    );
};

export default NewsPage;
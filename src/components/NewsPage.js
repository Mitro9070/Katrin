import '../styles/NewsPage.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import StandartCard from './NewsCard';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import Cookies from 'js-cookie';
import Loader from './Loader';
import { getPermissions } from '../utils/Permissions';
import PageHeadTab from './PageHeadTab';

const NewsPage = () => {
    const [currentTab, setCurrentTab] = useState('All'); // Состояние для текущей вкладки
    const [news, setNews] = useState([]); // Состояние для хранения новостей
    const [currentPage, setCurrentPage] = useState(1); // Состояние для текущей страницы
    const itemsPerPage = 6; // Количество новостей на странице
    const [permissions, setPermissions] = useState({ newspage: false }); // Состояние для разрешений пользователя
    const [showModal, setShowModal] = useState(false); // Состояние для отображения модального окна
    const [modalMessage, setModalMessage] = useState(''); // Сообщение для модального окна
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние для обработки ошибок

    const roleId = Cookies.get('roleId') || '2'; // Роль пользователя (по умолчанию "Гость")
    const [cardsLoaded, setCardsLoaded] = useState(0); // Счетчик загруженных карточек
    const totalCards = useRef(0); // Общее количество карточек для загрузки

    // Определение типа новостей
    const newsTypeList = {
        'Ads': 'Объявления',
        'Devices': 'Устройства и ПО',
        'Activity': 'Мероприятия',
        'TechNews': 'Тех. новости'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const permissions = getPermissions(roleId); // Получаем разрешения
                setPermissions(permissions);

                if (!permissions.newspage) {
                    setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                    setShowModal(true);
                    setLoading(false);
                    return; // Прерываем выполнение, если нет прав
                }

                await fetchNews(); // Загружаем новости
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные'); // Устанавливаем сообщение об ошибке
                setLoading(false);
            }
        };

        fetchData(); // Вызываем функцию загрузки данных
        Cookies.set('currentPage', 'news'); // Устанавливаем текущую страницу в куки
    }, [roleId]);

    const fetchNews = async () => {
        try {
            const newsRef = ref(database, 'News'); // Ссылка на базу данных новостей
            const snapshot = await get(newsRef); // Получение данных
            if (snapshot.exists()) {
                const newsData = [];
                snapshot.forEach(childSnapshot => {
                    const item = childSnapshot.val(); // Получаем данные для каждой новости
                    if (item.status === 'Опубликовано') {
                        newsData.push({ ...item, id: childSnapshot.key }); // Загружаем только опубликованные новости
                    }
                });
                setNews(newsData); // Устанавливаем загруженные новости
                totalCards.current = newsData.length; // Устанавливаем общее количество карточек
            }
            setLoading(false); // Снимаем состояние загрузки после получения данных
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error);
            setError('Не удалось загрузить новости'); // Устанавливаем сообщение об ошибке
            setLoading(false);
        }
    };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab; // Получаем выбранную вкладку
        if (!loading) { // Не позволяем менять вкладки во время загрузки
            setCurrentTab(selectedTab); // Устанавливаем текущую вкладку
            setCurrentPage(1); // Сбрасываем текущую страницу
            setCardsLoaded(0); // Сброс загруженных карточек
        }
    };

    const handleCardLoad = () => {
        setCardsLoaded(prev => {
            const newVal = prev + 1;
            if (newVal === totalCards.current) {
                setLoading(false); // Снимаем состояние загрузки, если загружены все карточки
            }
            return newVal;
        });
    };

    const getFilteredItems = () => {
        if (currentTab === 'All') {
            return news.filter(newsItem => newsItem.status === 'Опубликовано' && newsItem.elementType !== 'Тех. новости');
        } else if (currentTab === 'TechNews') {
            return news.filter(newsItem => newsItem.status === 'Опубликовано' && newsItem.elementType === 'Тех. новости');
        } else {
            return news.filter(newsItem => newsItem.status === 'Опубликовано' && newsItem.elementType === newsTypeList[currentTab]);
        }
    };

    const renderNews = (type) => {
        const sortedNews = [...news].sort((a, b) => {
            if (!a.postData) return 1;
            if (!b.postData) return -1;
            return new Date(
                b.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + b.postData.split(', ')[1]
            ) - new Date(
                a.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + a.postData.split(', ')[1]
            );
        });

        const filteredNews = sortedNews.filter(newsItem => newsItem.elementType === type && newsItem.status === 'Опубликовано');
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

        return currentItems.map(e => (
            <Link to={`/news/${e.id}`} key={e.id} onClick={(e) => { if (loading) e.preventDefault(); }}>
                <StandartCard
                    title={e.title}
                    text={e.text}
                    publicDate={e.postData}
                    images={e.images}
                    onCardLoad={handleCardLoad}
                />
            </Link>
        ));
    };

    const renderAll = () => {
        const sortedNews = [...news].sort((a, b) => {
            if (!a.postData) return 1;
            if (!b.postData) return -1;
            return new Date(
                b.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + b.postData.split(', ')[1]
            ) - new Date(
                a.postData.split(', ')[0].split('.').reverse().join('-') + 'T' + a.postData.split(', ')[1]
            );
        }).filter(newsItem => newsItem.status === 'Опубликовано' && newsItem.elementType !== 'Тех. новости');

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = sortedNews.slice(indexOfFirstItem, indexOfLastItem);

        return currentItems.map(e => (
            <Link to={`/news/${e.id}`} key={e.id} onClick={(e) => { if (loading) e.preventDefault(); }}>
                <StandartCard
                    title={e.title}
                    text={e.text}
                    publicDate={e.postData}
                    images={e.images}
                    onCardLoad={handleCardLoad}
                />
            </Link>
        ));
    };

    const filteredItems = getFilteredItems();

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredItems.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = pageNumbers.map(number => (
        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <span onClick={() => setCurrentPage(number)} className="page-link" style={{ cursor: 'pointer' }}>
                {number}
            </span>
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
            
                <PageHeadTab
                    currentTab={currentTab}
                    onTabClickHandler={onTabClickHandler}
                    roleId={roleId}
                />
            
            <div className="news-page-content">
                {currentTab === 'TechNews' && renderNews('Тех. новости')}
                {currentTab !== 'All' && currentTab !== 'TechNews' && renderNews(newsTypeList[currentTab])}
                {currentTab === 'All' && renderAll()}
            </div>
            {(filteredItems.length > itemsPerPage || currentPage > 1) && (
                <ul className="pagination">
                    {renderPageNumbers}
                </ul>
            )}
        </div>
    );
};

export default NewsPage;
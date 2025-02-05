import '../styles/NewsPage.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StandartCard from './NewsCard'; // Убедитесь, что импорт верный
import Cookies from 'js-cookie';
import Loader from './Loader';
import { getPermissions } from '../utils/Permissions';
import PageHeadTab from './PageHeadTab';
import { fetchNews } from '../Controller/NewsController';
import { fetchUserById } from '../Controller/UsersController';
import { getImageUrl } from '../utils/getImageUrl';

const NewsPage = () => {
    const [currentTab, setCurrentTab] = useState('All'); // Текущая вкладка
    const [news, setNews] = useState([]); // Все новости
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const itemsPerPage = 6; // Количество новостей на странице
    const [permissions, setPermissions] = useState({ newspage: false }); // Разрешения пользователя
    const [showModal, setShowModal] = useState(false); // Показ модального окна
    const [modalMessage, setModalMessage] = useState(''); // Сообщение модального окна
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Состояние ошибки
    const [totalPages, setTotalPages] = useState(1); // Общее количество страниц
    const [totalNews, setTotalNews] = useState(0);   // Общее количество новостей

    const roleId = Cookies.get('roleId') || '2'; // Роль пользователя

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
                const permissions = getPermissions(roleId);
                setPermissions(permissions);

                if (!permissions.newspage) {
                    setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                    setShowModal(true);
                    setLoading(false);
                    return;
                }

                let elementTypeFilter = '';
                if (currentTab === 'All') {
                    elementTypeFilter = ''; // Не передаём элемент для вкладки "Все"
                } else if (currentTab === 'TechNews') {
                    elementTypeFilter = 'Тех. новости';
                } else {
                    elementTypeFilter = newsTypeList[currentTab];
                }

                // Запрашиваем новости с сервера для текущей страницы и типа
                const newsData = await fetchNews(currentPage, elementTypeFilter);

                console.log('newsData:', newsData);

                if (newsData && Array.isArray(newsData.news)) {
                    // Получаем данные авторов
                    const usersCache = {};
                    const newsWithAuthors = await Promise.all(newsData.news.map(async (newsItem) => {
                        let authorName = 'Автор неизвестен';
                        try {
                            if (usersCache[newsItem.owner]) {
                                authorName = usersCache[newsItem.owner];
                            } else {
                                const userData = await fetchUserById(newsItem.owner);
                                if (userData) {
                                    authorName = `${userData.name || ''} ${userData.surname || ''}`.trim();
                                    if (!authorName) {
                                        authorName = 'Автор неизвестен';
                                    }
                                }
                                usersCache[newsItem.owner] = authorName;
                            }
                        } catch (error) {
                            console.error('Ошибка при загрузке данных автора:', error);
                        }
                        return {
                            ...newsItem,
                            authorName,
                        };
                    }));

                    setNews(newsWithAuthors); // Сохраняем новости
                    setTotalPages(newsData.totalPages); // Сохраняем общее количество страниц
                    setTotalNews(newsData.totalNews);   // Сохраняем общее количество новостей
                    setLoading(false);
                } else {
                    console.error('newsData.news не является массивом');
                    setError('Не удалось загрузить новости');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Ошибка при загрузке новостей:', error);
                setError('Не удалось загрузить новости');
                setLoading(false);
            }
        };

        fetchData();
    }, [roleId, currentTab, currentPage]);

    const fetchNewsData = async () => {
        try {
            // Получаем новости с бэкенда
            const newsData = await fetchNews();

            if (newsData && Array.isArray(newsData.news)) {
                const newsWithAuthors = [];
                const usersCache = {};

                // Проходимся по каждой новости
                for (const newsItem of newsData.news) {
                    if (newsItem.status === 'Опубликовано') {
                        let authorName = 'Неизвестный автор';

                        // Проверяем, есть ли автор в кэше
                        if (usersCache[newsItem.owner]) {
                            authorName = usersCache[newsItem.owner];
                        } else {
                            try {
                                // Получаем данные автора
                                const userData = await fetchUserById(newsItem.owner);
                                if (userData) {
                                    authorName = `${userData.name || ''} ${userData.surname || ''}`.trim();
                                    if (!authorName) {
                                        authorName = 'Неизвестный автор';
                                    }
                                }
                            } catch (error) {
                                console.error('Ошибка при загрузке данных автора:', error);
                            }
                            // Сохраняем имя автора в кэше
                            usersCache[newsItem.owner] = authorName;
                        }

                        // Добавляем новость вместе с именем автора в массив
                        newsWithAuthors.push({
                            ...newsItem,
                            authorName: authorName
                        });
                    }
                }

                setNews(newsWithAuthors); // Устанавливаем новости в состояние
            }

            setLoading(false); // Отключаем индикатор загрузки
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error);
            setError('Не удалось загрузить новости'); // Устанавливаем сообщение об ошибке
            setLoading(false); // Отключаем индикатор загрузки
        }
    };

    const onTabClickHandler = (e) => {
        const selectedTab = e.target.dataset.tab; // Получаем выбранную вкладку
        if (!loading) { // Не позволяем менять вкладки во время загрузки
            setCurrentTab(selectedTab); // Устанавливаем текущую вкладку
            setCurrentPage(1); // Сбрасываем текущую страницу
        }
    };

    // Функция для фильтрации новостей по текущей вкладке
    const getFilteredItems = () => {
        if (currentTab === 'All') {
            return news.filter(newsItem => newsItem.elementtype !== 'Тех. новости');
        } else if (currentTab === 'TechNews') {
            return news.filter(newsItem => newsItem.elementtype === 'Тех. новости');
        } else {
            return news.filter(newsItem => newsItem.elementtype === newsTypeList[currentTab]);
        }
    };

    const renderNews = () => {
        return news.map((e) => (
            <Link to={`/news/${e.id}`} key={e.id}>
                <StandartCard
                    title={e.title}
                    text={e.text}
                    publicDate={e.postdata}
                    images={[getImageUrl(e.image)]}
                    authorName={e.authorName}
                />
            </Link>
        ));
    };
    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <span onClick={() => setCurrentPage(number)} className="page-link" style={{ cursor: 'pointer' }}>
                    {number}
                </span>
            </li>
        ));
    };

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
                {renderNews()}
            </div>

            {totalPages > 1 && (
                <ul className="pagination">
                    {renderPageNumbers()}
                </ul>
            )}

        </div>
    );
};

export default NewsPage;
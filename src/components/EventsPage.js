import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import '../styles/EventsPage.css';
import StandartCard from "./StandartCard";
import { Link, useNavigate } from 'react-router-dom';
import imgFilterIcon from '../images/filter.svg';
import defaultEventImage from '../images/events.jpg'; // Импортируем изображение по умолчанию
import Loader from "./Loader";
import Cookies from 'js-cookie';
import { ref, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import { getPermissions } from '../utils/Permissions';
import formatDate from '../utils/formatDate'; // Убедитесь, что этот импорт существует

const EventsPage = () => {
    const [IsFilterBlock, setIsFilterBlock] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pastEvents, setPastEvents] = useState(false);
    const [elementType, setElementType] = useState('');
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = Cookies.get('userId');
                const roleId = Cookies.get('roleId') || '2'; // Default role ID for "Гость"
                const permissions = getPermissions(roleId);

                // Проверка прав доступа
                switch (roleId) {
                    case '1': // Администратор
                    case '3': // Авторизованный пользователь
                        if (!permissions.calendarevents) {
                            throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                        }
                        break;
                    case '2': // Гость
                    case '4': // Контент-менеджер
                    case '5': // Менеджер событий
                    case '6': // Техник
                        if (!permissions.calendarevents) {
                            setModalMessage('У вас недостаточно прав для просмотра этой страницы. Пожалуйста, авторизуйтесь в системе.');
                            setShowModal(true);
                            return;
                        }
                        break;
                    default:
                        throw new Error('Недостаточно прав для данной страницы. Обратитесь к администратору.');
                }

                const eventsRef = ref(database, 'Events');
                const snapshot = await get(eventsRef);
                if (snapshot.exists()) {
                    const eventsData = [];
                    snapshot.forEach(childSnapshot => {
                        const item = childSnapshot.val();
                        // Добавляем только опубликованные события
                        if (item.status === "Опубликовано") {
                            eventsData.push({
                                ...item,
                                id: childSnapshot.key,
                                images: item.images && Array.isArray(item.images) ? item.images : [defaultEventImage]
                            });
                        }
                    });
                    setEventsData(eventsData);
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Устанавливаем начальные значения для фильтров
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        setStartDate(today.toISOString().split("T")[0]); // Формат YYYY-MM-DD
        setEndDate(thirtyDaysFromNow.toISOString().split("T")[0]); // Формат YYYY-MM-DD
    }, [navigate]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === "startDate") setStartDate(value);
        if (name === "endDate") setEndDate(value);
        if (name === "pastEvents") setPastEvents(e.target.checked);
        if (name === "elementType") setElementType(value);
    };

    // Функция для сброса фильтров
    const resetFilters = () => {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        setStartDate(today.toISOString().split("T")[0]); // Формат YYYY-MM-DD
        setEndDate(thirtyDaysFromNow.toISOString().split("T")[0]); // Формат YYYY-MM-DD
        setPastEvents(false); // Сбросим фильтр прошедших событий
        setElementType(''); // Сбросим тип события
        setSelectedDate(null); // Сбросим выбранную дату
    };

    // Функция для нормализации даты (обнуление времени)
    const normalizeDate = (date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };

    // Функция для форматирования даты события
    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.getTime() === today.getTime()) {
            return 'Сегодня';
        } else if (date.getTime() === tomorrow.getTime()) {
            return 'Завтра';
        } else {
            return formatDate(dateString, true); // Используем вашу функцию formatDate
        }
    };

    const filteredEvents = eventsData.filter(item => {
        const eventStartDate = normalizeDate(item.start_date);
        const eventEndDate = normalizeDate(item.end_date);
        const today = normalizeDate(new Date());

        // Фильтрация по прошедшим событиям
        if (!pastEvents && eventEndDate < today) {
            return false;
        }

        // Фильтрация по диапазону дат
        if (startDate && endDate) {
            const start = normalizeDate(startDate);
            const end = normalizeDate(endDate);
            if (eventStartDate > end || eventEndDate < start) {
                return false;
            }
        }

        // Фильтрация по типу события
        if (elementType && item.elementType !== elementType) {
            return false;
        }

        return true;
    });

    // Обработчик выбора даты в календаре
    const handleDateSelect = (date) => {
        // Нормализуем выбранную дату
        const normalizedDate = normalizeDate(date);
        setSelectedDate(normalizedDate);
    };

    // Фильтрация событий по выбранной дате
    const eventsForSelectedDate = selectedDate
        ? filteredEvents.filter(event => {
            const eventStartDate = normalizeDate(event.start_date);
            const eventEndDate = normalizeDate(event.end_date);
            return (
                eventStartDate <= selectedDate && eventEndDate >= selectedDate
            );
        })
        : filteredEvents.filter(event => {
            const eventStartDate = normalizeDate(event.start_date);
            const today = normalizeDate(new Date());
            const thirtyDaysFromNow = new Date(today);
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            const endDate = normalizeDate(thirtyDaysFromNow);
            return eventStartDate >= today && eventStartDate <= endDate;
        });

    // Сортировка событий по дате начала
    eventsForSelectedDate.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="page-content events-page">
            <div className="events-content-calendar">
                <Calendar events={filteredEvents} onDateSelect={handleDateSelect} />
                <div className="events-content-calendar-legend">
                    <div className="events-external-legend">
                        <div></div>
                        <p>Внешнее событие</p>
                    </div>
                    <div className="events-internal-legend">
                        <div></div>
                        <p>Внутреннее событие</p>
                    </div>
                </div>
            </div>

            <div className="events-content-cards-container">
                <div
                    className={`filter filter-worked ${IsFilterBlock ? 'filter-worked-active' : ''} noselect`}
                    onClick={() => setIsFilterBlock(!IsFilterBlock)}>
                    <img src={imgFilterIcon} alt="" />
                    <p>Фильтр</p>
                </div>
                {IsFilterBlock && (
                    <div className="filter-block noselect">
                        <div>
                            <label>Дата с:</label>
                            <input
                                type="date"
                                name="startDate"
                                value={startDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <label>Дата по:</label>
                            <input
                                type="date"
                                name="endDate"
                                value={endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <hr />
                        <div>
                            <label style={{ display: 'flex' }}>
                                <input
                                    type="checkbox"
                                    name="pastEvents"
                                    checked={pastEvents}
                                    onChange={handleFilterChange}
                                />
                                <div>Прошедшие события</div>
                            </label>
                        </div>
                        <hr />
                        <div>
                            <select
                                name="elementType"
                                value={elementType}
                                onChange={handleFilterChange}
                            >
                                <option value="">Тип события</option>
                                <option value="Внешнее событие">Внешнее событие</option>
                                <option value="Внутреннее событие">Внутреннее событие</option>
                            </select>
                        </div>
                        <a onClick={resetFilters}>Сбросить фильтр</a>
                    </div>
                )}
                <div className="events-content-cards-list">
                    {eventsForSelectedDate.map(e => (
                        <Link to={`/events/${e.id}`} key={e.id} className="standart-card-link">
                            <StandartCard
                                title={e.title}
                                text={e.text}
                                publicDate={formatEventDate(e.start_date)}
                                isEvents={true}
                                eventType={e.elementType}
                                images={e.images}
                            />
                        </Link>
                    ))}
                    {eventsForSelectedDate.length === 0 && (
                        <p>На выбранную дату событий нет.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsPage;
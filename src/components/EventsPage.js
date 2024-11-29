import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import '../styles/EventsPage.css';
import StandartCard from "./StandartCard";
import { Link, useNavigate } from 'react-router-dom';
import imgFilterIcon from '../images/filter.svg';
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
                                id: childSnapshot.key
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

    const filteredEvents = eventsData.filter(item => {
        const eventStartDate = new Date(item.start_date);
        const today = new Date();

        // Фильтрация по прошедшим событиям
        if (pastEvents && eventStartDate >= today) {
            return false;
        }

        // Фильтрация по диапазону дат
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (eventStartDate < start || eventStartDate > end) {
                return false;
            }
        }

        // Фильтрация по типу события
        if (elementType && item.elementType !== elementType) {
            return false;
        }

        return true;
    });

    // Функция для форматирования даты
    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Сегодня';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Завтра';
        } else {
            return formatDate(dateString, true); // Используем вашу функцию formatDate
        }
    };

    // Обработчик выбора даты в календаре
    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    // Фильтрация событий по выбранной дате
    const eventsForSelectedDate = selectedDate
        ? filteredEvents.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate.toDateString() === selectedDate.toDateString();
          })
        : [];

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

            {selectedDate && (
                <div className="events-content-cards-list">
                    <div className={`filter filter-worked ${IsFilterBlock ? 'filter-worked-active' : ''} noselect`} onClick={() => setIsFilterBlock(!IsFilterBlock)}>
                        <img src={imgFilterIcon} alt="" />
                        <p>Фильтр</p>
                    </div>
                    {IsFilterBlock && (
                        <div className="filter-block noselect">
                            <div>
                                <label>Дата с:</label>
                                <input type="date" name="startDate" value={startDate} onChange={handleFilterChange} />
                            </div>
                            <div>
                                <label>Дата по:</label>
                                <input type="date" name="endDate" value={endDate} onChange={handleFilterChange} />
                            </div>
                            <hr/>
                            <div>
                                <label style={{display: 'flex'}}>
                                    <input type="checkbox" name="pastEvents" checked={pastEvents} onChange={handleFilterChange} />
                                    <div>Прошедшие события</div>
                                </label>
                            </div>
                            <hr/>
                            <div>
                                <select name="elementType" value={elementType} onChange={handleFilterChange}>
                                    <option value="">Тип события</option>
                                    <option value="Внешнее событие">Внешнее событие</option>
                                    <option value="Внутреннее событие">Внутреннее событие</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {eventsForSelectedDate.map(e => (
                        <Link to={`/events/${e.id}`} key={e.id}>
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
                </div>
            )}
        </div>
    );
};

export default EventsPage;
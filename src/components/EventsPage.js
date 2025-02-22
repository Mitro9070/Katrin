// EventsPage.js

import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import '../styles/EventsPage.css';
import StandartCard from "./StandartCard";
import { Link, useNavigate } from 'react-router-dom';
import imgFilterIcon from '../images/filter.svg';
import defaultEventImage from '../images/events.jpg';
import Loader from "./Loader";
import Cookies from 'js-cookie';
import { getPermissions } from '../utils/Permissions';
import formatDate from '../utils/formatDate';
import { fetchEvents } from '../Controller/EventsController';
import { getImageUrl } from '../utils/getImageUrl';

const EventsPage = () => {
    const [IsFilterBlock, setIsFilterBlock] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pastEvents, setPastEvents] = useState(true);
    const [elementType, setElementType] = useState('');
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userId = Cookies.get('userId');
                const roleId = Cookies.get('roleId') || '2';
                const permissions = getPermissions(roleId);

                // Проверка прав доступа (если необходимо)

                // Загрузить события с бэкенда
                const eventsResponse = await fetchEvents(); // Загрузим все события

                const eventsData = eventsResponse
                    .filter(event => event.status === "Опубликовано") // Фильтруем опубликованные события
                    .map(event => ({
                        ...event,
                        images: event.image
                            ? [getImageUrl(event.image)]
                            : [defaultEventImage],
                    }));

                setEventsData(eventsData);
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

        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(thirtyDaysFromNow.toISOString().split("T")[0]);
        setPastEvents(true); // Галочка установлена по умолчанию
    }, [navigate]);

    const handleFilterChange = (e) => {
        const { name, value, checked } = e.target;
        if (name === "startDate") setStartDate(value);
        if (name === "endDate") setEndDate(value);
        if (name === "pastEvents") setPastEvents(checked);
        if (name === "elementType") setElementType(value);
    };

    const resetFilters = () => {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(thirtyDaysFromNow.toISOString().split("T")[0]);
        setPastEvents(true);
        setElementType('');
        setSelectedDate(null);
    };

    const normalizeDate = (date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };

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
            return formatDate(dateString, true);
        }
    };

    const filterEvents = (eventsArray) => {
        return eventsArray.filter(item => {
            const eventStartDate = normalizeDate(item.start_date);
            const eventEndDate = normalizeDate(item.end_date);
            const today = normalizeDate(new Date());

            // Фильтрация по типу события
            if (elementType && item.elementtype !== elementType) {
                return false;
            }

            // Если галочка "Прошедшие события" установлена
            if (pastEvents) {
                return true;
            } else {
                // Если галочка не установлена, показываем только будущие события в заданном диапазоне дат
                if (eventEndDate < today) {
                    return false;
                }
                if (startDate && endDate) {
                    const start = normalizeDate(startDate);
                    const end = normalizeDate(endDate);
                    if (eventStartDate > end || eventEndDate < start) {
                        return false;
                    }
                }
                return true;
            }
        });
    };

    const calendarEvents = filterEvents(eventsData);

    const handleDateSelect = (date) => {
        const normalizedDate = normalizeDate(date);
        setSelectedDate(normalizedDate);
    };

    const eventsForSelectedDate = selectedDate
        ? calendarEvents.filter(event => {
            const eventStartDate = normalizeDate(event.start_date);
            const eventEndDate = normalizeDate(event.end_date);
            return (
                eventStartDate <= selectedDate && eventEndDate >= selectedDate
            );
        })
        : calendarEvents;

    // Сортировка событий по дате начала
    eventsForSelectedDate.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    if (loading) return <Loader />;
    if (error) return <p>{error}</p>;

    return (
        <div className="page-content events-page">
            <div className="events-content-calendar">
                <Calendar events={calendarEvents} onDateSelect={handleDateSelect} />
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
                {/* Добавляем кнопку "Личный календарь" */}
                <button
                    className="personal-calendar-button noselect"
                    onClick={() => navigate('/personal-calendar')}
                >
                    Личный календарь
                </button>
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
                                eventType={e.elementtype}
                                images={e.images} // Передаём массив изображений
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
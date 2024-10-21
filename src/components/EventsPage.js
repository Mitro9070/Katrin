import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import '../styles/EventsPage.css';
import { observer } from 'mobx-react-lite';
import { eventsStore } from '../stores/EventsStore';
import { navigationStore } from '../stores/NavigationStore';
import StandartCard from "./StandartCard";
import { Link } from 'react-router-dom';
import imgFilterIcon from '../images/filter.svg';

const EventsPage = observer(() => {
    const [IsFilterBlock, setIsFilterBlock] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pastEvents, setPastEvents] = useState(false);
    const [elementType, setElementType] = useState('');

    useEffect(() => {
        // Устанавливаем начальные значения для фильтров
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        setStartDate(today.toISOString().split("T")[0]); // Формат YYYY-MM-DD
        setEndDate(thirtyDaysFromNow.toISOString().split("T")[0]); // Формат YYYY-MM-DD

        navigationStore.setCurrentEventsDate('');
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === "startDate") setStartDate(value);
        if (name === "endDate") setEndDate(value);
        if (name === "pastEvents") setPastEvents(e.target.checked);
        if (name === "elementType") setElementType(value);
    };

    const filteredEvents = eventsStore.Events.filter(item => {
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

        // Если нет фильтров, отображаем все события
        return true;
    });

    return (
        <div className="page-content events-page">
            <div className="events-content-calendar">
                <Calendar />
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

            <div className="events-content-cards-list">
                {!navigationStore.currentEventDate && (
                    <>
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
                        {filteredEvents.map(e => {
                            return (
                                <Link to={`/events/${e.id}`} key={e.id}>
                                    <StandartCard
                                        title={e.title}
                                        text={e.text}
                                        publicDate={e.eventDate}
                                        isEvents={true}
                                        eventType={e.elementType}
                                        image={e.image[0]}
                                    />
                                </Link>
                            );
                        })}
                    </>
                )}
                {eventsStore.getEventsByDate(navigationStore.currentEventDate).map(e => {
                    return (
                        <Link to={`/events/${e.id}`} key={e.id}>
                            <StandartCard
                                title={e.title}
                                text={e.text}
                                publicDate={e.eventDate}
                                isEvents={true}
                                eventType={e.elementType}
                                image={e.image[0]}
                            />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
});

export default EventsPage;
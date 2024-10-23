import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';
import goArrowRight from '../images/go-arrow.svg';
import { navigationStore } from '../stores/NavigationStore';
import { database } from "../firebaseConfig";
import { ref, get } from "firebase/database";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const todayDate = new Date();

    useEffect(() => {
        navigationStore.setCurrentEventsDate(`${todayDate.getDate()}.${todayDate.getMonth() + 1}.${todayDate.getFullYear()}`);
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const eventsRef = ref(database, 'Events');
            const snapshot = await get(eventsRef);
            if (snapshot.exists()) {
                const eventsData = [];
                snapshot.forEach((childSnapshot) => {
                    const item = childSnapshot.val();
                    if (item.status === 'Опубликовано') {
                        eventsData.push({
                            ...item,
                            id: childSnapshot.key
                        });
                    }
                });
                setEvents(eventsData);
                console.log("Полученные события из Firebase:", eventsData);
            } else {
                console.log("Данные отсутствуют.");
            }
        } catch (error) {
            console.error("Ошибка при получении данных:", error);
        }
    };

    console.log("Текущий месяц:", currentDate.getMonth() + 1);
    console.log("Текущий год:", currentDate.getFullYear());
    console.log("Текущий день:", currentDate.getDate());

    // Разделение событий на внутренние и внешние
    const eventDays = {
        internal: [],
        external: []
    };

    events.forEach(event => {
        const date = event.postData.split(',')[0].split('.').reverse().join('-');
        if (event.elementType === 'Внутреннее событие') {
            eventDays.internal.push(date);
        } else if (event.elementType === 'Внешнее событие') {
            eventDays.external.push(date);
        }
    });

    console.log("Внутренние события в календарь:", eventDays.internal);
    console.log("Внешние события в календарь:", eventDays.external);
    console.log("Даты событий в календарь:", eventDays);

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = (startOfMonth.getDay() === 0) ? 6 : startOfMonth.getDay() - 1;

    const daysInMonth = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
        daysInMonth.push(i);
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const onDateClickHandler = (e) => {
        const selectedDate = e.target.dataset.tab;
        navigationStore.setCurrentEventsDate(selectedDate);
    };

    return (
        <div className="calendar noselect">
            <header>
                <p>{currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).slice(1)}</p>
                <div onClick={prevMonth} className="icon-container" style={{ transform: 'rotate(180deg)' }}>
                    <img src={goArrowRight} alt="" />
                </div>
                <div onClick={nextMonth} className="icon-container">
                    <img src={goArrowRight} alt="" />
                </div>
            </header>
            <div className="calendar-grid">
                <div className="calendar-head">
                    {daysOfWeek.map((e, index) => (
                        <div key={index} className="days-of-week">{e}</div>
                    ))}
                </div>
                <div className='calendar-days'>
                    {/* Заполнение пустых ячеек до начала месяца */}
                    {[...Array(startDay).keys()].map((_, index) => (
                        <div key={index} className="empty"></div>
                    ))}
                    {/* Отрисовка дней месяца */}
                    {daysInMonth.map((day, index) => {
                        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasInternalEvent = eventDays.internal.includes(dateString);
                        const hasExternalEvent = eventDays.external.includes(dateString);

                        return (
                            <div
                                key={day}
                                className={`day ${(day === todayDate.getDate() && currentDate.getMonth() === todayDate.getMonth() && currentDate.getFullYear() === todayDate.getFullYear()) ? 'today' : ''} ${([6, 0].includes((day + startDay) % 7)) ? 'weekend' : ''}`}
                                data-tab={`${day}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`}
                                onClick={onDateClickHandler}
                            >
                                {day}
                                {hasInternalEvent && <div className="event-line internal-event-line"></div>}
                                {hasExternalEvent && <div className="event-line external-event-line"></div>}
                            </div>
                        );
                    })}
                    {/* Заполнение пустых ячеек после окончания месяца */}
                    {[...Array(35 - (startDay + daysInMonth.length) >= 0 ? 35 - (startDay + daysInMonth.length) : 42 - (startDay + daysInMonth.length)).keys()].map((_, index) => (
                        <div key={index} className="empty">{index + 1}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
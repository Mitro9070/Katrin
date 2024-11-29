import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';
import goArrowRight from '../images/go-arrow.svg';
import { navigationStore } from '../stores/NavigationStore';

const Calendar = ({ events, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const todayDate = new Date();

    useEffect(() => {
        navigationStore.setCurrentEventsDate(`${todayDate.getDate()}.${todayDate.getMonth() + 1}.${todayDate.getFullYear()}`);
    }, [todayDate]);

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = (startOfMonth.getDay() === 0) ? 6 : startOfMonth.getDay() - 1;

    const daysInMonth = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
        daysInMonth.push(i);
    }

    // Разделение событий на внутренние и внешние
    const eventDays = {
        internal: [],
        external: []
    };

    events.forEach(event => {
        const date = new Date(event.start_date).toISOString().split('T')[0];
        if (event.elementType === 'Внутреннее событие') {
            eventDays.internal.push(date);
        } else if (event.elementType === 'Внешнее событие') {
            eventDays.external.push(date);
        }
    });

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const onDateClickHandler = (e) => {
        const selectedDate = new Date(e.target.dataset.fullDate);
        navigationStore.setCurrentEventsDate(`${selectedDate.getDate()}.${selectedDate.getMonth() + 1}.${selectedDate.getFullYear()}`);
        onDateSelect(selectedDate);
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
                    {daysOfWeek.map((day, index) => (
                        <div key={index} className="days-of-week">{day}</div>
                    ))}
                </div>
                <div className='calendar-days'>
                    {[...Array(startDay).keys()].map((_, index) => (
                        <div key={`empty-start-${index}`} className="empty"></div>
                    ))}
                    {daysInMonth.map((day) => {
                        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasInternalEvent = eventDays.internal.includes(dateString);
                        const hasExternalEvent = eventDays.external.includes(dateString);

                        return (
                            <div
                                key={day}
                                className={`day ${(day === todayDate.getDate() && currentDate.getMonth() === todayDate.getMonth() && currentDate.getFullYear() === todayDate.getFullYear()) ? 'today' : ''} ${([6, 0].includes((day + startDay) % 7)) ? 'weekend' : ''}`}
                                data-tab={`${day}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`}
                                data-full-date={dateString}
                                onClick={onDateClickHandler}
                            >
                                {day}
                                {hasInternalEvent && <div className="event-line internal-event-line"></div>}
                                {hasExternalEvent && <div className="event-line external-event-line"></div>}
                            </div>
                        );
                    })}
                    {[...Array(42 - (startDay + daysInMonth.length)).keys()].map((_, index) => (
                        <div key={`empty-end-${index}`} className="empty"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';
import goArrowRight from '../images/go-arrow.svg';
import { navigationStore } from '../stores/NavigationStore';
import { eventsStore } from '../stores/EventsStore';
import { observer } from 'mobx-react-lite';

const Calendar = observer(() => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const todayDate = new Date();

    useEffect(() => {
        navigationStore.setCurrentEventsDate(`${todayDate.getDate()}.${todayDate.getMonth() + 1}.${todayDate.getFullYear()}`);
    }, [todayDate]);

    console.log(currentDate.getMonth() + 1);
    console.log(currentDate.getFullYear());
    console.log(currentDate.getDate());

    const eventDays = eventsStore.getEventsDates();

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
                    {[...Array(startDay).keys()].map((_, index) => (
                        <div key={index} className="empty"></div>
                    ))}
                    {daysInMonth.map((day, index) => {
                        let hasInternalEvent = false;
                        let hasExternalEvent = false;

                        return (
                            <div
                                key={day}
                                className={`day ${(day === todayDate.getDate() && currentDate.getMonth() === todayDate.getMonth() && currentDate.getFullYear() === todayDate.getFullYear()) ? 'today' : ''} ${([6, 0].includes((day + startDay) % 7)) ? 'weekend' : ''}`}
                                data-tab={`${day}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}`}
                                onClick={onDateClickHandler}
                            >
                                {day}
                                {eventDays.internal.map((date, index) => {
                                    let newDate = date.split('.');
                                    if (newDate[0] === String(day) && newDate[1] === String(currentDate.getMonth() + 1) && newDate[2] === String(currentDate.getFullYear()) && !hasInternalEvent) {
                                        hasInternalEvent = true;
                                        return <div key={index} className="event-line internal-event-line"></div>;
                                    }
                                    return null;
                                })}
                                {eventDays.external.map((date, index) => {
                                    let newDate = date.split('.');
                                    if (newDate[0] === String(day) && newDate[1] === String(currentDate.getMonth() + 1) && newDate[2] === String(currentDate.getFullYear()) && !hasExternalEvent) {
                                        hasExternalEvent = true;
                                        return <div key={index} className="event-line external-event-line"></div>;
                                    }
                                    return null;
                                })}
                            </div>
                        );
                    })}
                    {[...Array(35 - (startDay + daysInMonth.length) >= 0 ? 35 - (startDay + daysInMonth.length) : 42 - (startDay + daysInMonth.length)).keys()].map((_, index) => (
                        <div key={index} className="empty">{index + 1}</div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Calendar;
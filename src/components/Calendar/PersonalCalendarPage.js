// src/components/Calendar/PersonalCalendarPage.js

import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'; // HOC для поддержки drag-and-drop
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Стили для drag-and-drop
import { DndProvider } from 'react-dnd'; // Провайдер для drag-and-drop
import { HTML5Backend } from 'react-dnd-html5-backend'; // Backend для HTML5 DnD
import TopPanel from './TopPanel';
import LeftCalendarPanel from './LeftCalendarPanel';
import EventModal from './EventModal';
import SingleEventsPage from '../SingleEventsPage'; // Импортируем компонент просмотра события
import CustomEvent from './CustomEvent'; // Ваш кастомный компонент для отображения событий
import './styles/PersonalCalendarPage.css';
import { fetchEvents, editEvent, fetchEventById } from '../../Controller/EventsController'; // Импорт функции fetchEventById

moment.locale('ru');
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar); // Оборачиваем Calendar в HOC для drag-and-drop

const PersonalCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('week'); // Возможные значения: 'day', 'week', 'month'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventModalData, setEventModalData] = useState({});

    // Новые состояния для просмотра события
    const [showEventViewModal, setShowEventViewModal] = useState(false);
    const [selectedEventData, setSelectedEventData] = useState(null); // Хранит полные данные события

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventsFromServer = await fetchEvents();
                const transformedEvents = eventsFromServer.map(event => ({
                    id: event.id,
                    title: event.title,
                    start: moment.tz(event.start_date, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Moscow').toDate(),
                    end: moment.tz(event.end_date, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Moscow').toDate(),
                    status: event.status,
                    allDay: false,
                    // Другие необходимые поля
                }));
                console.log('Трансформированные события:', transformedEvents);
                setEvents(transformedEvents);
            } catch (error) {
                console.error('Ошибка при загрузке событий:', error);
            }
        };

        fetchData();
    }, []);

    const handleSelectSlot = ({ start, end }) => {
        setEventModalData({ start, end });
        setShowEventModal(true);
    };

    const handleEventSelect = async (event) => {
        try {
            // Запрашиваем полные данные события по ID
            const fullEventData = await fetchEventById(event.id);
            setSelectedEventData(fullEventData);
            setShowEventViewModal(true);
        } catch (error) {
            console.error('Ошибка при загрузке события:', error);
            alert('Произошла ошибка при загрузке события.');
        }
    };

    const handleEventSave = async (newEvent) => {
        try {
            // Загружаем полные данные нового события по его ID
            const fullEventData = await fetchEventById(newEvent.id);
    
            // Трансформируем событие для календаря
            const transformedEvent = {
                id: fullEventData.id,
                title: fullEventData.title,
                start: moment.tz(fullEventData.start_date, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Moscow').toDate(),
                end: moment.tz(fullEventData.end_date, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Moscow').toDate(),
                status: fullEventData.status,
                allDay: false,
                // Другие необходимые поля
            };
    
            // Обновляем состояние событий
            setEvents((prevEvents) => [...prevEvents, transformedEvent]);
        } catch (error) {
            console.error('Ошибка при загрузке нового события:', error);
        } finally {
            setShowEventModal(false);
        }
    };

    // Обработчик перетаскивания события
    const handleEventDrop = async ({ event, start, end, isAllDay }) => {
        // Создаем FormData для отправки обновленных данных события на сервер
        const formData = new FormData();
        formData.append('start_date', moment(start).format('YYYY-MM-DDTHH:mm:ss'));
        formData.append('end_date', moment(end).format('YYYY-MM-DDTHH:mm:ss'));

        try {
            // Вызываем функцию редактирования события
            await editEvent(event.id, formData);

            // Обновляем состояние событий
            setEvents((prevEvents) => {
                const updatedEvents = prevEvents.map((evt) => {
                    if (evt.id === event.id) {
                        return { ...evt, start, end };
                    }
                    return evt;
                });
                return updatedEvents;
            });
        } catch (error) {
            console.error('Ошибка при изменении даты события:', error);
            alert('Произошла ошибка при изменении даты события.');
        }
    };

    return (
        <div className="personal-calendar-page">
            <TopPanel
                view={view}
                setView={setView}
                onCreateEvent={() => setShowEventModal(true)}
            />
            <div className="personal-calendar-content">
                <LeftCalendarPanel
                    selectedDate={selectedDate}
                    onDateChange={date => setSelectedDate(date)}
                />
                <div className="work-area">
                    <DndProvider backend={HTML5Backend}>
                        <DnDCalendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView={view}
                            date={selectedDate}
                            onNavigate={date => setSelectedDate(date)}
                            view={view} 
                            onView={setView}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleEventSelect}
                            views={['day', 'week', 'month']}
                            min={new Date(1970, 0, 1, 9, 0, 0)}
                            max={new Date(1970, 0, 1, 23, 59, 0)}
                            showMultiDayTimes={false}
                            step={30}
                            timeslots={2}
                            toolbar={false} // Отключаем стандартную верхнюю панель
                            components={{
                                event: CustomEvent, // Добавляем ваш компонент для отображения событий
                            }}
                            // Настройки Drag and Drop
                            draggableAccessor={() => true} // Разрешаем перетаскивать все события
                            resizableAccessor={() => false} // Отключаем изменение размера событий (если нужно)
                            onEventDrop={handleEventDrop} // Обработчик перетаскивания событий
                            eventPropGetter={(event) => {
                                let backgroundColor = '#0078D4'; // По умолчанию синий цвет для опубликованных событий
                                if (event.status === 'На модерации') {
                                    backgroundColor = '#f0ad4e'; // Оранжевый цвет для событий на модерации
                                } else if (event.status === 'Согласовано') {
                                    backgroundColor = '#5bc0de'; // Голубой цвет для согласованных событий
                                } else if (event.status === 'Отклонено') {
                                    backgroundColor = '#d9534f'; // Красный цвет для отклоненных событий
                                }

                                return {
                                    style: {
                                        backgroundColor,
                                        color: '#fff',
                                        borderRadius: '4px',
                                        border: 'none',
                                        padding: '2px 5px',
                                    },
                                };
                            }}
                            dayPropGetter={(date) => {
                                const day = date.getDay();
                                // Выходные дни
                                if (day === 0 || day === 6) {
                                    return {
                                        style: {
                                            backgroundColor: '#f9f9f9', // Цвет фона для выходных
                                        },
                                    };
                                }
                                // Рабочие дни
                                return {
                                    style: {
                                        backgroundColor: '#fff', // Цвет фона для рабочих дней
                                    },
                                };
                            }}
                            // Настройка слотов времени для выделения рабочих часов
                            slotPropGetter={(date) => {
                                const hour = date.getHours();
                                if (hour >= 9 && hour < 18) {
                                    return {
                                        style: {
                                            backgroundColor: '#e8f5e9', // Цвет для рабочих часов
                                            },
                                        };
                                    }
                                    return {};
                                }}
                            />
                        </DndProvider>
                    </div>
                </div>
            {showEventModal && (
                <EventModal
                    onClose={() => setShowEventModal(false)}
                    onSave={handleEventSave}
                    initialData={eventModalData} // Передаем начальные данные
                />
            )}
            {showEventViewModal && selectedEventData && (
                <div className="modal">
                    <div className="modal-content event-view-modal">
                        <SingleEventsPage
                            eventData={selectedEventData}
                            onClose={() => setShowEventViewModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalCalendarPage;
// src/components/Calendar/CustomEvent.js

import React from 'react';

const CustomEvent = ({ event, title }) => {
    // Форматируем даты начала и окончания
    const start = event.start ? new Date(event.start) : null;
    const end = event.end ? new Date(event.end) : null;

    const formatDate = (date) => {
        return date ? date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '';
    };

    // Проверяем, является ли событие много-дневным
    const isMultiDay = start && end && (end.getDate() !== start.getDate() || end.getMonth() !== start.getMonth());

    if (isMultiDay) {
        return (
            <span>
                <strong>{event.title} {formatDate(start)} - {formatDate(end)}</strong>
                <div>
                    
                </div>
            </span>
        );
    }

    return <span>{event.title}</span>;
};

export default CustomEvent;
const formatDate = (dateString, isEvent = false) => {
    if (!dateString) return '';

    let date;
    if (isEvent) {
        // Формат даты для событий: "2024-11-22T16:05" или другое
        date = new Date(dateString);
    } else {
        // Формат даты для новостей: "2025-01-29T03:37:05.793Z" или другое ISO-форматирование
        date = new Date(dateString);
    }

    if (isNaN(date)) return '';

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeString = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
        return `Сегодня в ${timeString}`;
    } else if (isTomorrow) {
        return `Завтра в ${timeString}`;
    } else {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ` в ${timeString}`;
    }
};


const formatBirthday = (dateString) => {
    if (typeof dateString === 'string') {
        if (dateString.includes('-')) {
            return new Date(dateString);
        } else {
            const [day, month, year] = dateString.split('.');
            return new Date(`${year}-${month}-${day}`);
        }
    } else {
        return new Date(dateString);
    }
};

const formatNewEmployee = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// dates.js

export const getNextMonthDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
};

export const isWithinDateRange = (date, start, end) => {
    const checkDate = new Date(date);
    return checkDate >= start && checkDate <= end;
};

export { formatDate as default, formatBirthday, formatNewEmployee };
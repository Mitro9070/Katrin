const formatDate = (dateString, isEvent = false) => {
    let date;
    if (isEvent) {
        // Формат даты для событий: "2024-11-22T16:05"
        date = new Date(dateString);
    } else {
        // Формат даты для новостей: "21.11.2024, 10:56:05"
        const [day, month, yearAndTime] = dateString.split('.');
        const [year, time] = yearAndTime.split(', ');
        date = new Date(`${year}-${month}-${day}T${time}`);
    }

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (isToday) {
        return `Сегодня в ${time}`;
    } else if (isTomorrow) {
        return `Завтра в ${time}`;
    } else {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ` в ${time}`;
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

export { formatDate as default, formatBirthday };
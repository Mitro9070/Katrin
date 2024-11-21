const formatDate = (dateString) => {
    const date = new Date(dateString.replace(/(\d+).(\d+).(\d+)/, '$3-$2-$1'));
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

export default formatDate;
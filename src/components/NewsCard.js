import React from 'react';
import '../styles/NewsCard.css'; // Импортируем стили для NewsCard
import defaultImage from '../images/News.png'; // Импортируем изображение по умолчанию

function NewsCard({ status, eventType, publicDate, title, text, images }) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text; // Создаем временный элемент для извлечения текста из HTML
    const extractedText = tempElement.innerText || tempElement.textContent;

    // Форматирование статуса
    if (status === 'Архив одобренных' || status === 'Одобрено') {
        status = status === 'Одобрено' ? 'Опубликовано' : 'Архив опубликованных';
    }

    if (Array.isArray(status)) {
        if (status.length === 3) {
            status = 'Все';
        } else {
            status = status.join(', ');
        }
    }

    // Получаем главное изображение или используем изображение по умолчанию
    const imageUrl = (images && images.length > 0)
        ? images.find(img => img.includes('Main')) || images[0]
        : defaultImage; // Используем изображение по умолчанию, если нет доступных изображений

    return (
        <div className="news-card">
            <div className="bid-list-card-info-bar">
                <div className="bid-list-info-bar-card-column-2">
                    {!eventType && (
                        <p className="bid-card-info-bar-event-type"><i>{eventType}</i></p>
                    )}
                    {publicDate && (
                        <p className="bid-card-info-bar-public-date">{publicDate}</p>
                    )}
                </div>
            </div>
            <div className="bid-list-card-content">
                <div className="bid-list-card-img-container">
                    <img
                        src={imageUrl} // Используем выбранное изображение или изображение по умолчанию
                        alt="News"
                    />
                </div>
                <div className="bid-list-card-content-column-2">
                    <p className={`bid-list-card-title ${status ? 'with-status' : ''}`}>
                        {status ? `${status} ${title}` : title}
                    </p>
                    <p className="bid-list-card-text">{extractedText}</p>
                </div>
            </div>
        </div>
    );
}

export default NewsCard;
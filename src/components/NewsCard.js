import React, { useState } from 'react';
import '../styles/NewsCard.css'; // Импортируем стили для NewsCard
import defaultImage from '../images/News.png'; // Импортируем изображение по умолчанию

function NewsCard({ status, eventType, publicDate, title, text, images, authorName }) {
    // Создаем временный элемент для извлечения текста из HTML
    console.log('Данные пользователя в новой карточке:', authorName);
    console.log('Данные пользователя заголовок:', title);
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text;
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
    const initialImageUrl = (images && images.length > 0)
        ? images.find(img => img.includes('Main') && img.trim() !== '') || images[0]
        : defaultImage;

    const [imageUrl, setImageUrl] = useState(initialImageUrl);

    // Обработчик ошибок загрузки изображения
    const handleImageError = () => {
        setImageUrl(defaultImage);
    };

    return (
        <div className="news-card">
            {/* Информационная панель карточки */}
            <div className="bid-list-card-info-bar">
                <div className="bid-list-info-bar-card-column-2">
                    {eventType && (
                        <p className="bid-card-info-bar-event-type"><i>{eventType}</i></p>
                    )}
                    {publicDate && (
                        <p className="bid-card-info-bar-public-date">{publicDate}</p>
                    )}
                </div>
            </div>
            {/* Содержимое карточки */}
            <div className="bid-list-card-content">
                <div className="bid-list-card-img-container">
                    <img
                        src={imageUrl} // Используем выбранное изображение или изображение по умолчанию
                        alt="News"
                        onError={handleImageError} // Обработка ошибки загрузки изображения
                    />
                </div>
                <div className="bid-list-card-content-column-2">
                    <p className={`bid-list-card-title ${status ? 'with-status' : ''}`}>
                        {status ? `${status} ${title}` : title}
                    </p>
                    <p className="bid-list-card-text">{extractedText}</p>
                    {/* Отображение имени автора внизу мелким шрифтом */}
                    {authorName && (
                        <p className="bid-list-card-author">Автор: {authorName}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NewsCard;
import { useEffect, useState } from 'react';
import '../styles/StandartCard.css';

function StandartCard({ status, eventType, publicDate, title, text, images, isEvents = false }) {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (images && images.length > 0) {
            const mainImage = images.find(img => img.includes('Main')) || images[0];
            setImageUrl(mainImage);
        }
    }, [images]);

    // Создаём временный элемент для извлечения текста из HTML
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

    return (
        <div className="standart-card">
            <div className="bid-list-card-info-bar">
                <div className="bid-list-info-bar-card-column-2">
                    {!isEvents && eventType && (
                        <p className="bid-card-info-bar-event-type"><i>{eventType}</i></p>
                    )}
                    {publicDate && (
                        <p className="bid-card-info-bar-public-date">{publicDate}</p>
                    )}
                </div>
            </div>
            <div className="bid-list-card-content">
                <div className="bid-list-card-img-container">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="News"
                            loading="lazy"
                        />
                    ) : (
                        <p>Изображение не найдено</p>
                    )}
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

export default StandartCard;
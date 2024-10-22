import { useEffect, useState } from 'react';
import '../styles/StandartCard.css';

function StandartCard({ status, eventType, publicDate, title, text, images, isEvents = false }) {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (images && images.length > 0) {
            const mainImage = images[0];
            setImageUrl(mainImage);
            console.log("Main image URL:", mainImage);
        } else {
            console.log("No images provided");
        }
    }, [images]);

    // Создаем временный элемент
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text; // Устанавливаем HTML-содержимое во временный элемент

    // Извлекаем текст
    const extractedText = tempElement.innerText || tempElement.textContent;

    if (status === 'Архив одобренных' || status === 'Одобрено') {
        status = status === 'Одобрено' ? 'Опубликованно' : 'Архив опубликованных';
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
                    {!isEvents && (
                        <p className="bid-card-info-bar-event-type"><i>{eventType}</i></p>
                    )}
                    <p className="bid-card-info-bar-public-date">{publicDate}</p>
                    {isEvents && (
                        <div className="events-color-line" style={{ backgroundColor: eventType === 'Внутреннее событие' ? '#80EA77' : '#9B61F9' }}></div>
                    )}
                </div>
            </div>
            <div className="bid-list-card-content">
                <div className="bid-list-card-img-container">
                    {imageUrl ? <img src={imageUrl} alt="News" /> : <p>Изображение не найдено</p>}
                </div>
                <div className="bid-list-card-content-column-2">
                    <p className="bid-list-card-title">{title}</p>
                    {/* Используем извлеченный текст в теге p */}
                    <p className="bid-list-card-text">{extractedText}</p>
                </div>
            </div>
        </div>
    );
}

export default StandartCard;
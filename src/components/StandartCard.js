import { useEffect, useState } from 'react';
import '../styles/StandartCard.css';
import Loader from './Loader'; // Предполагается, что у вас есть компонент Loader для отображения спиннера

function StandartCard({ status, eventType, publicDate, title, text, images, isEvents = false }) {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (images && images.length > 0) {
            const mainImage = images.find(img => img.includes('Main')) || images[0];
            setImageUrl(mainImage);
            console.log("Main image URL:", mainImage);
        } else {
            console.log("No images provided");
            setLoading(false);
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

    const handleImageLoad = () => {
        setLoading(false);
    };

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
                    {isEvents && eventType && (
                        <div className="events-color-line" style={{ backgroundColor: eventType === 'Внутреннее событие' ? '#80EA77' : '#9B61F9' }}></div>
                    )}
                </div>
            </div>
            <div className="bid-list-card-content">
                <div className="bid-list-card-img-container">
                    {loading && <Loader />}
                    {imageUrl ? <img src={imageUrl} alt="Device" onLoad={handleImageLoad} /> : <p>Изображение не найдено</p>}
                </div>
                <div className="bid-list-card-content-column-2">
                    <p className="bid-list-card-title">{status ? `${status} ${title}` : title}</p>
                    {/* Используем извлеченный текст в теге p */}
                    <p className="bid-list-card-text">{extractedText}</p>
                </div>
            </div>
        </div>
    );
}

export default StandartCard;
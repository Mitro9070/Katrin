import { useState, useEffect, useRef } from "react";
import '../styles/MainPageBlockSlide.css';
import Loader from "./Loader";
import { Link } from "react-router-dom";
import formatDate from '../utils/formatDate';

function EventsBlockSlide({ name, data, className = '' }) {
    const [currentInfo, setcurrentInfo] = useState(0);
    const slideWrapperRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(false);
    }, [data]);

    if (loading) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '345px', height: '237px' }}><Loader /><p className="name-block-list">{name}</p></div>; // Состояние загрузки
    if (error) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '345px', height: '237px' }}><p>{error}</p><p className="name-block-list">{name}</p></div>; // Обработка ошибок
    if (data.length === 0) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '345px', height: '237px' }}><p>{name} отсутствуют</p><p className="name-block-list">{name}</p></div>;

    const sortedData = [...data].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    const snapToCard = () => {
        const wrapper = slideWrapperRef.current;
        const cardHeight = wrapper.scrollHeight / sortedData.length;
        const currentScrollPosition = wrapper.scrollTop;

        // Вычисляем ближайшую карточку
        const newCurrentInfo = Math.round(currentScrollPosition / cardHeight);
        setcurrentInfo(newCurrentInfo);

        // Прокручиваем до ближайшей карточки
        const element = document.querySelector(`#event-item-${newCurrentInfo}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleScroll = () => {
        // Откладываем выравнивание до завершения скролла
        clearTimeout(window.snapScrollTimeout);
        window.snapScrollTimeout = setTimeout(() => snapToCard(), 100); // 100 мс после завершения скролла
    };

    return (
        <div className={"block-slide " + className} style={{ width: '345px', height: '237px' }}>
            <div
                id="events-slide-wrapper"
                className="wrapper"
                ref={slideWrapperRef}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    flexDirection: 'column', // Для вертикального скролла
                    overflowY: 'auto', // Вертикальный скролл
                    scrollSnapType: 'y mandatory', // Скролл с "магнитом" по вертикали
                    scrollBehavior: 'smooth', // Плавный скролл
                    height: '217px',
                    width: '287px',
                    gap: '37px',
                }}
            >
                {sortedData.map((item, index) => (
                    <div id={`event-item-${index}`} key={index}>
                        <Link to={`/events/${item.id}`}>
                            <div
                                className="content"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column', // Изменение направления при наличии фото
                                    flex: '0 0 auto',
                                    height: 'auto', // Высота каждой карточки
                                    scrollSnapAlign: 'start', // Притягивание к началу блока
                                }}
                            >
                                <div className="block-slide-text" style={{ flex: '2', padding: '0 15px', overflowY: 'auto' }}>
                                    <p className="datatime-slide">{formatDate(item.start_date, true)}</p>
                                    <p className="title-slide title-slide-events" style={{ marginTop: item.title ? '10px' : '0' }}>{item.title}</p>
                                    <div
                                        className="description-slide"
                                        style={{ marginTop: item.text ? '10px' : '0', width: '262px' }}
                                        dangerouslySetInnerHTML={{ __html: item.text }}
                                    />
                                    {item.tags && (
                                        <p className="tags-slide">
                                            {item.tags.map(tag => `#${tag}`).join(', ')}
                                        </p>
                                    )}
                                    {item.elementType && (
                                        <p className="event-type-slide">
                                            {item.elementType}
                                        </p>
                                    )}
                                    {index < sortedData.length - 1 && (
                                        <div className="event-separator"></div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            <p className="name-block-list">{name}</p>
        </div>
    );
}

export default EventsBlockSlide;
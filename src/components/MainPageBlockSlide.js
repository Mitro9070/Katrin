import { useState, useEffect, useRef } from "react";
import '../styles/MainPageBlockSlide.css';
import { newsContentStore } from '../stores/NewsContentStore';
import { eventsStore } from '../stores/EventsStore';
import Loader from "./Loader";
import { Link } from "react-router-dom";

function MainPageBlockSlide({ name, photo = false, className = '' }) {
    const [currentInfo, setcurrentInfo] = useState(0);
    const [data, setData] = useState([]);
    const slideWrapperRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let newsData;
                if (name === 'События') {
                    await eventsStore.fetchData(); // Загружаем данные из хранилища
                    newsData = eventsStore.Events.filter(event => {
                        const [day, month, year] = event.eventDate.split('.').map(Number); // Разделяем строку и преобразуем в числа
                        const eventDate = new Date(year, month - 1, day); // Преобразуем строку в объект Date
                        const today = new Date(); // Текущая дата
                        return eventDate >= today; // Оставляем только будущие или сегодняшние события
                    }).slice(0, 3); // Ограничиваем до 3 элементов
                } else if (name === 'Новости') {
                    await newsContentStore.fetchData(); // Загружаем данные из хранилища
                    newsData = newsContentStore.News.slice(0, 3); // Ограничиваем до 3 новостей
                }
                setData(newsData); // Устанавливаем данные в состояние
            } catch (err) {
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [name]); // Следим за изменениями `name`

    if (loading) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: photo ? '1095px' : '345px', height: '237px' }}><Loader /><p className="name-block-list">{name}</p></div>; // Состояние загрузки
    if (error) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: photo ? '1095px' : '345px', height: '237px' }}><p>{error}</p><p className="name-block-list">{name}</p></div>; // Обработка ошибок
    if (data.length === 0) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: photo ? '1095px' : '345px', height: '237px' }}><p>{name} отсутствуют</p><p className="name-block-list">{name}</p></div>;

    const extractTextFromHTML = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc.body.innerText;
    };

    const snapToCard = () => {
        const wrapper = slideWrapperRef.current;
        const cardHeight = wrapper.scrollHeight / data.length;
        const currentScrollPosition = wrapper.scrollTop;

        // Вычисляем ближайшую карточку
        const newCurrentInfo = Math.round(currentScrollPosition / cardHeight);
        setcurrentInfo(newCurrentInfo);

        // Прокручиваем до ближайшей карточки
        wrapper.scrollTo({
            top: newCurrentInfo * cardHeight,
            behavior: 'smooth',
        });
    };

    const handleScroll = () => {
        // Откладываем выравнивание до завершения скролла
        clearTimeout(window.snapScrollTimeout);
        window.snapScrollTimeout = setTimeout(() => snapToCard(), 100); // 100 мс после завершения скролла
    };

    return (
        <div className={"block-slide " + className} style={{ width: photo ? '1095px' : '345px', height: '237px' }}>
            <div
                className="wrapper"
                ref={slideWrapperRef}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    flexDirection: 'column', // Для вертикального скролла
                    overflowY: 'auto', // Вертикальный скролл
                    scrollSnapType: 'y mandatory', // Скролл с "магнитом" по вертикали
                    height: photo ? '217px' : '',
                    width: photo ? '1037px' : '',
                    gap: '37px',
                }}
            >
                {data.map((item, index) => (
                    <Link to={`/${name === 'Новости' ? 'news' : 'events'}/${item.id}`} key={index}>
                        <div
                            className="content"
                            style={{
                                display: 'flex',
                                flexDirection: photo ? 'row' : 'column', // Изменение направления при наличии фото
                                flex: '0 0 auto',
                                height: photo ? '217px' : '217px', // Высота каждой карточки
                                scrollSnapAlign: 'start', // Притягивание к началу блока
                            }}
                        >
                            {photo && (
                                <div className="block-slide-img-container" style={{ flex: '1', marginRight: '20px' }}>
                                    <img src={item.image && item.image[0] ? item.image[0] : photo} alt="" />
                                </div>
                            )}
                            <div className="block-slide-text" style={{ flex: '2' }}>
                                <p className="datatime-slide">{photo ? item?.postData : item?.eventDate}</p>
                                <p className={`title-slide title-slide-${photo ? 'news' : 'events'}`} style={{ marginTop: item?.title ? '10px' : '0' }}>{item?.title}</p>
                                {photo && (
                                    <p className="description-slide" style={{ marginTop: item?.text ? '10px' : '0' }}>
                                        {item?.text ? extractTextFromHTML(item.text) : ''}
                                    </p>
                                )}
                                {!photo && (
                                    <>
                                        <div className="hashtage-slide" style={{ marginTop: item?.hashtage ? '10px' : '0', display: 'flex' }}>
                                            {item?.tags?.map((tag, index) => (
                                                <p key={index} className="tag">
                                                    #{tag}
                                                </p>
                                            ))}
                                        </div>
                                        <p className="event-type-slide" style={{ marginTop: item?.eventType ? '10px' : '0' }}>{item?.elementType}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <p className="name-block-list">{name}</p>
        </div>
    );
}

export default MainPageBlockSlide;
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

    if (loading) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '345px', height: '237px' }}><Loader /><p className="name-block-list">{name}</p></div>;
    if (error) return <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '345px', height: '237px' }}><p>{error}</p><p className="name-block-list">{name}</p></div>;

    const sortedData = data.length > 0 ? [...data].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)) : 
        [{
            id: 'no-events',
            title: 'Иногда отсутствие чего-то говорит о многом'
        }];

    const snapToCard = () => {
        const wrapper = slideWrapperRef.current;
        const cardHeight = wrapper.scrollHeight / sortedData.length;
        const currentScrollPosition = wrapper.scrollTop;
        const newCurrentInfo = Math.round(currentScrollPosition / cardHeight);
        setcurrentInfo(newCurrentInfo);
        const element = document.querySelector(`#event-item-${newCurrentInfo}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleScroll = () => {
        clearTimeout(window.snapScrollTimeout);
        window.snapScrollTimeout = setTimeout(() => snapToCard(), 100);
    };

    return (
        <div className={"block-slide " + className} style={{ width: '100%', height: '237px' }}>
            <div
                id="events-slide-wrapper"
                className="wrapper"
                ref={slideWrapperRef}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    scrollBehavior: 'smooth',
                    height: '217px',
                    width: '86%',
                    marginLeft: '2px',
                    gap: '37px',
                }}
            >
                {sortedData.map((item, index) => (
                    <div id={`event-item-${index}`} key={index}>
                        {item.id === 'no-events' ? (
                            <div className="content" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: '0 0 auto',
                                height: 'auto',
                                scrollSnapAlign: 'start',
                            }}>
                                <div className="block-slide-text" style={{ flex: '2', padding: '0 15px', overflowY: 'auto' }}>
                                    <p className="title-slide title-slide-events" style={{ marginTop: '10px' }}>{item.title}</p>
                                </div>
                            </div>
                        ) : (
                            <Link to={`/events/${item.id}`}>
                                <div
                                    className="content"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flex: '0 0 auto',
                                        height: 'auto',
                                        scrollSnapAlign: 'start',
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
                        )}
                    </div>
                ))}
            </div>
            <p className="name-block-list">{name}</p>
        </div>
    );
}

export default EventsBlockSlide;
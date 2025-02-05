import { useState, useEffect, useRef } from "react";
import '../styles/MainPageBlockSlide.css';
import Loader from "./Loader";
import { Link } from "react-router-dom";
import formatDate from '../utils/formatDate';
import defaultImage from '../images/News.png';

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

function NewsBlockSlide({ name, data, className = '' }) {
  const [currentInfo, setcurrentInfo] = useState(0);
  const slideWrapperRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  if (loading) return (
    <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '1095px', height: '237px' }}>
      <Loader />
      <p className="name-block-list">{name}</p>
    </div>
  );
  if (error) return (
    <div className={"block-slide " + className + ' block-slide-loader'} style={{ width: '1095px', height: '237px' }}>
      <p>{error}</p>
      <p className="name-block-list">{name}</p>
    </div>
  );

  // Функция для получения проксированного URL изображения
  const getImageUrl = (imageUrl) => {
    return `${serverUrl}/api/webdav/image?url=${encodeURIComponent(imageUrl)}`;
  };

  // Преобразуем данные
  const processedData = data.map(item => ({
    ...item,
    images: item.images || (item.image ? [item.image] : [defaultImage]),
    postData: item.postdata || item.postData || '',
    elementType: item.elementtype || item.elementType,
  }));

  // Фильтруем данные (если требуется)
  const filteredData = processedData.filter(item => item.elementType !== "Тех. новости");

  // Сортируем данные по дате публикации
  const sortedData = filteredData.sort((a, b) => new Date(b.postData) - new Date(a.postData));

  const snapToCard = () => {
    const wrapper = slideWrapperRef.current;
    const cardHeight = wrapper.scrollHeight / sortedData.length;
    const currentScrollPosition = wrapper.scrollTop;
    const newCurrentInfo = Math.round(currentScrollPosition / cardHeight);
    setcurrentInfo(newCurrentInfo);
    const element = document.querySelector(`#news-item-${newCurrentInfo}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScroll = () => {
    clearTimeout(window.snapScrollTimeout);
    window.snapScrollTimeout = setTimeout(() => snapToCard(), 100);
  };

  return (
    <div className={"block-slide " + className} style={{ width: '1095px', height: '237px' }}>
      <div
        id="news-slide-wrapper"
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
          width: '1037px',
          gap: '37px',
        }}
      >
        {sortedData.map((item, index) => (
          <div id={`news-item-${index}`} key={index}>
            {item.id === 'no-news' ? (
              <div className="content" style={{
                display: 'flex',
                flexDirection: 'row',
                flex: '0 0 auto',
                height: 'auto',
                scrollSnapAlign: 'start',
              }}>
                <div className="block-slide-img-container" style={{ flex: '1', marginRight: '20px' }}>
                  <img src={defaultImage} alt={item.title} className="block-slide-img" />
                </div>
                <div className="block-slide-text" style={{ flex: '2', padding: '0 15px', overflowY: 'auto' }}>
                  <p className="title-slide title-slide-news" style={{ marginTop: item.title ? '10px' : '0' }}>{item.title}</p>
                </div>
              </div>
            ) : (
              <Link to={`/news/${item.id}`}>
                <div className="content" style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flex: '0 0 auto',
                  height: 'auto',
                  scrollSnapAlign: 'start',
                }}>
                  <div className="block-slide-img-container" style={{ flex: '1', marginRight: '20px' }}>
                    <img
                      src={item.images[0] ? getImageUrl(item.images[0]) : defaultImage}
                      alt={item.title}
                      className="block-slide-img"
                      onError={(e) => { e.target.src = defaultImage; }}
                    />
                  </div>
                  <div className="block-slide-text" style={{ flex: '2', padding: '0 15px', overflowY: 'auto' }}>
                    <p className="datatime-slide">{formatDate(item.postData)}</p>
                    <p className="title-slide title-slide-news" style={{ marginTop: item.title ? '10px' : '0' }}>{item.title}</p>
                    <div
                      className="description-slide"
                      style={{ marginTop: item.text ? '10px' : '0', width: 'auto' }}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
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

export default NewsBlockSlide;
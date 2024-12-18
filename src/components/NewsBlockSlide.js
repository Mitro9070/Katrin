import { useState, useEffect } from "react";
import Loader from "./Loader";
import { Link } from "react-router-dom";
import formatDate from '../utils/formatDate';
import defaultImage from '../images/News.png';

function NewsBlockSlide({ name, data, className = '' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(false);  // Состояние для отслеживания наведения на блок

  useEffect(() => {
    setLoading(false);
  }, [data]);

  if (loading) return (
    <div
      className={`block-slide ${className} block-slide-loader`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        minHeight: '237px',
        border: '1px solid #A9A9A9',
        borderRadius: '20px',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Loader />
      <p
        className="name-block-list"
        style={{
          color: hovered ? '#0C8CE9' : '#A9A9A9',
          fontSize: '24px',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          position: 'absolute',
          top: '15px',
          left: '-2px'
        }}
      >
        {name}
      </p>
    </div>
  );
  if (error) return (
    <div
      className={`block-slide ${className} block-slide-loader`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        minHeight: '237px',
        border: '1px solid #A9A9A9',
        borderRadius: '20px',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p>{error}</p>
      <p
        className="name-block-list"
        style={{
          color: hovered ? '#0C8CE9' : '#A9A9A9',
          fontSize: '24px',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          position: 'absolute',
          top: '15px',
          left: '-2px'
        }}
      >
        {name}
      </p>
    </div>
  );

  const filteredData = data.filter(item => item.elementType !== "Тех. новости");

  const sortedData = filteredData.sort((a, b) => {
    if (a.id === 'no-news' || b.id === 'no-news') return 0;
    const dateA = new Date(a.postData);
    const dateB = new Date(b.postData);
    return dateB - dateA;
  });

  return (
    <div
      className={`block-slide ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        minHeight: '237px',
        border: hovered ? '1px solid #0C8CE9' : '1px solid #A9A9A9',
        borderRadius: '20px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="wrapper"
        style={{
            position: 'relative',
            overflowY: 'auto',
            maxHeight: '200px',
            width: '93%',
            marginLeft: '47px',
            scrollBehavior: 'smooth',
            padding: '15px'
        }}
      >
        {sortedData.map((item, index) => (
          <div key={index}>
            <Link to={`/news/${item.id}`}>
              <div
                className="content"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '12px',
                  flexDirection: 'row',
                  cursor: 'pointer'
                }}
              >
                <div
                  className="block-slide-img-container"
                  style={{
                    flex: '0 0 208px',
                    maxWidth: '208px',
                    maxHeight: '208px',
                    borderRadius: '20px',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={item.images && item.images[0] ? item.images[0] : defaultImage}
                    alt={item.title}
                    className="block-slide-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div
                  className="block-slide-text"
                  style={{ flex: 1, overflow: 'hidden' }}
                >
                  <p
                    className="datatime-slide"
                    style={{
                      color: '#2C2C2C',
                      fontFamily: '"PF DinText Pro"',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'normal'
                    }}
                  >
                    {formatDate(item.postData)}
                  </p>
                  <p
                    className="title-slide title-slide-news"
                    style={{
                      fontFamily: '"PF DinText Pro"',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      marginTop: '10px'
                    }}
                  >
                    {item.title}
                  </p>
                  <div
                    className="description-slide"
                    style={{
                      color: '#2C2C2C',
                      fontFamily: '"PF DinText Pro"',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      marginTop: '10px',
                      width: '100%',
                      display: '-webkit-box',
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                </div>
              </div>
            </Link>
            {index < sortedData.length - 1 && (
              <div
                className="event-separator"
                style={{
                  width: '100%',
                  height: '1px',
                  background: '#A9A9A9',
                  margin: '12px 0'
                }}
              ></div>
            )}
          </div>
        ))}
      </div>
      <p
        className="name-block-list"
        style={{
          color: hovered ? '#0C8CE9' : '#A9A9A9',
          fontSize: '24px',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          position: 'absolute',
          top: '15px',
          left: '-2px'
        }}
      >
        {name}
      </p>
    </div>
  );
}

export default NewsBlockSlide;
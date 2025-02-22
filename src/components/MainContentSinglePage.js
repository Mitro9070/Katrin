// src/components/MainContentSinglePage.js

import React, { useState } from 'react';
import formatDate from '../utils/formatDate';

import imgBackIcon from '../images/back.svg';
import imgGoArrowIcon from '../images/arrow-right.png';
import imgIconArrowIcon from '../images/arrow-left.png';
import imgEyeIcon from '../images/folder.svg';
import imgAttachIcon from '../images/attach.svg';
import placeholderImage from '../images/events.jpg';
import defaultImage from '../images/News.png';

function MainContentSinglePage({
    data,
    status,
    isEvent,
    isDevice = false,
    getImageUrl,
    organizerName,
    onBack = () => { },
}) {
    const [currentImage, setCurrentImage] = useState(0);

    const imageUrls = data.images && data.images.length > 0
        ? data.images.map((imageUrl) => getImageUrl(imageUrl))
        : [defaultImage];
    console.log('Images in data:', data.images);
    console.log('Image URLs for slider:', imageUrls);

    const fileUrls = data.files && data.files.length > 0
        ? data.files.map((fileUrl) => getImageUrl(fileUrl))
        : [];

    const prevImage = () => {
        setCurrentImage((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
    };

    const nextImage = () => {
        setCurrentImage((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
    };

    const formatEventPeriod = (startDate, endDate) => {
        const start = formatDate(startDate, true);
        const end = formatDate(endDate, true);
        return `с ${start} по ${end}`;
    };

    return (
        <>
            <div className="single-bid-page-head">
                <div className="icon-container" onClick={onBack}>
                    <img src={imgBackIcon} alt="Назад" />
                </div>
                <p className="single-bid-public-date">{formatDate(data.postdata)}</p>
                {isEvent && (
                    <div
                        className="event-color-line-2"
                        style={{ backgroundColor: data.elementtype === 'Внешнее событие' ? '#9B61F9' : '#80EA77' }}
                    ></div>
                )}
                <p className="single-bid-public-status"><i>{status ? status : data.elementtype}</i></p>
            </div>
            <div className="single-bid-page-content">
                <div className="single-bid-content-column-1">
                    {imageUrls.length > 0 && (
                        <>
                            <div className="single-bid-content-image-container">
                                <img
                                    src={imageUrls[currentImage]}
                                    alt="Событие"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = placeholderImage;
                                    }}
                                />
                            </div>
                            {imageUrls.length > 1 && (
                                <div className="single-bid-tags-carousel-container">
                                    <div className="single-bid-tags">
                                        {data.tags?.map((tag, index) => (
                                            <p key={index} className="tag">
                                                #{tag}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="single-bid-carousel">
                                        <div className="icon-container icon-rotate" onClick={prevImage}>
                                            <img src={imgIconArrowIcon} alt="Предыдущая" className='icon-rotate' />
                                        </div>
                                        <p className="single-bid-current-img">{currentImage + 1}/{imageUrls.length}</p>
                                        <div className="icon-container" onClick={nextImage}>
                                            <img src={imgGoArrowIcon} alt="Следующая" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="event-left-bottom-column">
                        <div className="event-left-bottom-row">
                            <p>Место</p>
                            <p>{data.place || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Формат</p>
                            <p>{data.elementtype || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Организатор мероприятия</p>
                            <p>{organizerName || data.organizer || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Телефон организатора</p>
                            <p>{data.organizer_phone || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Email организатора</p>
                            <p>{data.organizer_email || 'Нет данных'}</p>
                        </div>
                    </div>
                </div>
                <div className="single-bid-content-column-2">
                    <p className="single-bid-title">{data.title}</p>
                    {isEvent && data.start_date && data.end_date && (
                        <p className="event-period">
                            {formatEventPeriod(data.start_date, data.end_date)}
                        </p>
                    )}
                    <div
                        className="single-bid-text"
                        id="single-bid-text"
                        dangerouslySetInnerHTML={{ __html: data.text }}
                    />
                    {imageUrls.length === 0 && (
                        <div className="single-bid-tags">
                            {data.tags?.map((tag, index) => (
                                <p key={index} className="tag">
                                    #{tag}
                                </p>
                            ))}
                        </div>
                    )}
                    {fileUrls.length > 0 && (
                        <>
                            <p style={{ fontSize: '20px' }}>Файлы</p>
                            <div className="page-files-container custom-scrollbar">
                                {fileUrls.map((fileUrl, index) => (
                                    <div key={index} className='page-one-file'>
                                        <a
                                            href={fileUrl}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <div className="page-file-container">
                                                <img src={imgEyeIcon} alt="" />
                                            </div>
                                        </a>
                                        <p className='custom-fileselect-filename'>{fileUrl.split('/').pop()}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {data.links && data.links.length > 0 && (
                        <>
                            <p style={{ fontSize: '20px' }}>Ссылки</p>
                            <div className="page-links-container custom-scrollbar">
                                {data.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <div className="page-link-container">
                                            <p>{link}</p>
                                            <img src={imgAttachIcon} alt="" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default MainContentSinglePage;
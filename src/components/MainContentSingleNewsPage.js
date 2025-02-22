import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import imgBackIcon from '../images/back.svg';
import imgGoArrowIcon from '../images/arrow-right.png';
import imgIconArrowIcon from '../images/arrow-left.png';
import imgEyeIcon from '../images/folder.svg';
import imgAttachIcon from '../images/attach.svg';

import defaultImage from '../images/News.png';

function MainContentSingleNewsPage({ linkTo, onClick, data, getImageUrl }) {
    const [currentImage, setCurrentImage] = useState(0);

    const imageUrls = data.images && data.images.length > 0
        ? data.images.map((imageUrl) => getImageUrl(imageUrl))
        : [defaultImage];

    const fileUrls = data.files && data.files.length > 0
        ? data.files.map((fileUrl) => getImageUrl(fileUrl))
        : [];

    const prevImage = () => {
        if (currentImage > 0) {
            setCurrentImage(currentImage - 1);
        }
    };

    const nextImage = () => {
        if (currentImage < imageUrls.length - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    return (
        <>
            <div className="single-bid-page-head">
                <Link to={linkTo}>
                    <div className="icon-container" onClick={onClick}>
                        <img src={imgBackIcon} alt="Назад" />
                    </div>
                </Link>
                <p className="single-bid-public-date">{data.postdata}</p>
                <p className="single-bid-public-status"><i>{data.elementtype || 'Нет данных'}</i></p>
            </div>
            <div className="single-bid-page-content">
                <div className="single-bid-content-column-1">
                    {imageUrls.length > 0 && (
                        <>
                            <div className="single-bid-content-image-container">
                                <img src={imageUrls[currentImage]} alt="News" />
                            </div>
                            <div className="single-bid-tags-carousel-container">
                                <div className="single-bid-tags">
                                    {data.tags?.map((tag, index) => (
                                        <p key={index} className="tag">
                                            #{tag}
                                        </p>
                                    ))}
                                </div>
                                {imageUrls.length > 1 && (
                                    <div className="single-bid-carousel">
                                        <div className="icon-container icon-rotate" onClick={prevImage}>
                                            <img src={imgIconArrowIcon} alt="Предыдущая" className='icon-rotate' />
                                        </div>
                                        <p className="single-bid-current-img">{currentImage + 1}</p>
                                        <div className="icon-container" onClick={nextImage}>
                                            <img src={imgGoArrowIcon} alt="Следующая" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <div className="event-left-bottom-column">
                        <div className="event-left-bottom-row">
                            <p>Формат</p>
                            <p>{data.elementtype || 'Нет данных'}</p>
                        </div>
                    </div>
                </div>
                <div className="single-bid-content-column-2">
                    <p className="single-bid-title">{data.title}</p>
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

export default MainContentSingleNewsPage;
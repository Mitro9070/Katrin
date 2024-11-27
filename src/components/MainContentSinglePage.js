import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { get, ref as dbRef } from 'firebase/database';
import { storage, database } from '../firebaseConfig';
import formatDate from '../utils/formatDate';

import imgBackIcon from '../images/back.svg';
import imgGoArrowIcon from '../images/arrow-right.png';
import imgIconArrowIcon from '../images/arrow-left.png';
import imgEyeIcon from '../images/folder.svg';
import imgAttachIcon from '../images/attach.svg';

import photo from '../images/photo-news.png';
import imgDeviceM240T from '../images/М240Т.png';

function MainContentSinglePage({ linkTo, onClick, data, status, isEvent, isDevice = false }) {
    const [currentImage, setCurrentImage] = useState(0);
    const [imageUrls, setImageUrls] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);
    const [organizer, setOrganizer] = useState('Нет данных');

    useEffect(() => {
        const fetchImageUrls = async () => {
            if (data?.images) {
                const urls = await Promise.all(data.images.map(async (image) => {
                    const cachedImage = localStorage.getItem(image);
                    if (cachedImage) {
                        return cachedImage;
                    } else {
                        const fileRef = storageRef(storage, image);
                        const url = await getDownloadURL(fileRef);
                        localStorage.setItem(image, url);
                        return url;
                    }
                }));
                setImageUrls(urls);
            }
        };

        const fetchFileUrls = async () => {
            if (data?.files) {
                const urls = await Promise.all(data.files.map(async (file) => {
                    const cachedFile = localStorage.getItem(file);
                    if (cachedFile) {
                        return cachedFile;
                    } else {
                        const fileRef = storageRef(storage, file);
                        const url = await getDownloadURL(fileRef);
                        localStorage.setItem(file, url);
                        return url;
                    }
                }));
                setFileUrls(urls);
            }
        };

        const fetchOrganizer = async () => {
            if (data?.organizer) {
                if (typeof data.organizer === 'string' && data.organizer.trim() !== '') {
                    try {
                        const userRef = dbRef(database, `Users/${data.organizer}`);
                        const userSnapshot = await get(userRef);
                        if (userSnapshot.exists()) {
                            const userData = userSnapshot.val();
                            setOrganizer(`${userData.surname} ${userData.Name} ${userData.lastname}`);
                        } else {
                            setOrganizer(data.organizer);
                        }
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                        setOrganizer(data.organizer);
                    }
                } else {
                    setOrganizer(data.organizer);
                }
            } else {
                setOrganizer('Нет данных');
            }
        };

        fetchImageUrls();
        fetchFileUrls();
        fetchOrganizer();
    }, [data]);

    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
    };

    const nextImage = () => {
        if (currentImage < imageUrls.length - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    const formatEventPeriod = (startDate, endDate) => {
        const start = formatDate(startDate, true);
        const end = formatDate(endDate, true);
        return `с ${start} по ${end}`;
    };

    return (
        <>
            <div className="single-bid-page-head">
                <Link to={linkTo}>
                    <div className="icon-container" onClick={onClick}>
                        <img src={imgBackIcon} alt="" />
                    </div>
                </Link>
                <p className="single-bid-public-date">{data?.postData}</p>
                {isEvent && (
                    <div
                        className="event-color-line-2"
                        style={{ backgroundColor: data?.elementType === 'Внешнее событие' ? '#9B61F9' : '#80EA77' }}
                    ></div>
                )}
                <p className="single-bid-public-status"><i>{status ? status : data?.elementType}</i></p>
            </div>
            <div className="single-bid-page-content">
                <div className="single-bid-content-column-1">
                    {(imageUrls.length > 0 || isDevice) && (
                        <>
                            <div className="single-bid-content-image-container">
                                {!isDevice && (
                                    <img src={imageUrls[currentImage] || photo} alt="" />
                                )}
                                {isDevice && (
                                    <img src={imageUrls[currentImage] || imgDeviceM240T} alt="" />
                                )}
                            </div>
                            <div className="single-bid-tags-carousel-container">
                                <div className="single-bid-tags">
                                    {data?.tags?.map((tag, index) => (
                                        <p key={index} className="tag">
                                            #{tag}
                                        </p>
                                    ))}
                                </div>
                                <div className="single-bid-carousel">
                                    <div className="icon-container icon-rotate" onClick={prevImage}>
                                        <img src={imgIconArrowIcon} alt="" className='icon-rotate' />
                                    </div>
                                    <p className="single-bid-current-img">{imageUrls.length > 0 ? currentImage + 1 : '1'}</p>
                                    <div className="icon-container" onClick={nextImage}>
                                        <img src={imgGoArrowIcon} alt="" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="event-left-bottom-column">
                        <div className="event-left-bottom-row">
                            <p>Место</p>
                            <p>{data?.place || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Формат</p>
                            <p>{data?.elementType || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Организатор мероприятия</p>
                            <p>{organizer}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Телефон организатора</p>
                            <p>{data?.organizer_phone || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Email организатора</p>
                            <p>{data?.organizer_email || 'Нет данных'}</p>
                        </div>
                    </div>
                </div>
                <div className="single-bid-content-column-2">
                    <p className="single-bid-title">{data?.title}</p>
                    {isEvent && data?.start_date && data?.end_date && (
                        <p className="event-period">
                            {formatEventPeriod(data.start_date, data.end_date)}
                        </p>
                    )}
                    <div className="single-bid-text" id="single-bid-text" dangerouslySetInnerHTML={{ __html: data?.text }}></div>
                    {(!data?.eventType && imageUrls.length === 0 && !isDevice) && (
                        <div className="single-bid-tags">
                            {data?.tags?.map((tag, index) => (
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
                                {fileUrls.map((file, index) => (
                                    <div key={index} className='page-one-file'>
                                        <a
                                            href={file}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <div className="page-file-container">
                                                <img src={imgEyeIcon} alt="" />
                                            </div>
                                        </a>
                                        <p className='custom-fileselect-filename'>{file.split('/').pop()}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {data?.links?.[0] && (
                        <>
                            <p style={{ fontSize: '20px' }}>Ссылки</p>
                            <div className="page-links-container custom-scrollbar">
                                {data?.links.map((link, index) => (
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
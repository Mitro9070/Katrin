import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { get, ref as dbRef } from 'firebase/database';
import { storage, database } from '../firebaseConfig';

import imgBackIcon from '../images/back.svg';
import imgGoArrowIcon from '../images/arrow-right.png';
import imgIconArrowIcon from '../images/arrow-left.png';
import imgEyeIcon from '../images/folder.svg';
import imgAttachIcon from '../images/attach.svg';

// Импортируем изображение по умолчанию
import defaultImage from '../images/News.png'; 

function MainContentSingleNewsPage({ linkTo, onClick, data, status }) {
    const [currentImage, setCurrentImage] = useState(0);
    const [imageUrls, setImageUrls] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);
    const [creator, setCreator] = useState('Нет данных');
    const [newsData, setNewsData] = useState(null);

    useEffect(() => {
        const fetchNewsData = async () => {
            if (data?.id) {
                try {
                    const newsRef = dbRef(database, `News/${data.id}`);
                    const newsSnapshot = await get(newsRef);
                    if (newsSnapshot.exists()) {
                        const fetchedNewsData = newsSnapshot.val();
                        setNewsData(fetchedNewsData);
                        console.log("Fetched news data:", fetchedNewsData);
                    } else {
                        console.log("No news data found for id:", data.id);
                    }
                } catch (error) {
                    console.error("Error fetching news data:", error);
                }
            }
        };

        fetchNewsData();
    }, [data]);

    useEffect(() => {
        const fetchImageUrls = async () => {
            if (newsData?.images) {
                const urls = await Promise.all(newsData.images.map(async (image) => {
                    const cachedImage = localStorage.getItem(image);
                    if (cachedImage) {
                        return cachedImage;
                    } else {
                        const fileRef = storageRef(storage, image);
                        try {
                            const url = await getDownloadURL(fileRef);
                            localStorage.setItem(image, url);
                            return url;
                        } catch (error) {
                            console.error("Ошибка при получении URL:", error);
                            return null; // Если файл не найден, возвращаем null
                        }
                    }
                }));

                // Проверяем, если массив URL пуст, устанавливаем изображение по умолчанию
                if (urls.length === 0 || urls.every(url => url === null)) {
                    setImageUrls([defaultImage]); // Используем изображение по умолчанию
                } else {
                    setImageUrls(urls.filter(url => url !== null)); // Фильтруем только существующие URL
                }
            } else {
                setImageUrls([defaultImage]); // Используем изображение по умолчанию, если нет изображений
            }
        };

        const fetchFileUrls = async () => {
            if (newsData?.files) {
                const urls = await Promise.all(newsData.files.map(async (file) => {
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

        const fetchCreator = async () => {
            if (newsData?.organizer) {
                try {
                    const userRef = dbRef(database, `Users/${newsData.organizer}`);
                    const userSnapshot = await get(userRef);
                    
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        setCreator(`${userData.surname} ${userData.Name} ${userData.lastname}`);
                    } else {
                        setCreator('Пользователь не найден');
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setCreator('Ошибка при загрузке данных');
                }
            } else {
                setCreator('Нет данных');
            }
        };

        if (newsData) {
            fetchImageUrls();
            fetchFileUrls();
            fetchCreator();
        }
    }, [newsData]);

    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
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
                        <img src={imgBackIcon} alt="" />
                    </div>
                </Link>
                <p className="single-bid-public-date">{newsData?.postData}</p>
                <p className="single-bid-public-status"><i>{status || newsData?.elementType}</i></p>
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
                                    {newsData?.tags?.map((tag, index) => (
                                        <p key={index} className="tag">
                                            #{tag}
                                        </p>
                                    ))}
                                </div>
                                <div className="single-bid-carousel">
                                    <div className="icon-container icon-rotate" onClick={prevImage}>
                                        <img src={imgIconArrowIcon} alt="" className='icon-rotate' />
                                    </div>
                                    <p className="single-bid-current-img">{currentImage + 1}</p>
                                    <div className="icon-container" onClick={nextImage}>
                                        <img src={imgGoArrowIcon} alt="" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="event-left-bottom-column">
                        <div className="event-left-bottom-row">
                            <p>Формат</p>
                            <p>{newsData?.elementType || 'Нет данных'}</p>
                        </div>
                        <div className="event-left-bottom-row">
                            <p>Новость создал</p>
                            <p>{creator}</p>
                        </div>
                    </div>
                </div>
                <div className="single-bid-content-column-2">
                    <p className="single-bid-title">{newsData?.title}</p>
                    <div className="single-bid-text" id="single-bid-text" dangerouslySetInnerHTML={{ __html: newsData?.text }}></div>
                    {imageUrls.length === 0 && (
                        <div className="single-bid-tags">
                            {newsData?.tags?.map((tag, index) => (
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
                    {newsData?.links?.[0] && (
                        <>
                            <p style={{ fontSize: '20px' }}>Ссылки</p>
                            <div className="page-links-container custom-scrollbar">
                                {newsData.links.map((link, index) => (
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
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storage } from '../firebaseConfig';
import { ref as storageRef, getDownloadURL } from "firebase/storage";

import imgBackIcon from '../images/back.svg';
import imgGoArrowIcon from '../images/go-arrow.svg';
import imgEyeIcon from '../images/folder.svg';
import imgAttachIcon from '../images/attach.svg';

import imgDeviceM240T from '../images/М240Т.png';

function MainContentSinglePage({ linkTo, onClick, data, status, isEvent, isDevice = false }) {
    const [currentImage, setCurrentImage] = useState(0);
    const [imageUrls, setImageUrls] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);

    useEffect(() => {
        const fetchImageUrls = async () => {
            if (data?.image) {
                const urls = await Promise.all(data.image.map(async (image) => {
                    const cachedImage = localStorage.getItem(image);
                    if (cachedImage) {
                        return cachedImage;
                    } else {
                        const fileRef = storageRef(storage, `images/${image}`);
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
                        const fileRef = storageRef(storage, `files/${file}`);
                        const url = await getDownloadURL(fileRef);
                        localStorage.setItem(file, url);
                        return url;
                    }
                }));
                setFileUrls(urls);
            }
        };

        fetchImageUrls();
        fetchFileUrls();
    }, [data]);

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
                {(data?.eventType || imageUrls.length > 0 || isDevice) && (
                    <div className="single-bid-content-column-1">
                        <div className="single-bid-content-image-container">
                            {!isDevice && (
                                <img src={imageUrls[currentImage] || ''} alt="" />
                            )}
                            {isDevice && (
                                <img src={imgDeviceM240T} alt="" />
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
                                    <img src={imgGoArrowIcon} alt="" className='icon-rotate' />
                                </div>
                                <p className="single-bid-current-img">{imageUrls.length > 0 ? currentImage + 1 : '1'}</p>
                                <div className="icon-container" onClick={nextImage}>
                                    <img src={imgGoArrowIcon} alt="" />
                                </div>
                            </div>
                        </div>
                        {data?.eventType && (
                            <div className="event-left-bottom-column">
                                {data?.place && (
                                    <div className="event-left-bottom-row">
                                        <p>Место</p>
                                        <p>{data.place}</p>
                                    </div>
                                )}
                                {data?.elementType && (
                                    <div className="event-left-bottom-row">
                                        <p>Формат</p>
                                        <p>{data?.elementType}</p>
                                    </div>
                                )}
                                {data?.organizer && (
                                    <div className="event-left-bottom-row">
                                        <p>Организатор мероприятия</p>
                                        <p>{data?.organizer}</p>
                                    </div>
                                )}
                                <div className="event-left-bottom-row">
                                    <p>Ответственный менеджер</p>
                                    <p>Иванов Иван Иванович</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="single-bid-content-column-2">
                    <p className="single-bid-title">{data?.title}</p>
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
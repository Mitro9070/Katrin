import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { database, storage } from '../firebaseConfig';
import { ref, get, set } from 'firebase/database';

import '../styles/BidForm.css';

import imgBackIcon from '../images/back.svg';
import imgTrashIcon from '../images/trash.svg';
import imgCheckIcon from '../images/seal-check.svg';
import imgLocationIcon from '../images/location.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.svg';
import imgGoArrowIcon from '../images/go-arrow.svg';

import CustomInput from './CustomInput';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';
import Loader from './Loader'; // Импортируем компонент Loader

function EditBidForm({ maxPhotoCnt = 6 }) {
    const { typeForm, id } = useParams();  // Получаем id и typeForm из URL
    const location = useLocation();  // Хук для работы с URL
    const [bidData, setBidData] = useState(null);
    const [filesList, setFilesList] = useState([]);
    const [linksList, setLinksList] = useState([]);
    const [isAdsChecked, setIsAdsChecked] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [loading, setLoading] = useState(false); // Состояние для отслеживания загрузки
    const [photoLoading, setPhotoLoading] = useState(false); // Состояние для отслеживания загрузки фотографий
    const [currentImage, setCurrentImage] = useState(0);
    const [imageUrls, setImageUrls] = useState([]);

    // Получаем данные заявки по ID при загрузке формы
    useEffect(() => {
        const fetchBidData = async () => {
            const bidRef = ref(database, `${typeForm}/${id}`);
            const bidSnapshot = await get(bidRef);
            if (bidSnapshot.exists()) {
                const bid = bidSnapshot.val();
                setBidData(bid);
                setFilesList(bid?.files?.map((file, index) => <CustomFileSelect key={index} name='bid-file' defaultValue={file}/>));
                setLinksList(bid?.links?.map((link, index) => <CustomInput key={index} width='308px' placeholder='Ссылка' name='bid-link' defaultValue={link} />));
                setIsAdsChecked(bid.formats?.includes('Объявления'));
                setIsImportant(bid.fixed);

                const fetchImageUrls = async () => {
                    if (bid?.images) {
                        const urls = await Promise.all(bid.images.map(async (image) => {
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

                fetchImageUrls();
            }
        };

        fetchBidData();
    }, [id, typeForm]);

    const handleAdsCheckboxChange = (e) => {
        setIsAdsChecked(e.target.checked);
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, <CustomFileSelect key={filesList.length} name='bid-file' />]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, <CustomInput key={linksList.length} width='308px' placeholder='Ссылка' name='bid-link' />]);
    };

    const updateBidHandler = async () => {
        setLoading(true); // Начало загрузки
        let n_images = Array.from(document?.getElementsByName('bid-image'))?.map((e) => e?.files[0]);
        let n_files = Array.from(document?.getElementsByName('bid-file'))?.map((e) => e?.files[0]);
        let n_links = Array.from(document?.getElementsByName('bid-link'))?.map((e) => e?.value);
        let format;

        if (typeForm !== 'events') { // Для типа, который не является событием
            format = Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked'))?.map(cb => cb?.value);
        } else { // Для события
            format = [document.querySelector('input[type="radio"][name="bid-format"]:checked')?.value];
        }

        try {
            const newCoverImage = document?.getElementById('bid-cover')?.files[0] || bidData?.images[0];
            const updatedBidData = {
                title: document?.getElementById('bid-title')?.value,
                tags: document?.getElementById('bid-tags')?.value.split(', '),
                elementType: format,
                text: document?.getElementById('editor')?.innerHTML,
                place: document?.getElementById('bid-place')?.value,
                start_date: document?.getElementById('bid-start-date')?.value,
                end_date: document?.getElementById('bid-end-date')?.value,
                organizer: document?.getElementById('bid-organizer')?.value,
                organizer_phone: document?.getElementById('organizer-phone')?.value,
                organizer_email: document?.getElementById('organizer-email')?.value,
                status: "В процессе",
                images: [newCoverImage, ...n_images],
                files: n_files,
                links: n_links,
                display_up_to: document?.getElementById('display_up_to')?.value,
                fixed: isImportant,
            };

            const bidRef = ref(database, `${typeForm}/${id}`);
            await set(bidRef, updatedBidData);

            window.location.href = "/bid";  // Перенаправляем на страницу "/bid" после успешного обновления
        } catch (error) {
            console.error("Ошибка при редактировании заявки:", error);
        } finally {
            setLoading(false); // Остановка загрузки
        }
    };

    const handlePhotoUpload = async (e) => {
        setPhotoLoading(true); // Начало загрузки фотографий
        // Логика загрузки фотографий
        setPhotoLoading(false); // Остановка загрузки фотографий
    };

    const prevImage = () => {
        currentImage > 0 && setCurrentImage(currentImage - 1);
    };

    const nextImage = () => {
        if (currentImage < imageUrls.length - 1) {
            setCurrentImage(currentImage + 1);
        }
    };

    if (!bidData) return <p>Загрузка...</p>;

    return (
        <div className="bid-form-container noselect page-content">
            {loading && <Loader />} {/* Спиннер загрузки */}
            <div className="bid-form-head">
                <Link to="/bid"> {/* Кнопка назад */}
                    <div className="icon-container">
                        <img src={imgBackIcon} alt="" className="bid-form-btn-back" />
                    </div>
                </Link>
                <p className="bid-form-datetime">{new Date(bidData.postData).toLocaleString()}</p>
                <div className="icon-container bid-form-btn-delete">
                    <img src={imgTrashIcon} alt="" />
                </div>
            </div>
            <div className="bid-form-body">
                <CustomInput width='100%' placeholder='Название' id='bid-title' defaultValue={bidData.title} />
                <div className="bid-form-body-oneline">
                    <CustomInput width='50%' placeholder='Теги' img={imgCheckIcon} id='bid-tags' defaultValue={bidData?.tags?.join(', ')} />
                    <div className="bid-form-format-container">
                        {typeForm !== 'events' && (
                            <>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" value="Объявления" defaultChecked={bidData?.elementType?.[0].split(',')?.includes('Объявления')} onChange={handleAdsCheckboxChange} />
                                    <p><img src={imgCheckmark} alt="" />Объявления</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-device" value="Устройства и ПО" defaultChecked={bidData?.elementType?.[0].split(',')?.includes('Устройства и ПО')}/>
                                    <p><img src={imgCheckmark} alt="" />Устройства и ПО</p>
                                </label>   
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-events" value="Мероприятия" defaultChecked={bidData?.elementType?.[0].split(',')?.includes('Мероприятия')}/>
                                    <p><img src={imgCheckmark} alt="" />Мероприятия</p>
                                </label>
                            </>
                        )}
                        {typeForm === 'events' && (
                            <>
                                <label className='bid-form-format-element'>
                                    <input type="radio" name="bid-format" value="Внешнее событие" defaultChecked={bidData?.elementType?.includes('Внешнее событие')} />
                                    <p><img src={imgCheckmark} alt="" />Внешнее событие</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="radio" name="bid-format" value="Внутреннее событие" defaultChecked={bidData?.elementType?.includes('Внутреннее событие')} />
                                    <p><img src={imgCheckmark} alt="" />Внутреннее событие</p>
                                </label>
                            </>
                        )}
                    </div>
                </div>
                {isAdsChecked && (
                    <div className='bid-form-body-oneline'>
                        <p>Дата</p>
                        <CustomInput width='217px' placeholder='Дата объявления' type='datetime-local' id='display_up_to' defaultValue={bidData?.display_up_to} />
                        <label className="bid-form-format-element">
                            <input type="checkbox" name="important" checked={isImportant} defaultChecked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                            <p><img src={imgCheckmark} alt="" />Закрепить объявление</p>
                        </label>
                    </div>
                )}
                {typeForm === 'events' && (
                    <div className="bid-form-body-oneline bid-form-body-oneline-2">
                        <CustomInput width='calc(50% - 15px)' placeholder='Место' img={imgLocationIcon} id='bid-place' defaultValue={bidData?.place} />
                        <p className='bid-form-text-date'>Дата</p>
                        <CustomInput width='217px' placeholder='Дата начала' type='datetime-local' id='bid-start-date' defaultValue={bidData?.start_date} />
                        <p>до</p>
                        <CustomInput width='217px' placeholder='Дата окончания' type='datetime-local' id='bid-end-date' defaultValue={bidData?.end_date} />
                    </div>
                )}
                <div className="single-bid-content-column-1">
                    <div className="single-bid-content-image-container">
                        <img src={imageUrls[currentImage]} alt="" />
                    </div>
                    <div className="single-bid-tags-carousel-container">
                        <div className="single-bid-tags">
                            {bidData?.tags?.map((tag, index) => (
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
                </div>
                <CKEditorRedaktor className='ckeditor' data={bidData.text}/>
                <p className='title-bid-form'>Файлы</p>
                <div className='files-row'>
                    {filesList}
                    <img src={imgAddIcon} alt="" className='add-filefield' onClick={addFileFieldHandler} />
                </div>
                <p className='title-бид-form'>Ссылки</p>
                <div className='links-row'>
                    {linksList}
                    <img src={imgAddIcon} alt="" className='add-linkfield' onClick={addLinkFieldHandler} />
                </div>
                <div className='bid-form-send-btn' onClick={updateBidHandler}>
                    <p>Обновить заявку</p>
                </div>
            </div>
        </div>
    );
}

export default EditBidForm;
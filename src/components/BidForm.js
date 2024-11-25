import React, { useState } from 'react';
import { database, storage } from '../firebaseConfig';
import { ref as databaseRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../styles/BidForm.css';

import imgBackIcon from '../images/back.svg';
import imgLocationIcon from '../images/location.svg';
import imgArrowIcon from '../images/go-arrow.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.svg';

import CustomInput from './CustomInput';
import CustomPhotoBox from './CustomPhotoBox';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';

import { navigationStore } from '../stores/NavigationStore';

function BidForm({ setIsAddPage, typeForm, maxPhotoCnt = 6 }) {
    let datetime = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    const [componentsCarousel, setComponentsCarousel] = useState([]);
    const [filesList, setFilesList] = useState([<CustomFileSelect name='bid-file' />]);
    const [linksList, setLinksList] = useState([<CustomInput width='308px' placeholder='Ссылка' name='bid-link' />]);
    const [isAdsChecked, setIsAdsChecked] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [loading, setLoading] = useState(false);

    const [CarouselPosition, setCarouselPosition] = useState(0);

    const changeAddPageHandler = () => {
        setIsAddPage && setIsAddPage(() => false);
    };

    const carouselMoveHandler = (direction) => {
        let position = CarouselPosition - ((195 + 2 + 30) * direction);
        if (position <= 0 && position >= (195 + 2 + 30) * -(maxPhotoCnt - 3)) {
            setCarouselPosition(() => position);
            direction > 0 && componentsCarousel.length < (maxPhotoCnt - 4) &&
                setComponentsCarousel([...componentsCarousel, <CustomPhotoBox name='bid-image' />]);
        }
    };

    const handleAdsCheckboxChange = (e) => {
        setIsAdsChecked(e.target.checked);
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, <CustomFileSelect name='bid-file' />]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, <CustomInput width='308px' placeholder='Ссылка' name='bid-link' />]);
    };

    const addBidHandler = async () => {
        setLoading(true);
        console.log("Начало процесса добавления новости");
    
        let selectedFormats = Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked')).map(cb => cb?.value);
        console.log("Выбранные форматы:", selectedFormats);
    
        if (selectedFormats.length === 0) {
            toast.error("Пожалуйста, выберите хотя бы один формат.");
            setLoading(false);
            return;
        }
    
        try {
            const newBidKey = uuidv4();
            console.log("Сгенерирован новый ключ:", newBidKey);
    
            const uploadFiles = async (files, folder) => {
                const urls = [];
                for (const file of files) {
                    if (file) {
                        const fileRef = storageRef(storage, `${folder}/${newBidKey}/${file.name}`);
                        await uploadBytes(fileRef, file);
                        const url = await getDownloadURL(fileRef);
                        urls.push(url);
                    }
                }
                return urls;
            };
    
            let n_images = Array.from(document?.getElementsByName('bid-image')).map((e) => e?.files[0]).filter(Boolean);
            let n_files = Array.from(document?.getElementsByName('bid-file')).map((e) => e?.files[0]).filter(Boolean);
            let n_links = Array.from(document?.getElementsByName('bid-link'))
                .map((e) => e?.value)
                .filter((value) => value !== "");
    
            const photosUrls = await uploadFiles([document?.getElementById('bid-cover')?.files[0], ...n_images], 'images');
            const filesUrls = await uploadFiles(n_files, 'files');
            console.log("Файлы загружены. Фото:", photosUrls, "Файлы:", filesUrls);
    
            for (let format of selectedFormats) {
                console.log("Обработка формата:", format);
    
                const newBidData = {
                    title: document?.getElementById('bid-title')?.value || '',
                    tags: document?.getElementById('bid-tags')?.value.split(', ') || [],
                    elementType: format,
                    text: navigationStore.currentBidText || '',
                    place: document?.getElementById('bid-place')?.value || '',
                    start_date: document?.getElementById('bid-start-date')?.value || '',
                    end_date: document?.getElementById('bid-end-date')?.value || '',
                    organizer: document?.getElementById('bid-organizer')?.value || '',
                    organizer_phone: document?.getElementById('organizer-phone')?.value || '',
                    organizer_email: document?.getElementById('organizer-email')?.value || '',
                    status: "На модерации",
                    images: photosUrls || [],
                    files: filesUrls || [],
                    links: n_links || [],
                    display_up_to: document?.getElementById('display_up_to')?.value || '',
                    fixed: isImportant,
                    postData: new Date().toLocaleString('ru-RU')
                };
    
                let databasePath;
                switch (format) {
                    case 'Объявления':
                        databasePath = 'News';
                        break;
                    case 'Устройства и ПО':
                        databasePath = 'Devices';
                        break;
                    case 'Мероприятия':
                        databasePath = 'Events';
                        break;
                    default:
                        throw new Error('Неизвестный формат');
                }
    
                console.log("Сохранение в базу данных. Путь:", databasePath);
                const newBidRef = databaseRef(database, `${databasePath}/${newBidKey}`);
                await set(newBidRef, newBidData);
                console.log("Запись успешно сохранена в", databasePath);
            }
    
            setLoading(false);
            toast.success('Новость/Событие успешно добавлено!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setTimeout(() => {
                changeAddPageHandler();
                window.location.reload();
            }, 3000);
        } catch (error) {
            console.error("Ошибка при добавлении заявки:", error);
            setLoading(false);
            toast.error('Произошла ошибка при добавлении. Пожалуйста, попробуйте еще раз.');
        }
    };  

    return (
        <div className="bid-form-container noselect">
            <div className="bid-form-head">
                <div className="icon-container" onClick={changeAddPageHandler}>
                    <img src={imgBackIcon} alt="" className="bid-form-btn-back" />
                </div>
                <p className="bid-form-datetime">{datetime}</p>
            </div>
            <div className="bid-form-body">
                <CustomInput width='100%' placeholder='Название' id='bid-title' />
                <div className="bid-form-body-oneline">
                    <CustomInput width='50%' placeholder='Теги'  id='bid-tags' />
                    <div className="bid-form-format-container">
                        {typeForm !== 'Events' && (
                            <>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-ads" value="Объявления" onChange={handleAdsCheckboxChange} />
                                    <p><img src={imgCheckmark} alt="" />Объявления</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-device" value="Устройства и ПО" />
                                    <p><img src={imgCheckmark} alt="" />Устройства и ПО</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-events" value="Мероприятия" />
                                    <p><img src={imgCheckmark} alt="" />Мероприятия</p>
                                </label>
                            </>
                        )}
                        {typeForm === 'Events' && (
                            <>
                                <label className='bid-form-format-element'>
                                    <input type="radio" name="bid-format" id="bid-format-ads" value="Внешнее событие" />
                                    <p><img src={imgCheckmark} alt="" />Внешнее событие</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="radio" name="bid-format" id="bid-format-device" value="Внутреннее событие" />
                                    <p><img src={imgCheckmark} alt="" />Внутреннее событие</p>
                                </label>
                            </>
                        )}
                    </div>
                </div>
                {isAdsChecked && (
                    <div className='bid-form-body-oneline'>
                        <p>Дата</p>
                        <CustomInput width='217px' placeholder='Дата объявления' type='date' id='display_up_to' />
                        <label className="bid-form-format-element" >
                            <input type="checkbox"  name="important" onChange={(e) => setIsImportant(e.target.checked)} />
                            <p style={{ marginLeft:'100px' }}><img src={imgCheckmark} alt="" />Закрепить объявление</p>
                        </label>
                    </div>
                )}
                {typeForm === 'Events' && (
                    <div className="bid-form-body-oneline bid-form-body-oneline-2">
                        <CustomInput width='calc(25% - 15px)' placeholder='Место' img={imgLocationIcon} id='bid-place' />
                        <p className='bid-form-text-date'>Дата</p>
                        <CustomInput width='217px' placeholder='Дата начала' type='date' id='bid-start-date' />
                        <p className='bid-form-text-date'>до</p>
                        <CustomInput  width='217px' placeholder='Дата окончания' type='date' id='bid-end-date' />
                    </div>
                )}
                <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                    <div className="bid-form-cover">
                        <p>Обложка</p>
                        <CustomPhotoBox id='bid-cover' />
                    </div>
                    <div className={`icon-container ${CarouselPosition >= 0 ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(-1)}>
                        <img src={imgArrowIcon} alt="" style={{ transform: 'rotate(180deg)' }} className={`${CarouselPosition >= 0 ? 'non-active-img' : ''}`} />
                    </div>
                    <div className="bid-form-photoes">
                        <p>Другие фотографии</p>
                        <div className="wrapper-bid-form">
                            <div className="bid-form-photoes-carousel">
                                <div id="bid-carousel" className="bid-form-photoes-carousel-wrapper" style={{ transform: `translateX(${CarouselPosition}px)` }}>
                                    <CustomPhotoBox name='bid-image' />
                                    <CustomPhotoBox name='bid-image' />
                                    <CustomPhotoBox name='bid-image' />
                                    <CustomPhotoBox name='bid-image' />
                                    {componentsCarousel.map((component) => component)}
                                </div>
                            </div>
                            <div className={`icon-container ${CarouselPosition <= 227 * -(maxPhotoCnt - 3) ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(1)}>
                                <img src={imgArrowIcon} alt="" className={`${CarouselPosition <= 227 * -(maxPhotoCnt - 3) ? 'non-active-img' : ''}`} />
                            </div>
                        </div>
                    </div>
                </div>
                <CKEditorRedaktor />
                {typeForm === 'Events' && (
                    <div className="bid-form-body-oneline">
                        <CustomInput width='420px' placeholder='Организатор мероприятия' type='text' id='bid-organizer' />
                        <CustomInput width='308px' placeholder='Телефон' type='phone' id='organizer-phone' />
                        <CustomInput width='307px' placeholder='Почта' type='email' id='organizer-email' />
                    </div>
                )}
                <p className='title-bid-form'>Файлы</p>
                <div className="files-row">
                    {filesList.map((file) => file)}
                    <img src={imgAddIcon} alt="" className="add-filefield" onClick={addFileFieldHandler} />
                </div>
                <p className='title-bid-form'>Ссылки</p>
                <div className="links-row">
                    {linksList.map((link) => link)}
                    <img src={imgAddIcon} alt="" className="add-linkfield" onClick={addLinkFieldHandler} />
                </div>
                <div className="bid-form-send-btn" onClick={addBidHandler}>
                    {loading ? <p>Загрузка...</p> : <p>Предложить {typeForm !== 'Events' ? 'новость' : 'событие'}</p>}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default BidForm;
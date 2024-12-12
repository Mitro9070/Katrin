import React, { useState } from 'react';
import { database, storage } from '../firebaseConfig';
import { ref as databaseRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import InputMask from 'react-input-mask';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '../styles/BidForm.css';

import imgBackIcon from '../images/back.svg';
import imgLocationIcon from '../images/location.svg';
import imgArrowIcon from '../images/go-arrow.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.svg';

import CustomInput from './CustomInput';
import CustomPhotoBox from './CustomPhotoBox2';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';

import { navigationStore } from '../stores/NavigationStore';

function BidForm({ setIsAddPage, typeForm, maxPhotoCnt = 6 }) {
    let datetime = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    const [componentsCarousel, setComponentsCarousel] = useState([]);
    const [filesList, setFilesList] = useState([<CustomFileSelect name='bid-file' key={uuidv4()} />]);
    const [linksList, setLinksList] = useState([<CustomInput width='308px' placeholder='Ссылка' name='bid-link' key={uuidv4()} />]);

    const [isAdsChecked, setIsAdsChecked] = useState(false);
    const [isDeviceChecked, setIsDeviceChecked] = useState(false);
    const [isEventChecked, setIsEventChecked] = useState(false);

    const [isImportant, setIsImportant] = useState(false);
    const [loading, setLoading] = useState(false);
    const [CarouselPosition, setCarouselPosition] = useState(0);
    const [coverImageURL, setCoverImageURL] = useState('');
    const [imageURLs, setImageURLs] = useState([]);
    const [email, setEmail] = useState(''); // Начальное значение




    const addImageURL = (url) => {
        setImageURLs((prevURLs) => [...prevURLs, url]);
    };

    const changeAddPageHandler = () => {
        setIsAddPage && setIsAddPage(() => false);
    };

    const carouselMoveHandler = (direction) => {
        let position = CarouselPosition - ((195 + 2 + 30) * direction);
        if (position <= 0 && position >= (195 + 2 + 30) * -(maxPhotoCnt - 3)) {
            setCarouselPosition(() => position);
            direction > 0 && componentsCarousel.length < (maxPhotoCnt - 4) &&
                setComponentsCarousel([...componentsCarousel, <CustomPhotoBox name='bid-image' key={uuidv4()} />]);
        }
    };

    const handleAdsCheckboxChange = (e) => {
        setIsAdsChecked(e.target.checked);
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, <CustomFileSelect name='bid-file' key={uuidv4()} />]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, <CustomInput width='308px' placeholder='Ссылка' name='bid-link' key={uuidv4()} />]);
    };

    const getUserIdFromCookie = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; userId=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const handleEmailChange = (e) => {
        let { value } = e.target;

        // Удаляем недопустимые символы (например, русские буквы)
        value = value.replace(/[^\w@._-]/g, ''); // позволяет латинские буквы, цифры, знаки @, ., _ и -

        setEmail(value); // Устанавливаем текущее значение e-mail

    };

    const addBidHandler = async () => {
        setLoading(true);
        try {
            const newBidKey = uuidv4();
            const userId = getUserIdFromCookie();

            console.log("Сгенерирован новый ключ:", newBidKey);

            const uploadFiles = async (files, folder) => {
                const urls = [];
                for (const file of files) {
                    if (file) {
                        const fileRef = storageRef(storage, `${folder}/${file.name}`);
                        await uploadBytes(fileRef, file);
                        const url = await getDownloadURL(fileRef);
                        urls.push(url);
                    }
                }
                return urls;
            };

            // Проверка обязательных полей (название и формат)
            const title = document.getElementById('bid-title').value;
            if (!title) {
                toast.error("Укажите название новости.");
                setLoading(false);
                return;
            }

            // Валидация электронной почты
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                alert('Пожалуйста, введите корректный адрес электронной почты.');
                setLoading(false);
                return;
            }

            let selectedFormats = [];
            if (typeForm === 'TechNews') {
                selectedFormats = ['Тех. новости']; // Автоматически устанавливаем для TechNews
            } else if (typeForm === 'Events') {
                selectedFormats = Array.from(document.querySelectorAll('input[type="radio"][name="bid-format"]:checked')).map(rb => rb?.value);
                if (!selectedFormats.length) {
                    toast.error("Выберите тип События.");
                    setLoading(false);
                    return;
                }
            } else {
                selectedFormats = Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked')).map(cb => cb?.value);
                if (!selectedFormats.length) {
                    toast.error("Выберите тип Новости.");
                    setLoading(false);
                    return;
                }
            }
            // Собираем файлы

            let n_files = Array.from(document?.getElementsByName('bid-file')).map((e) => e?.files[0]).filter(Boolean);
            let n_links = Array.from(document?.getElementsByName('bid-link')).map((e) => e?.value).filter((value) => value !== "");

            // Загрузка изображений и файлов
            const photosUrls = [coverImageURL, ...imageURLs];
            const filesUrls = await uploadFiles(n_files, `files/${newBidKey}`);
            console.log("Файлы загружены. Фото:", photosUrls, "Файлы:", filesUrls);

            // Если не выбран формат, установить формат по умолчанию для `TechNews`.
            if (typeForm === 'TechNews' && selectedFormats.length === 0) {
                selectedFormats = ['Тех. новости'];
            }

            for (let format of selectedFormats) {
                console.log("Обработка формата:", format);

                if (typeForm === 'Events') {
                    const startDate = document.getElementById('bid-start-date').value;
                    const endDate = document.getElementById('bid-end-date').value;

                    if (!startDate || !endDate) {
                        toast.error("Укажите период События.");
                        setLoading(false);
                        return;
                    }

                    // Преобразуем формат даты
                    const formatDate = (date) => {
                        return date.replace(/\..*$/, "");
                    };

                    const organizer = document.getElementById('bid-organizer').value || userId;

                    const newBidData = {
                        title: title || '',
                        tags: document?.getElementById('bid-tags')?.value.split(', ') || [],
                        elementType: format,
                        text: navigationStore.currentBidText || '',
                        place: document?.getElementById('bid-place')?.value || '',
                        start_date: formatDate(startDate),
                        end_date: formatDate(endDate),
                        organizer,
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
                            databasePath = 'News';
                            break;
                        case 'Мероприятия':
                            databasePath = 'News';
                            break;
                        case 'Внешнее событие':
                        case 'Внутреннее событие':
                            databasePath = 'Events';
                            break;
                        case 'Тех. новости':
                            databasePath = 'News';
                            break;
                        default:
                            throw new Error('Неизвестный формат');
                    }

                    console.log("Сохранение в базу данных. Путь:", databasePath);
                    const newBidRef = databaseRef(database, `${databasePath}/${newBidKey}`);
                    await set(newBidRef, newBidData);
                    console.log("Запись успешно сохранена в", databasePath);
                } else {
                    // Случай, когда это новость
                    const newBidData = {
                        title: title || '',
                        tags: document?.getElementById('bid-tags')?.value.split(', ') || [],
                        elementType: format,
                        text: navigationStore.currentBidText || '',
                        organizer: userId,
                        status: typeForm === 'TechNews' ? "Одобрено" : "На модерации",
                        images: photosUrls || [],
                        files: filesUrls || [],
                        links: n_links || [],
                        display_up_to: document?.getElementById('display_up_to')?.value || '', // Получаем значение из поля display_up_to
                        fixed: isImportant,
                        postData: new Date().toLocaleString('ru-RU')
                    };

                    let databasePath;
                    switch (format) {
                        case 'Объявления':
                            databasePath = 'News';
                            break;
                        case 'Устройства и ПО':
                            databasePath = 'News';
                            break;
                        case 'Мероприятия':
                            databasePath = 'News';
                            break;
                        case 'Тех. новости':
                            databasePath = 'News';
                            break;
                        default:
                            throw new Error('Неизвестный формат');
                    }

                    console.log("Сохранение в базу данных. Путь:", databasePath);
                    const newBidRef = databaseRef(database, `${databasePath}/${newBidKey}`);
                    await set(newBidRef, newBidData);
                    console.log("Запись успешно сохранена в", databasePath);
                }
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
                    <CustomInput width='50%' placeholder='Теги' id='bid-tags' />
                    {typeForm !== 'TechNews' && typeForm !== 'Events' && (
                        <div className="bid-form-format-container">
                            <>
                                <label className='bid-form-format-element'>
                                    <input
                                        type="checkbox"
                                        name="bid-format"
                                        id="bid-format-ads"
                                        value="Объявления"
                                        checked={isAdsChecked}
                                        onChange={() => {
                                            setIsAdsChecked(true); // Устанавливаем выбранный элемент
                                            setIsDeviceChecked(false); // Снимаем выбор с других элементов
                                            setIsEventChecked(false);
                                        }}
                                    />
                                    <p><img src={imgCheckmark} alt="" />Объявления</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input
                                        type="checkbox"
                                        name="bid-format"
                                        id="bid-format-device"
                                        value="Устройства и ПО"
                                        checked={isDeviceChecked}
                                        onChange={() => {
                                            setIsAdsChecked(false); // Снимаем выбор с других элементов
                                            setIsDeviceChecked(true); // Устанавливаем выбранный элемент
                                            setIsEventChecked(false);
                                        }}
                                    />
                                    <p><img src={imgCheckmark} alt="" />Устройства и ПО</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input
                                        type="checkbox"
                                        name="bid-format"
                                        id="bid-format-events"
                                        value="Мероприятия"
                                        checked={isEventChecked}
                                        onChange={() => {
                                            setIsAdsChecked(false); // Снимаем выбор с других элементов
                                            setIsDeviceChecked(false);
                                            setIsEventChecked(true); // Устанавливаем выбранный элемент
                                        }}
                                    />
                                    <p><img src={imgCheckmark} alt="" />Мероприятия</p>
                                </label>
                            </>
                        </div>
                    )}
                    {typeForm === 'Events' && (
                        <div className="bid-form-format-container">
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
                        </div>
                    )}
                </div>
                {isAdsChecked && (
                    <div className='bid-form-body-oneline'>
                        <input
                            type='datetime-local'
                            id='display_up_to'
                            className="custom-input"
                            onChange={(e) => setIsImportant(e.target.checked)}
                            style={{ width: '308px' }}
                        />
                        <label className="bid-form-format-element" >
                            <input type="checkbox" name="important" onChange={(e) => setIsImportant(e.target.checked)} />
                            <p style={{ marginLeft: '30px' }}><img src={imgCheckmark} alt="" />Закрепить объявление</p>
                        </label>
                    </div>
                )}
                {typeForm === 'Events' && (
                    <div className="bid-form-body-oneline bid-form-body-oneline-2">
                        <CustomInput width='calc(25% - 15px)' placeholder='Место' img={imgLocationIcon} id='bid-place' />
                        <p className='bid-form-text-date'>Дата</p>
                        <input
                            type='datetime-local'
                            id='bid-start-date'
                            className="custom-input"
                            style={{ width: '217px' }}
                        />
                        <p className='bid-form-text-date'>до</p>
                        <input
                            type='datetime-local'
                            id='bid-end-date'
                            className="custom-input"
                            style={{ width: '217px' }}
                        />
                    </div>
                )}
                <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                    <div className="bid-form-cover">
                        <p>Обложка</p>
                        <CustomPhotoBox name='bid-image' id='bid-cover' onImageUpload={(url) => setCoverImageURL(url)} />
                    </div>
                    <div className={`icon-container ${CarouselPosition >= 0 ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(-1)}>
                        <img src={imgArrowIcon} alt="" style={{ transform: 'rotate(180deg)' }} className={`${CarouselPosition >= 0 ? 'non-active-img' : ''}`} />
                    </div>
                    <div className="bid-form-photoes">
                        <p>Другие фотографии</p>
                        <div className="wrapper-bid-form">
                            <div className="bid-form-photoes-carousel">
                                <div id="bid-carousel" className="bid-form-photoes-carousel-wrapper" style={{ transform: `translateX(${CarouselPosition}px)` }}>
                                    <CustomPhotoBox name='bid-image' onImageUpload={(url) => addImageURL(url)} />
                                    <CustomPhotoBox name='bid-image' onImageUpload={(url) => addImageURL(url)} />
                                    <CustomPhotoBox name='bid-image' onImageUpload={(url) => addImageURL(url)} />
                                    <CustomPhotoBox name='bid-image' onImageUpload={(url) => addImageURL(url)} />
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

                        <InputMask
                            mask="+7(999)999-99-99"
                            id='organizer-phone'
                            className="custom-input"
                            placeholder='Телефон'

                            style={{ width: '308px' }}
                        />
                        <input
                            type='email'
                            id='organizer-email'
                            className="custom-input"
                            placeholder='Почта'
                            value={email}
                            onChange={handleEmailChange}
                            style={{ width: '308px' }}
                        />
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
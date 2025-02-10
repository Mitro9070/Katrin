// src/components/BidForm.js

import React, { useState } from 'react';
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
import CustomPhotoBox from './CustomPhotoBox'; // Обновим этот компонент
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';

import { navigationStore } from '../stores/NavigationStore';

import { addNews } from '../Controller/NewsController';
import { addEvent } from '../Controller/EventsController';

function BidForm({ setIsAddPage, typeForm, maxPhotoCnt = 6 }) {
    let datetime = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    const [componentsCarousel, setComponentsCarousel] = useState([]);
    const [filesList, setFilesList] = useState([uuidv4()]);
    const [linksList, setLinksList] = useState([uuidv4()]);

    const [isAdsChecked, setIsAdsChecked] = useState(false);
    const [isDeviceChecked, setIsDeviceChecked] = useState(false);
    const [isEventChecked, setIsEventChecked] = useState(false);

    const [isImportant, setIsImportant] = useState(false);
    const [loading, setLoading] = useState(false);
    const [CarouselPosition, setCarouselPosition] = useState(0);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [email, setEmail] = useState('');

    const addImageFile = (file, index) => {
        setImageFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles[index] = file;
            return updatedFiles;
        });
    };

    const handleCoverImageSelect = (file) => {
        setCoverImageFile(file);
    };

    const changeAddPageHandler = () => {
        setIsAddPage && setIsAddPage(() => false);
    };

    const carouselMoveHandler = (direction) => {
        let position = CarouselPosition - ((195 + 2 + 30) * direction);
        if (position <= 0 && position >= (195 + 2 + 30) * -(maxPhotoCnt - 3)) {
            setCarouselPosition(() => position);
            if (direction > 0 && componentsCarousel.length < (maxPhotoCnt - 4)) {
                setComponentsCarousel([...componentsCarousel, componentsCarousel.length]);
            }
        }
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, uuidv4()]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, uuidv4()]);
    };

    const getUserIdFromCookie = () => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; userId=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const handleEmailChange = (e) => {
        let { value } = e.target;
        value = value.replace(/[^\w@._-]/g, '');
        setEmail(value);
    };

    const addBidHandler = async () => {
        setLoading(true);
        try {
            const userId = getUserIdFromCookie();
            const title = document.getElementById('bid-title').value;
            if (!title) {
                toast.error("Укажите название новости.");
                setLoading(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                toast.error('Пожалуйста, введите корректный адрес электронной почты.');
                setLoading(false);
                return;
            }

            let selectedFormats = [];
            if (typeForm === 'TechNews') {
                selectedFormats = ['Тех. новости'];
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

            let n_files = Array.from(document?.getElementsByName('bid-file')).map((e) => e?.files[0]).filter(Boolean);
            let n_links = Array.from(document?.getElementsByName('bid-link')).map((e) => e?.value).filter((value) => value !== "");

            const currentDate = new Date();
            const oneYearLater = new Date();
            oneYearLater.setFullYear(currentDate.getFullYear() + 1);

            const startDateInput = document.getElementById('bid-start-date')?.value;
            const endDateInput = document.getElementById('bid-end-date')?.value;
            const displayUpToInput = document.getElementById('display_up_to')?.value;

            const validateDate = (dateStr, fieldName) => {
                if (dateStr) {
                    const date = new Date(dateStr);
                    if (date < currentDate || date > oneYearLater) {
                        alert(`Дата в поле "${fieldName}" должна быть в пределах от текущей даты до одного года вперёд.`);
                        setLoading(false);
                        return false;
                    }
                }
                return true;
            };

            if (!validateDate(startDateInput, 'Дата начала') ||
                !validateDate(endDateInput, 'Дата окончания') ||
                !validateDate(displayUpToInput, 'Отображать до')) {
                return;
            }

            for (let format of selectedFormats) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('text', navigationStore.currentBidText || '');
                const tagsInput = document?.getElementById('bid-tags')?.value || '';
                const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                formData.append('tags', JSON.stringify(tagsArray));
                formData.append('owner', userId);
                formData.append('status', typeForm === 'TechNews' ? "Одобрено" : "На модерации");
                formData.append('elementtype', format);

                const allImageFiles = [];
                if (coverImageFile) {
                    allImageFiles.push(coverImageFile);
                }
                imageFiles.forEach(file => {
                    if (file) {
                        allImageFiles.push(file);
                    }
                });

                allImageFiles.forEach(file => {
                    formData.append('images', file);
                });

                if (n_files && n_files.length > 0) {
                    n_files.forEach(file => {
                        formData.append('files', file);
                    });
                }

                if (n_links && n_links.length > 0) {
                    formData.append('links', JSON.stringify(n_links));
                }

                if (isAdsChecked) {
                    formData.append('display_up_to', displayUpToInput || '');
                    formData.append('fixed', isImportant ? 'true' : 'false');
                }

                if (typeForm === 'Events') {
                    const startDate = startDateInput;
                    const endDate = endDateInput;
                    if (!startDate || !endDate) {
                        toast.error("Укажите период События.");
                        setLoading(false);
                        return;
                    }

                    formData.append('start_date', startDate);
                    formData.append('end_date', endDate);

                    const organizer = document.getElementById('bid-organizer').value || userId;
                    const organizer_phone = document?.getElementById('organizer-phone')?.value || '';
                    const organizer_email = document?.getElementById('organizer-email')?.value || email || '';
                    formData.append('organizer', organizer);
                    formData.append('organizer_phone', organizer_phone);
                    formData.append('organizer_email', organizer_email);
                    formData.append('place', document?.getElementById('bid-place')?.value || '');
                }

                formData.append('postdata', new Date().toISOString());

                if (typeForm === 'Events') {
                    await addEvent(formData);
                } else {
                    await addNews(formData);
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
                                            setIsAdsChecked(true);
                                            setIsDeviceChecked(false);
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
                                            setIsAdsChecked(false);
                                            setIsDeviceChecked(true);
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
                                            setIsAdsChecked(false);
                                            setIsDeviceChecked(false);
                                            setIsEventChecked(true);
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
                                    <input type="radio" name="bid-format" id="bid-format-external" value="Внешнее событие" />
                                    <p><img src={imgCheckmark} alt="" />Внешнее событие</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="radio" name="bid-format" id="bid-format-internal" value="Внутреннее событие" />
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
                                    style={{ width: '308px' }}
                                />
                                <label className="bid-form-format-element" >
                                    <input type="checkbox" name="important" onChange={(e) => setIsImportant(e.target.checked)} />
                                    <p style={{ marginLeft: '30px' }}><img src={imgCheckmark} alt="" />Закрепить объявление</p>
                                </label>
                            </div>
                        )}

                        {typeForm === 'Events' && (
                            <>
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
                            </>
                        )}

                        {/* Загрузка изображений */}
                        <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                            <div className="bid-form-cover">
                                <p>Обложка</p>
                                <CustomPhotoBox
                                    name='bid-image-cover'
                                    id='bid-cover'
                                    onFileSelect={handleCoverImageSelect}
                                />
                            </div>
                            <div className={`icon-container ${CarouselPosition >= 0 ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(-1)}>
                                <img src={imgArrowIcon} alt="" style={{ transform: 'rotate(180deg)' }} className={`${CarouselPosition >= 0 ? 'non-active-img' : ''}`} />
                            </div>
                            <div className="bid-form-photoes">
                                <p>Другие фотографии</p>
                                <div className="wrapper-bid-form">
                                    <div className="bid-form-photoes-carousel">
                                        <div id="bid-carousel" className="bid-form-photoes-carousel-wrapper" style={{ transform: `translateX(${CarouselPosition}px)` }}>
                                            {componentsCarousel.map((index) => (
                                                <CustomPhotoBox
                                                    key={index}
                                                    name={`bid-image-${index}`}
                                                    onFileSelect={(file) => addImageFile(file, index)}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`icon-container ${CarouselPosition <= 227 * -(maxPhotoCnt - 3) ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(1)}>
                                        <img src={imgArrowIcon} alt="" className={`${CarouselPosition <= 227 * -(maxPhotoCnt - 3) ? 'non-active-img' : ''}`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Текстовое содержание */}
                        <CKEditorRedaktor />

                        {/* Файлы */}
                        <p className='title-bid-form'>Файлы</p>
                        <div className="files-row">
                            {filesList.map((id) => (
                                <CustomFileSelect key={id} name='bid-file' />
                            ))}
                            <img src={imgAddIcon} alt="" className="add-filefield" onClick={addFileFieldHandler} />
                        </div>

                        {/* Ссылки */}
                        <p className='title-bid-form'>Ссылки</p>
                        <div className="links-row">
                            {linksList.map((id) => (
                                <CustomInput key={id} width='308px' placeholder='Ссылка' name='bid-link' />
                            ))}
                            <img src={imgAddIcon} alt="" className="add-linkfield" onClick={addLinkFieldHandler} />
                        </div>

                        {/* Кнопка отправки */}
                        <div className="bid-form-send-btn" onClick={addBidHandler}>
                            {loading ? <p>Загрузка...</p> : <p>Предложить {typeForm !== 'Events' ? 'новость' : 'событие'}</p>}
                        </div>
                    </div>
                    <ToastContainer />
                </div>
            );
        }

        export default BidForm;
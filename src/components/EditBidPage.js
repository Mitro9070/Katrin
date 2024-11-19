import React, { useEffect, useState } from 'react';
import '../styles/BidForm.css';

import imgBackIcon from '../images/back.svg';
import imgCheckIcon from '../images/seal-check.svg';
import imgLocationIcon from '../images/location.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.png';
import imgCalendarIcon from '../images/calendar.svg';
import imgArrowIcon from '../images/go-arrow.svg';

import CustomInput from './CustomInput';
import CustomPhotoBox from './CustomPhotoBox';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';
import Loader from './Loader';

import { newsContentStore } from '../stores/NewsContentStore';
import { navigationStore } from '../stores/NavigationStore';
import { eventsStore } from '../stores/EventsStore';

import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Импортируем uuid для генерации уникальных идентификаторов

const storage = getStorage();

function EditBidForm({ typeForm, id, setIsEditPage = null }) {
    const [bidData, setBidData] = useState({});
    const [componentsCarousel, setComponentsCarousel] = useState([]);
    const [filesList, setFilesList] = useState([]);
    const [linksList, setLinksList] = useState([]);
    const [isAdsChecked, setIsAdsChecked] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [CarouselPosition, setCarouselPosition] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const maxPhotoCnt = 6;

    useEffect(() => {
        const fetchBidData = async () => {
            setLoading(true);
            setError(null);
            let bid;

            try {
                if (typeForm === 'News' || typeForm === 'TechNews') {
                    await newsContentStore.fetchData();
                    bid = newsContentStore.getNewsById(id);
                } else if (typeForm === 'Events') {
                    await eventsStore.fetchData();
                    bid = eventsStore.getEventById(id);
                }

                if (!bid) {
                    throw new Error('Заявка не найдена');
                }

                console.log("Initial bidData.title:", bid?.title);

                navigationStore.setCurrentBidText(bid.text || '');

                setBidData(bid);
                setFilesList(
                    bid?.files?.map((file, index) => (
                        <CustomFileSelect key={index} name="bid-file" defaultValue={file} />
                    ))
                );

                setLinksList(
                    bid?.links?.map((link, index) => (
                        <CustomInput key={index} width="308px" placeholder="Ссылка" name="bid-link" defaultValue={link} />
                    ))
                );

                setIsAdsChecked(bid?.elementType?.includes('Объявления'));
                setIsImportant(bid?.fixed);

                setComponentsCarousel(
                    bid?.images?.slice(1).map((image, index) => (
                        <CustomPhotoBox key={index} width="380px" name="bid-image" defaultValue={image} />
                    ))
                );
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBidData();
    }, [id, typeForm]);

    const handleBackClick = () => {
        if (typeof setIsEditPage === 'function') {
            setIsEditPage(false);
        } else {
            console.warn('setIsEditPage не является функцией, перенаправление на /content');
            window.location.href = '/content';
        }
    };

    const handleAdsCheckboxChange = (e) => {
        setIsAdsChecked(e.target.checked);
    };

    const carouselMoveHandler = (direction) => {
        let position = CarouselPosition - ((195 + 2 + 30) * direction);
        if (position <= 0 && position >= (195 + 2 + 30) * -(maxPhotoCnt - 3)) {
            setCarouselPosition(position);
            if (direction > 0 && componentsCarousel.length < (maxPhotoCnt - 4)) {
                setComponentsCarousel([
                    ...componentsCarousel,
                    <CustomPhotoBox key={componentsCarousel.length} width="380px" name="bid-image" defaultValue="" />
                ]);
            }
        }
    };

    const addFileFieldHandler = () => {
        setFilesList([
            ...filesList,
            <CustomFileSelect key={filesList.length} name="bid-file" />
        ]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([
            ...linksList,
            <CustomInput key={linksList.length} width="308px" placeholder="Ссылка" name="bid-link" />
        ]);
    };

    const handlePhotoUpload = async (files, folder, newBidKey) => {
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

    const updateBidHandler = async () => {
        setLoading(true);

        console.log("Before save bidData.title:", bidData?.title);

        const n_images = Array.from(document.getElementsByName('bid-image')).map((e) => e.files[0]).filter(Boolean);
        const n_files = Array.from(document.getElementsByName('bid-file')).map((e) => e.files[0]).filter(Boolean);
        const n_links = Array.from(document.getElementsByName('bid-link')).map((e) => e.value).filter((value) => value !== "");

        const format = typeForm === 'Events'
            ? [document.querySelector('input[type="radio"][name="bid-format"]:checked')?.value]
            : Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked')).map(cb => cb.value);

        if (format.length === 0 || (typeForm === 'Events' && !format[0])) {
            alert("Пожалуйста, выберите корректный формат.");
            setLoading(false);
            return;
        }

        try {
            const newBidKey = bidData?.id || uuidv4();
            const newCoverImage = document.getElementById('bid-cover')?.files[0] || bidData?.images?.[0];

            const photosUrls = n_images.length > 0 ? await handlePhotoUpload([newCoverImage, ...n_images], 'images', newBidKey) : bidData.images || [];
            const filesUrls = n_files.length > 0 ? await handlePhotoUpload(n_files, 'files', newBidKey) : bidData.files || [];

            const updatedBidData = {
                title: bidData.title || '',
                tags: bidData.tags || [],
                elementType: format[0],
                text: navigationStore.currentBidText || bidData.text || '',
                place: bidData.place || '',
                start_date: bidData.start_date || '',
                end_date: bidData.end_date || '',
                organizer: bidData.organizer || '',
                organizer_phone: bidData.organizer_phone || '',
                organizer_email: bidData.organizer_email || '',
                status: bidData.status || 'На модерации',
                images: photosUrls.filter(Boolean),
                files: filesUrls.filter(Boolean),
                links: n_links.length > 0 ? n_links : bidData.links || [],
                display_up_to: isAdsChecked ? (document.getElementById('display_up_to')?.value || bidData.display_up_to || '') : '',
                fixed: isImportant,
                postData: new Date().toLocaleString('ru-RU'),
            };

            console.log("Updated bidData for save:", updatedBidData);

            if (typeForm === 'News' || typeForm === 'TechNews') {
                await newsContentStore.updateNews(bidData.id, updatedBidData);
            } else if (typeForm === 'Events') {
                await eventsStore.updateEvent(bidData.id, updatedBidData);
            }

            setLoading(false);
            alert('Заявка успешно обновлена!');
            if (typeof setIsEditPage === 'function') {
                setIsEditPage(false);
            } else {
                window.location.href = '/content';
            }
        } catch (error) {
            console.error('Ошибка при редактировании заявки:', error);
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="bid-form-container noselect">
            <div className="bid-form-head">
                <div className="icon-container" onClick={handleBackClick}>
                    <img src={imgBackIcon} alt="Назад" className="bid-form-btn-back" />
                </div>
                <p className="bid-form-datetime">
                    {bidData?.postData}
                </p>
            </div>
            <div className="bid-form-body">
                <input
                    type="text"
                    id="bid-title"
                    placeholder="Название"
                    value={bidData?.title || ''}
                    onChange={(e) => {
                        console.log("On change bidData.title:", e.target.value);
                        setBidData({ ...bidData, title: e.target.value });
                    }}
                    style={{ width: '100%' }}
                />
                <div className="bid-form-body-oneline">
                    <input
                        type="text"
                        id="bid-tags"
                        placeholder="Теги"
                        value={bidData?.tags ? bidData.tags.join(', ') : ''}
                        onChange={(e) => setBidData({ ...bidData, tags: e.target.value.split(', ') })}
                        style={{ width: '50%' }}
                    />
                    <div className="bid-form-format-container">
                        {typeForm !== 'TechNews' && (
                            <>
                                <label className="bid-form-format-element">
                                    <input
                                        type="checkbox"
                                        name="bid-format"
                                        value="Объявления"
                                        defaultChecked={bidData?.elementType?.includes('Объявления')}
                                        onChange={handleAdsCheckboxChange}
                                    />
                                    <p>
                                        <img src={imgCheckmark} alt="" />
                                        Объявления
                                    </p>
                                </label>
                                <label className="bid-form-format-element">
                                    <input
                                        type="checkbox"
                                        name="bid-format"
                                        id="bid-format-device"
                                        value="Устройства и ПО"
                                        defaultChecked={bidData?.elementType?.includes('Устройства и ПО')}
                                    />
                                    <p>
                                        <img src={imgCheckmark} alt="" />
                                        Устройства и ПО
                                    </p>
                                </label>
                                <label className="bid-form-format-element">
                                    <input
                                        type="checkbox"
                                        name="bid-format"
                                        id="bid-format-events"
                                        value="Мероприятия"
                                        defaultChecked={bidData?.elementType?.includes('Мероприятия')}
                                    />
                                    <p>
                                        <img src={imgCheckmark} alt="" />
                                        Мероприятия
                                    </p>
                                </label>
                            </>
                        )}
                        {typeForm === 'TechNews' && (
                            <>
                                <label className="bid-form-format-element">
                                    <input
                                        type="radio"
                                        name="bid-format"
                                        value="Тех. новости"
                                        defaultChecked={true}
                                    />
                                    <p hidden={true}>Тех. новости</p>
                                </label>
                            </>
                        )}
                        {typeForm === 'Events' && (
                            <>
                                <label className="bid-form-format-element">
                                    <input
                                        type="radio"
                                        name="bid-format"
                                        value="Внешнее событие"
                                        defaultChecked={bidData?.elementType?.includes('Внешнее событие')}
                                    />
                                    <p>
                                        <img src={imgCheckmark} alt="" />
                                        Внешнее событие
                                    </p>
                                </label>
                                <label className="bid-form-format-element">
                                    <input
                                        type="radio"
                                        name="bid-format"
                                        value="Внутреннее событие"
                                        defaultChecked={bidData?.elementType?.includes('Внутреннее событие')}
                                    />
                                    <p>
                                        <img src={imgCheckmark} alt="" />
                                        Внутреннее событие
                                    </p>
                                </label>
                            </>
                        )}
                    </div>
                </div>
                {isAdsChecked && (
                    <div className='bid-form-body-oneline'>
                        <p>Дата</p>
                        <input
                            type='datetime-local'
                            id='display_up_to'
                            value={bidData?.display_up_to || ''}
                            onChange={(e) => setBidData({ ...bidData, display_up_to: e.target.value })}
                            style={{ width: '217px' }}
                        />
                        <label className="bid-form-format-element" style={{ marginLeft: '60px' }}>
                            <input
                                type="checkbox"
                                name="important"
                                checked={isImportant}
                                onChange={(e) => setIsImportant(e.target.checked)}
                            />
                            <p style={{ display: 'inline-block' }}>
                                <img src={imgCheckmark} alt="" />
                                Закрепить объявление
                            </p>
                        </label>
                    </div>
                )}
                {typeForm === 'Events' && (
                    <>
                        <div className="bid-form-body-oneline bid-form-body-oneline-2">
                            <input
                                type='text'
                                id='bid-place'
                                placeholder='Место'
                                value={bidData?.place || ''}
                                onChange={(e) => setBidData({ ...bidData, place: e.target.value })}
                                style={{ width: 'calc(35% - 15px)' }}
                            />
                            <p className='bid-form-text-date'>Дата</p>
                            <input
                                type='datetime-local'
                                id='bid-start-date'
                                placeholder='Дата начала'
                                value={bidData?.start_date || ''}
                                onChange={(e) => setBidData({ ...bidData, start_date: e.target.value })}
                                style={{ width: '120px' }}
                            />
                            <p style={{ marginLeft: '180px' }}>до</p>
                            <input
                                type='datetime-local'
                                id='bid-end-date'
                                placeholder='Дата окончания'
                                value={bidData?.end_date || ''}
                                onChange={(e) => setBidData({ ...bidData, end_date: e.target.value })}
                                style={{ width: '120px' }}
                            />
                        </div>
                        <div className="bid-form-body-oneline">
                            <input
                                type='text'
                                id='bid-organizer'
                                placeholder='Организатор мероприятия'
                                value={bidData?.organizer || ''}
                                onChange={(e) => setBidData({ ...bidData, organizer: e.target.value })}
                                style={{ width: '420px' }}
                            />
                            <input
                                type='phone'
                                id='organizer-phone'
                                placeholder='Телефон'
                                value={bidData?.organizer_phone || ''}
                                onChange={(e) => setBidData({ ...bidData, organizer_phone: e.target.value })}
                                style={{ width: '308px' }}
                            />
                            <input
                                type='email'
                                id='organizer-email'
                                placeholder='Почта'
                                value={bidData?.organizer_email || ''}
                                onChange={(e) => setBidData({ ...bidData, organizer_email: e.target.value })}
                                style={{ width: '307px' }}
                            />
                        </div>
                    </>
                )}
                <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                    <div className="bid-form-cover">
                        <p>Обложка</p>
                        <CustomPhotoBox
                            id='bid-cover'
                            defaultValue={bidData?.images?.[0]}
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
                <CKEditorRedaktor className='ckeditor' data={bidData?.text} />
                <p className='title-бид-form'>Файлы</p>
                <div className="files-row">
                    {filesList}
                    <img
                        src={imgAddIcon}
                        alt=""
                        className="add-filefield"
                        onClick={addFileFieldHandler}
                    />
                </div>
                <p className='title-бид-form'>Ссылки</p>
                <div className="links-row">
                    {linksList}
                    <img
                        src={imgAddIcon}
                        alt=""
                        className="add-linkfield"
                        onClick={addLinkFieldHandler}
                    />
                </div>
                <div className='bid-form-send-btn' onClick={updateBidHandler}>
                    {loading ? <p>Загрузка...</p> : <p>Обновить заявку</p>}
                </div>
            </div>
        </div>
    );
}
export default EditBidForm;
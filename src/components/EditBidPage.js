import React, { useEffect, useState } from 'react';
import '../styles/BidForm.css';
import '../styles/CustomInput.css'; 

import { database } from '../firebaseConfig';
import { ref, get } from 'firebase/database';

import imgBackIcon from '../images/back.svg';
import imgCheckIcon from '../images/seal-check.svg';
import imgLocationIcon from '../images/location.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.png';
import imgCalendarIcon from '../images/calendar.svg';
import imgArrowIcon from '../images/go-arrow.svg';
import imgTrashDelete from '../images/trash-delete.png';

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
    const [organizerName, setOrganizerName] = useState('');
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
    
                    console.log("Fetched bid for TechNews:", bid);
    
                    if (typeForm === 'TechNews' && bid) {
                        setBidData({
                            ...bid,
                            display_up_to: bid.display_up_to || ''
                        });
                    }
                } else if (typeForm === 'Events') {
                    await eventsStore.fetchData();
                    bid = eventsStore.getEventById(id);
                }
    
                if (!bid) {
                    throw new Error('Заявка не найдена');
                }
    
                navigationStore.setCurrentBidText(bid.text || '');
    
                if (bid.display_up_to) {
                    // Форматируем значение даты в нужный формат 'YYYY-MM-DDTHH:mm'
                    const formattedDisplayUpTo = new Date(bid.display_up_to).toISOString().slice(0, 16);
                    console.log("Formatted display_up_to:", formattedDisplayUpTo);
    
                    setBidData({
                        ...bid,
                        display_up_to: formattedDisplayUpTo 
                    });
                } else {
                    setBidData({
                        ...bid,
                        display_up_to: ''
                    });
                }

                if (bid.start_date) {
                    bid.start_date = new Date(bid.start_date).toISOString().slice(0, 16);
                }

                if (bid.end_date) {
                    bid.end_date = new Date(bid.end_date).toISOString().slice(0, 16);
                }
    
                setFilesList(
                    Array.isArray(bid?.files) ? 
                    bid?.files?.map((file, index) => (
                        <CustomFileSelect key={index} name="bid-file" defaultValue={file} />
                    )) : []
                );
    
                setLinksList(
                    Array.isArray(bid?.links) ? 
                    bid?.links?.map((link, index) => (
                        <CustomInput key={index} width="308px" placeholder="Ссылка" name="bid-link" defaultValue={link} />
                    )) : []
                );
    
                setIsAdsChecked(bid?.elementType?.includes('Объявления'));
                setIsImportant(bid?.fixed);
    
                const carouselImages = (bid?.images?.slice(1) || []).map((image, index) => (
                    <CustomPhotoBox key={index} width="380px" name="bid-image" defaultValue={image} onChange={() => setComponentsCarousel(prevState => {
                        const newState = [...prevState];
                        newState[index] = <CustomPhotoBox key={index} width="380px" name="bid-image" defaultValue={image} onChange={() => handlePhotoChange(index)} />;
                        return newState;
                    })} />
                ));
    
                setComponentsCarousel(carouselImages);
    
                if (bid.organizer) {
                    const name = await fetchOrganizerName(bid.organizer);
                    setOrganizerName(name);
                }
    
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchBidData();
    }, [id, typeForm]);

    const fetchOrganizerName = async (organizerId) => {
        try {
            const userRef = ref(database, `Users/${organizerId}`);
            const snapshot = await get(userRef);
    
            if (snapshot.exists()) {
                const userData = snapshot.val();
                return `${userData.surname} ${userData.Name}`;
            } else {
                console.error('Пользователь не найден');
                return '';
            }
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return '';
        }
    };

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
                    <CustomPhotoBox key={componentsCarousel.length} width="380px" name="bid-image" onChange={() => handlePhotoChange(componentsCarousel.length)} />
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

    const addPhotoFieldHandler = () => {
        setComponentsCarousel([
            ...componentsCarousel,
            <CustomPhotoBox key={componentsCarousel.length} width="380px" name="bid-image" onChange={() => handlePhotoChange(componentsCarousel.length)} />
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

    const handlePhotoChange = (index) => {
        setComponentsCarousel(prevState => {
            const newState = [...prevState];
            const photoElement = newState[index];
            const inputFile = photoElement?.props?.defaultValue;
            if (inputFile) {
                newState[index] = <CustomPhotoBox key={index} width="380px" name="bid-image" defaultValue={inputFile} onChange={() => handlePhotoChange(index)} />;
            }
            return newState;
        });
    }

    // Функция для обработки удаления фото
    const handlePhotoDelete = (index) => {
        setComponentsCarousel(prevState => {
            const newState = [...prevState];
            newState[index] = null; // Помечаем фото как удаленное
            return newState;
        });
    };

    const handleCoverPhotoUpload = async (coverImage, newBidKey) => {
        const fileRef = storageRef(storage, `images/${newBidKey}/${coverImage.name}`);
        await uploadBytes(fileRef, coverImage);
        const url = await getDownloadURL(fileRef);
        return url;
    };

    // Функция для подачи в handlePhotoUpload отдельно для каждого фото.
    const handleSinglePhotoUpload = async (file, folder, newBidKey) => {
        const fileRef = storageRef(storage, `${folder}/${newBidKey}/${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    };

    const addNewPhotoFields = async (files, folder, currentImages, newBidKey) => {
        const uploadedUrls = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file) {
                const url = await handleSinglePhotoUpload(file, folder, newBidKey);
                uploadedUrls.push(url);
            } else {
                // Если файла нет, берем соответствующее изображение из текущих данных
                uploadedUrls.push(currentImages[i]);
            }
        }

        return uploadedUrls;
    };

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const updateBidHandler = async () => {
        setLoading(true);
    
        console.log("Before save bidData.title:", bidData?.title);
    
        // Получаем id пользователя из cookies
        const userId = getCookie('userId');  
    
        let n_files = Array.from(document?.getElementsByName('bid-file')).map((e) => e?.files[0]).filter(Boolean);
        let n_links = Array.from(document?.getElementsByName('bid-link')).map((e) => e?.value).filter((value) => value !== "");
    
        const currentImages = bidData.images || [];
        const otherImages = Array.from(document?.getElementsByName('bid-image')).map((e) => e?.files[0]);
    
        // Проверка форматов для разных типов форм.
        let format = typeForm === 'Events'
            ? [document.querySelector('input[type="radio"][name="bid-format"]:checked')?.value]
            : Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked')).map(cb => cb.value);
    
        // Если формат не выбран, устанавливаем "Тех. новости" по умолчанию для `TechNews`.
        if (typeForm === 'TechNews' && format.length === 0) {
            format = ['Тех. новости'];
        }
    
        if (format.length === 0 || (typeForm === 'Events' && !format[0])) {
            alert("Пожалуйста, выберите корректный формат.");
            setLoading(false);
            return;
        }
    
        try {
            const newBidKey = bidData?.id || uuidv4();
            const newCoverImage = document.getElementById('bid-cover')?.files[0];
            const coverImageURL = newCoverImage ? await handleCoverPhotoUpload(newCoverImage, newBidKey) : bidData?.images?.[0];
    
            // Фильтруем удаленные фотографии
            const currentImagesFiltered = currentImages.slice(1).filter((img, index) => componentsCarousel[index] !== null);
            const otherPhotosUrls = await addNewPhotoFields(
                otherImages,
                'images',
                currentImagesFiltered,
                newBidKey
            );
    
            const filesUrls = n_files.length > 0 ? await handlePhotoUpload(n_files, 'files', newBidKey) : bidData.files || [];
    
            // Если organizer не введен вручную, используем id из cookies
            const organizer = bidData.organizer || userId;
    
            const updatedBidData = {
                title: bidData.title || '',
                tags: bidData.tags || [],
                elementType: format[0],
                text: navigationStore.currentBidText || bidData.text || '',
                place: bidData.place || '',
                start_date: bidData.start_date || '',
                end_date: bidData.end_date || '',
                organizer: organizer,
                organizer_phone: bidData.organizer_phone || '',
                organizer_email: bidData.organizer_email || '',
                status: bidData.status || 'На модерации',
                images: [coverImageURL, ...otherPhotosUrls].filter(Boolean),
                files: filesUrls.filter(Boolean),
                links: n_links.length > 0 ? n_links : bidData.links || [],
                display_up_to: isAdsChecked ? (document.getElementById('display_up_to')?.value || bidData.display_up_to || '') : (bidData.display_up_to || ''),
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
                    className="custom-input"
                    placeholder="Название"
                    value={bidData?.title || ''}
                    onChange={(e) => {
                        console.log("On change bidData.title:", e.target.value);
                        setBidData({ ...bidData, title: e.target.value });
                    }}
                    style={{ width: '308px' }}
                />
                <div className="bid-form-body-oneline">
               
                    <input
                        type="text"
                        id="bid-tags"
                        className="custom-input"
                        placeholder="Теги"
                        value={bidData?.tags ? bidData.tags.join(', ') : ''}
                        onChange={(e) => setBidData({ ...bidData, tags: e.target.value.split(', ') })}
                        style={{ width: '308px' }}
                    />
                    <div className="bid-form-format-container">
                        {typeForm !== 'TechNews' && typeForm !== 'Events' &&(
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
                       
                        <input
                            type='datetime-local'
                            id='display_up_to'
                            className="custom-input"
                            value={bidData?.display_up_to || ''}
                            onChange={(e) => setBidData({ ...bidData, display_up_to: e.target.value })}
                            style={{ width: '308px' }}
                        />
                        <label className="bid-form-format-element" >
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
                                className="custom-input"
                                placeholder='Место'
                                value={bidData?.place || ''}
                                onChange={(e) => setBidData({ ...bidData, place: e.target.value })}
                                style={{ width: '308px' }}
                            />
                            <p className='bid-form-text-date'>Дата</p>
                            <input
                                type='datetime-local'
                                id='bid-start-date'
                                className="custom-input"
                                placeholder='Дата начала'
                                value={bidData?.start_date || ''}
                                onChange={(e) => setBidData({ ...bidData, start_date: e.target.value })}
                                style={{ width: '220px' }}
                            />
                            <p style={{ marginLeft: '0px' }}>до</p>
                            <input
                                type='datetime-local'
                                id='bid-end-date'
                                className="custom-input"
                                placeholder='Дата окончания'
                                value={bidData?.end_date || ''}
                                onChange={(e) => setBidData({ ...bidData, end_date: e.target.value })}
                                style={{ width: '220px' }}
                            />
                        </div>
                        <div className="bid-form-body-oneline">
                        <input
                            type='text'
                            id='bid-organizer'
                            className="custom-input"
                            placeholder='Организатор мероприятия'
                            value={organizerName || bidData?.organizer || ''}
                            onChange={(e) => setBidData({ ...bidData, organizer: e.target.value })}
                            style={{ width: '308px' }}
                        />
                            <input
                                type='phone'
                                id='organizer-phone'
                                className="custom-input"
                                placeholder='Телефон'
                                value={bidData?.organizer_phone || ''}
                                onChange={(e) => setBidData({ ...bidData, organizer_phone: e.target.value })}
                                style={{ width: '308px' }}
                            />
                            <input
                                type='email'
                                id='organizer-email'
                                className="custom-input"
                                placeholder='Почта'
                                value={bidData?.organizer_email || ''}
                                onChange={(e) => setBidData({ ...bidData, organizer_email: e.target.value })}
                                style={{ width: '308px' }}
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
                            {componentsCarousel.map((component, index) => (
                                component && (
                                    <div key={index} className="photo-wrapper" style={{ position: 'relative' }}>
                                        {component}
                                        <div className="cover-photo-delete-container" onClick={() => handlePhotoDelete(index)}>
                                            <img src={imgTrashDelete} className="cover-photo-delete" alt="Удалить" />
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    <div className={`icon-container ${CarouselPosition <= 227 * -(maxPhotoCnt - 3) ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(1)}>
                        <img src={imgArrowIcon} alt="" className={`${CarouselPosition <= 227 * -(maxPhotoCnt - 3) ? 'non-active-img' : ''}`} />
                    </div>
                    <img src={imgAddIcon} alt="" className="add-photofield" onClick={addPhotoFieldHandler} />
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
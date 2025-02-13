// src/components/EditBidPage.js
import React, { useEffect, useState } from 'react';
import '../styles/BidForm.css';
import '../styles/CustomInput.css';
import InputMask from 'react-input-mask';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imgBackIcon from '../images/back.svg';
import imgCheckmark from '../images/checkmark.png';
import imgLocationIcon from '../images/location.svg';
import imgAddIcon from '../images/add.svg';
import imgArrowIcon from '../images/go-arrow.svg';
import imgTrashDelete from '../images/trash-delete.png';
import { getImageUrl } from '../utils/getImageUrl';
import CustomInput from './CustomInput';
import CustomPhotoBox from './CustomPhotoBox';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';
import Loader from './Loader';
import { navigationStore } from '../stores/NavigationStore';
import { fetchNewsById, editNews } from '../Controller/NewsController';
import { fetchEventById, editEvent } from '../Controller/EventsController';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { fetchUserById } from '../Controller/UsersController'; // Импортируем fetchUserById

const serverUrl = process.env.REACT_APP_SERVER_URL || '';

function EditBidForm({ typeForm, id, setIsEditPage = null }) {
    const [bidData, setBidData] = useState({});
    const [filesList, setFilesList] = useState([]);
    const [linksList, setLinksList] = useState([]);
    const [isImportant, setIsImportant] = useState(false);
    const [CarouselPosition, setCarouselPosition] = useState(0);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [imageFiles, setImageFiles] = useState([]);
    const [selectedFormat, setSelectedFormat] = useState(null);
    const maxPhotoCnt = 6;

    useEffect(() => {
        const fetchBidData = async () => {
            setLoading(true);
            try {
                let bid;
                if (typeForm === 'News' || typeForm === 'TechNews') {
                    bid = await fetchNewsById(id);
                } else if (typeForm === 'Events') {
                    bid = await fetchEventById(id);
                }
                if (!bid) {
                    throw new Error('Заявка не найдена');
                }
                navigationStore.setCurrentBidText(bid.text || '');
                if (bid.display_up_to) {
                    bid.display_up_to = new Date(bid.display_up_to).toISOString().slice(0, 16);
                }
                if (bid.start_date) {
                    bid.start_date = new Date(bid.start_date).toISOString().slice(0, 16);
                }
                if (bid.end_date) {
                    bid.end_date = new Date(bid.end_date).toISOString().slice(0, 16);
                }
                const images = bid.images || [];
                setCoverImageFile(images[0] || null);
                setImageFiles(images.slice(1));
                setFilesList(
                    Array.isArray(bid.files) ?
                        bid.files.map((fileUrl, index) => ({})) : []
                );
                setLinksList(
                    Array.isArray(bid.links) ?
                        bid.links.map((link, index) => ({})) : []
                );

                // Обработка поля organizer
                let organizerName = bid.organizer;
                if (isUUID(bid.organizer)) {
                    organizerName = await fetchUserNameByUUID(bid.organizer);
                }

                setBidData({
                    ...bid,
                    organizer: organizerName
                });
                setEmail(bid.organizer_email || '');
                setIsImportant(bid.fixed || false);
                setSelectedFormat(bid.elementtype || '');
            } catch (error) {
                console.error('Ошибка при загрузке данных заявки:', error);
                toast.error('Ошибка при загрузке данных заявки.');
            } finally {
                setLoading(false);
            }
        };

        fetchBidData();
    }, [id, typeForm]);

    const isUUID = (str) => {
        const regexExp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return regexExp.test(str);
    };

    const fetchUserNameByUUID = async (uuid) => {
        try {
            const response = await fetch(`${serverUrl}/api/users/${uuid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('Пользователь не найден:', uuid);
                    return null;
                }
                const errorText = await response.text();
                console.error('Ошибка при получении данных пользователя:', errorText);
                toast.error('Ошибка при получении имени и фамилии пользователя.');
                return null;
            }
            const user = await response.json();
            return `${user.name} ${user.surname}`;
        } catch (error) {
            console.error('Ошибка при получении имени и фамилии пользователя:', error);
            toast.error('Ошибка при получении имени и фамилии пользователя.');
            return null;
        }
    };

    const handleBackClick = () => {
        if (typeof setIsEditPage === 'function') {
            setIsEditPage(false);
        } else {
            window.location.href = '/content';
        }
    };

    const handleEmailChange = (e) => {
        let { value } = e.target;
        value = value.replace(/[^\w@._-]/g, '');
        setEmail(value);
        setBidData({ ...bidData, organizer_email: value });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(value) || value === '');
    };

    const carouselMoveHandler = (direction) => {
        let position = CarouselPosition - ((195 + 2 + 30) * direction);
        if (position <= 0 && position >= (195 + 2 + 30) * -(maxPhotoCnt - 3)) {
            setCarouselPosition(position);
        }
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, uuidv4()]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, uuidv4()]);
    };

    const handleCoverImageSelect = (file) => {
        setCoverImageFile(file);
    };

    const handleImageFileSelect = (file, index) => {
        setImageFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles[index] = file;
            return updatedFiles;
        });
    };

    const handleImageDelete = (index) => {
        setImageFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles.splice(index, 1);
            return updatedFiles;
        });
    };

    const addPhotoFieldHandler = () => {
        if (imageFiles.length < maxPhotoCnt - 1) {
            setImageFiles((prevFiles) => [...prevFiles, null]);
        } else {
            toast.error(`Максимальное количество фотографий: ${maxPhotoCnt}`);
        }
    };

    const handleFormatChange = (format) => {
        setSelectedFormat(format);
        setBidData({ ...bidData, elementtype: format });
    };

    const updateBidHandler = async () => {
        setLoading(true);
        console.log('Перед обновлением заявки, состояние bidData:', bidData);
        console.log('Текущее значение selectedFormat:', selectedFormat);
        console.log('Текущее значение isImportant:', isImportant);
        console.log('Текущее значение navigationStore.currentBidText:', navigationStore.currentBidText);
        const title = bidData.title;
        if (!title) {
            toast.error("Укажите название новости.");
            setLoading(false);
            return;
        }
        if (!isEmailValid) {
            toast.error('Пожалуйста, введите корректный адрес электронной почты.');
            setLoading(false);
            return;
        }
        const tagsArray = bidData.tags || [];
        let selectedFormats = [];
        if (typeForm === 'TechNews') {
            selectedFormats = ['Тех. новости'];
        } else {
            selectedFormats = [bidData.elementtype];
            if (!selectedFormats.length) {
                toast.error("Выберите тип Новости.");
                setLoading(false);
                return;
            }
        }
        let n_files = Array.from(document?.getElementsByName('bid-file')).map((e) => e?.files[0] || null);
        let n_links = Array.from(document?.getElementsByName('bid-link')).map((e) => e?.value).filter((value) => value !== "");
        try {
            const formData = new FormData();
            formData.append('title', bidData.title);
            formData.append('text', navigationStore.currentBidText || '');
            formData.append('tags', JSON.stringify(tagsArray));
            formData.append('elementtype', selectedFormats[0]);
            formData.append('status', bidData.status || 'На модерации');
            formData.append('fixed', isImportant ? 'true' : 'false');
            // Обработка изображений
            const existingImageUrls = [];
            if (coverImageFile instanceof File) {
                formData.append('images', coverImageFile);
            } else if (typeof coverImageFile === 'string') {
                existingImageUrls.push(coverImageFile);
            }
            imageFiles.forEach((file) => {
                if (file instanceof File) {
                    formData.append('images', file);
                } else if (typeof file === 'string') {
                    existingImageUrls.push(file);
                }
            });
            formData.append('existingImages', JSON.stringify(existingImageUrls));
            n_files.forEach(file => {
                if (file) {
                    formData.append('files', file);
                }
            });
            if (n_links.length > 0) {
                formData.append('links', JSON.stringify(n_links));
            }
            if (selectedFormats[0] === 'Объявления') {
                formData.append('display_up_to', bidData.display_up_to || '');
            }
            if (typeForm === 'Events') {
                formData.append('start_date', bidData.start_date || '');
                formData.append('end_date', bidData.end_date || '');
                formData.append('organizer', bidData.organizer || '');
                formData.append('organizer_phone', bidData.organizer_phone || '');
                formData.append('organizer_email', bidData.organizer_email || '');
                formData.append('place', bidData.place || '');
            }
            formData.append('postdata', new Date().toISOString());
            // Логируем данные перед отправкой
            console.log('Данные, отправляемые на сервер:');
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}:`, pair[1]);
            }
            // Отправка данных на сервер
            if (typeForm === 'News' || typeForm === 'TechNews') {
                await editNews(bidData.id, formData);
            } else if (typeForm === 'Events') {
                await editEvent(bidData.id, formData);
            }
            setLoading(false);
            toast.success('Заявка успешно обновлена!');
            if (typeof setIsEditPage === 'function') {
                setIsEditPage(false);
            } else {
                window.location.href = '/content';
            }
        } catch (error) {
            console.error('Ошибка при редактировании заявки:', error);
            setLoading(false);
            toast.error('Ошибка при обновлении заявки.');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="bid-form-container noselect">
            <div className="bid-form-head">
                <div className="icon-container" onClick={handleBackClick}>
                    <img src={imgBackIcon} alt="Назад" className="bid-form-btn-back" />
                </div>
                <p className="bid-form-datetime">
                    {bidData?.postdata}
                </p>
            </div>
            <div className="bid-form-body">
                <CustomInput
                    width='100%'
                    placeholder='Название'
                    id='bid-title'
                    value={bidData?.title || ''}
                    onChange={(e) => setBidData({ ...bidData, title: e.target.value })}
                />

                <div className="bid-form-body-oneline">
                    <CustomInput
                        width='50%'
                        placeholder='Теги'
                        id='bid-tags'
                        value={bidData?.tags ? bidData.tags.join(', ') : ''}
                        onChange={(e) => setBidData({ ...bidData, tags: e.target.value.split(', ').map(tag => tag.trim()) })}
                    />
                </div>

                {typeForm !== 'TechNews' && typeForm !== 'Events' && (
                    <div className="bid-form-format-container">
                        <label className='bid-form-format-element'>
                            <input
                                type="radio"
                                name="bid-format"
                                value="Объявления"
                                checked={selectedFormat === 'Объявления'}
                                onChange={() => handleFormatChange('Объявления')}
                            />
                            <p><img src={imgCheckmark} alt="" />Объявления</p>
                        </label>
                        <label className='bid-form-format-element'>
                            <input
                                type="radio"
                                name="bid-format"
                                value="Устройства и ПО"
                                checked={selectedFormat === 'Устройства и ПО'}
                                onChange={() => handleFormatChange('Устройства и ПО')}
                            />
                            <p><img src={imgCheckmark} alt="" />Устройства и ПО</p>
                        </label>
                        <label className='bid-form-format-element'>
                            <input
                                type="radio"
                                name="bid-format"
                                value="Мероприятия"
                                checked={selectedFormat === 'Мероприятия'}
                                onChange={() => handleFormatChange('Мероприятия')}
                            />
                            <p><img src={imgCheckmark} alt="" />Мероприятия</p>
                        </label>
                    </div>
                )}

                {selectedFormat === 'Объявления' && (
                    <div className='bid-form-body-oneline'>
                        <input
                            type='datetime-local'
                            id='display_up_to'
                            className="custom-input"
                            value={bidData?.display_up_to || ''}
                            onChange={(e) => setBidData({ ...bidData, display_up_to: e.target.value })}
                            style={{ width: '308px' }}
                        />
                        <label className="bid-form-format-element">
                            <input
                                type="checkbox"
                                name="important"
                                checked={isImportant}
                                onChange={(e) => setIsImportant(e.target.checked)}
                            />
                            <p style={{ marginLeft: '30px' }}>
                                <img src={imgCheckmark} alt="" />Закрепить объявление
                            </p>
                        </label>
                    </div>
                )}

                {typeForm === 'Events' && (
                    <>
                        <div className="bid-form-body-oneline bid-form-body-oneline-2">
                            <CustomInput
                                width='calc(25% - 15px)'
                                placeholder='Место'
                                img={imgLocationIcon}
                                id='bid-place'
                                value={bidData?.place || ''}
                                onChange={(e) => setBidData({ ...bidData, place: e.target.value })}
                            />
                            <p className='bid-form-text-date'>Дата</p>
                            <input
                                type='datetime-local'
                                id='bid-start-date'
                                className="custom-input"
                                value={bidData?.start_date || ''}
                                onChange={(e) => setBidData({ ...bidData, start_date: e.target.value })}
                                style={{ width: '217px' }}
                            />
                            <p className='bid-form-text-date'>до</p>
                            <input
                                type='datetime-local'
                                id='bid-end-date'
                                className="custom-input"
                                value={bidData?.end_date || ''}
                                onChange={(e) => setBidData({ ...bidData, end_date: e.target.value })}
                                style={{ width: '217px' }}
                            />
                        </div>
                        <div className="bid-form-body-oneline">
                            <CustomInput
                                width='420px'
                                placeholder='Организатор мероприятия'
                                type='text'
                                id='bid-organizer'
                                value={bidData?.organizer || ''}
                                onChange={(e) => setBidData({ ...bidData, organizer: e.target.value })}
                            />
                            <InputMask
                                mask="+7(999)999-99-99"
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
                                className={`custom-input ${!isEmailValid ? 'invalid' : ''}`}
                                placeholder='Почта'
                                value={email}
                                onChange={handleEmailChange}
                                style={{ width: '308px' }}
                            />
                        </div>
                    </>
                )}

                <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                    <div className="bid-form-cover">
                        <p>Обложка</p>
                        <CustomPhotoBox
                            name='bid-image-cover'
                            id='bid-cover'
                            onFileSelect={handleCoverImageSelect}
                            defaultValue={coverImageFile instanceof File ? null : getImageUrl(coverImageFile)}
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
                                    {imageFiles.map((file, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <CustomPhotoBox
                                                name={`bid-image-${index}`}
                                                onFileSelect={(file) => handleImageFileSelect(file, index)}
                                                defaultValue={file instanceof File ? null : getImageUrl(file)}
                                            />
                                            <div className="cover-photo-delete-container" onClick={() => handleImageDelete(index)}>
                                                <img src={imgTrashDelete} className="cover-photo-delete" alt="Удалить" />
                                            </div>
                                        </div>
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

                {/* Текстовое содержание */}
                <CKEditorRedaktor className='ckeditor' data={bidData?.text} />

                {/* Файлы */}
                <p className='title-bid-form'>Файлы</p>
                <div className="files-row">
                    {filesList.map((item, index) => (
                        <CustomFileSelect key={index} name='bid-file' defaultValue={item} />
                    ))}
                    <img
                        src={imgAddIcon}
                        alt=""
                        className="add-filefield"
                        onClick={addFileFieldHandler}
                    />
                </div>

                {/* Ссылки */}
                <p className='title-bid-form'>Ссылки</p>
                <div className="links-row">
                    {linksList.map((item, index) => (
                        <CustomInput key={index} width='308px' placeholder='Ссылка' name='bid-link' defaultValue={item} />
                    ))}
                    <img
                        src={imgAddIcon}
                        alt=""
                        className="add-linkfield"
                        onClick={addLinkFieldHandler}
                    />
                </div>

                {/* Кнопка обновления */}
                <div className='bid-form-send-btn' onClick={updateBidHandler}>
                    {loading ? <p>Загрузка...</p> : <p>Обновить заявку</p>}
                </div>

            </div>
            <ToastContainer />
        </div>
    );
}

export default EditBidForm;
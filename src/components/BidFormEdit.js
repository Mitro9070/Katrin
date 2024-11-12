import { useState, useEffect } from 'react';
import { database, storage } from '../firebaseConfig';
import { ref as databaseRef, set, get, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'; // Для генерации UID

import '../styles/BidForm.css';

import imgBackIcon from '../images/back.svg';
import imgCalendarIcon from '../images/calendar.svg';
import imgTrashIcon from '../images/trash.svg';
import imgCheckIcon from '../images/seal-check.svg';
import imgLocationIcon from '../images/location.svg';
import imgArrowIcon from '../images/go-arrow.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.svg';

import CustomInput from './CustomInput';
import CoverPhotoBox from './CoverPhotoBox';
import PhotoSlider from './PhotoSlider';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';

import { navigationStore } from '../stores/NavigationStore';
import Cookies from 'js-cookie';

function BidFormEdit({ setIsAddPage, typeForm, bidId, maxPhotoCnt = 6 }) {
    let datetime = '15 Июня, 12:00';

    const [filesList, setFilesList] = useState([{ id: uuidv4(), component: <CustomFileSelect name='bid-file' /> }]);
    const [linksList, setLinksList] = useState([{ id: uuidv4(), component: <CustomInput width='308px' placeholder='Ссылка' name='bid-link' /> }]);
    const [isAdsChecked, setIsAdsChecked] = useState(true); // По умолчанию выбран чекбокс "Объявления"
    const [isImportant, setIsImportant] = useState(false);
    const [loading, setLoading] = useState(false); // Состояние для отслеживания загрузки
    const [userEmail, setUserEmail] = useState(''); // Состояние для хранения email пользователя
    const [bidData, setBidData] = useState(null); // Состояние для хранения данных редактируемой новости

    const userId = Cookies.get('userId');

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const userRef = databaseRef(database, `Users/${userId}`);
                const userSnapshot = await get(userRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    setUserEmail(userData.email);
                }
            } catch (error) {
                console.error("Ошибка при получении email пользователя:", error);
            }
        };

        const fetchBidData = async () => {
            try {
                const bidRef = databaseRef(database, `${typeForm === 'Events' ? 'Events' : 'News'}/${bidId}`);
                const bidSnapshot = await get(bidRef);
                if (bidSnapshot.exists()) {
                    const bidData = bidSnapshot.val();
                    console.log("Данные из БД:", bidData.images); // Выводим данные из images в лог
                    setBidData(bidData);
                }
            } catch (error) {
                console.error("Ошибка при получении данных новости:", error);
            }
        };

        fetchUserEmail();
        fetchBidData();
    }, [userId, bidId, typeForm]);

    const changeAddPageHandler = () => {
        setIsAddPage && setIsAddPage(() => false);
    };

    const handleAdsCheckboxChange = (e) => {
        setIsAdsChecked(e.target.checked);
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, { id: uuidv4(), component: <CustomFileSelect name='bid-file' /> }]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, { id: uuidv4(), component: <CustomInput width='308px' placeholder='Ссылка' name='bid-link' /> }]);
    };

    const saveChangesHandler = async () => {
        setLoading(true); // Начало загрузки

        let n_images = Array.from(document?.getElementsByName('bid-image')).map((e) => e?.files[0]).filter(Boolean);
        let n_files = Array.from(document?.getElementsByName('bid-file')).map((e) => e?.files[0]).filter(Boolean);
        let n_links = Array.from(document?.getElementsByName('bid-link'))
            .map((e) => e?.value)
            .filter((value) => value !== "");
        let format;

        // Проверка формата
        if (typeForm !== 'Events' && typeForm !== 'TechNews') {
            format = Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked')).map(cb => cb?.value);
            if (format.length === 0) {
                alert("Пожалуйста, выберите хотя бы один формат: Объявления, Устройства и ПО или Мероприятия.");
                setLoading(false); // Остановка загрузки
                return; // Прерывание выполнения, если ничего не выбрано
            }
        } else if (typeForm === 'Events') {
            format = [document.querySelector('input[type="radio"][name="bid-format"]:checked')?.value];
            if (!format[0]) {
                alert("Пожалуйста, выберите хотя бы один формат: Внешнее событие или Внутреннее событие.");
                setLoading(false); // Остановка загрузки
                return; // Прерывание выполнения, если ничего не выбрано
            }
        } else {
            format = ['Тех. новости'];
        }

        try {
            const uploadFiles = async (files, folder) => {
                const urls = [];
                for (const file of files) {
                    if (file) {
                        const fileRef = storageRef(storage, `${folder}/${bidId}/${file.name}`);
                        await uploadBytes(fileRef, file);
                        const url = await getDownloadURL(fileRef);
                        urls.push(url);
                    }
                }
                return urls;
            };

            const photosUrls = await uploadFiles([document?.getElementById('bid-cover')?.files[0], ...n_images], 'images');
            const filesUrls = await uploadFiles(n_files, 'files');

            const updatedBidData = {
                ...bidData,
                title: document?.getElementById('bid-title')?.value || bidData.title,
                tags: document?.getElementById('bid-tags')?.value.split(', ') || bidData.tags,
                elementType: format[0] || bidData.elementType,
                text: navigationStore.currentBidText || bidData.text,
                place: document?.getElementById('bid-place')?.value || bidData.place,
                start_date: document?.getElementById('bid-start-date')?.value || bidData.start_date,
                end_date: document?.getElementById('bid-end-date')?.value || bidData.end_date,
                event_date: document?.getElementById('display_up_to')?.value || bidData.event_date, // Дата из CustomInput Дата Объявления
                organizer: document?.getElementById('bid-organizer')?.value || bidData.organizer,
                organizer_phone: document?.getElementById('organizer-phone')?.value || bidData.organizer_phone,
                organizer_email: document?.getElementById('organizer-email')?.value || bidData.organizer_email,
                status: bidData.status,
                images: photosUrls.length > 0 ? photosUrls : bidData.images,
                files: filesUrls.length > 0 ? filesUrls : bidData.files,
                links: n_links.length > 0 ? n_links : bidData.links,
                display_up_to: document?.getElementById('display_up_to')?.value || bidData.display_up_to,
                fixed: typeForm === 'TechNews' ? false : isImportant,
                postData: bidData.postData
            };

            const bidRef = databaseRef(database, `${typeForm === 'Events' ? 'Events' : 'News'}/${bidId}`);
            await set(bidRef, updatedBidData);

            setLoading(false); // Остановка загрузки
            alert('Изменения успешно сохранены!');
            changeAddPageHandler();
            window.location.reload(); // Перезагрузка страницы только после успешного сохранения
        } catch (error) {
            console.error("Ошибка при сохранении изменений:", error);
            setLoading(false); // Остановка загрузки
        }
    };

    return (
        <div className="bid-form-container noselect">
            <div className="bid-form-head">
                <div className="icon-container" onClick={changeAddPageHandler}>
                    <img src={imgBackIcon} alt="" className="bid-form-btn-back" />
                </div>
                <p className="bid-form-datetime">{datetime}</p>
                <div className="icon-container">
                    <img src={imgCalendarIcon} alt="" className="bid-form-btn-calendar" />
                </div>
                <div className="icon-container bid-form-btn-delete">
                    <img src={imgTrashIcon} alt="" />
                </div>
            </div>
            <div className="bid-form-body">
                <CustomInput width='100%' placeholder='Название' id='bid-title' defaultValue={bidData?.title || ''} />
                <div className="bid-form-body-oneline">
                    <CustomInput width='50%' placeholder='Теги' img={imgCheckIcon} id='bid-tags' defaultValue={bidData?.tags.join(', ') || ''} />
                    <div className="bid-form-format-container">
                        {typeForm !== 'Events' && typeForm !== 'TechNews' && (
                            <>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-ads" value="Объявления" onChange={handleAdsCheckboxChange} checked={isAdsChecked} />
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
                {isAdsChecked && typeForm !== 'TechNews' && (
                    <div className='bid-form-body-oneline'>
                        <p>Дата</p>
                        <CustomInput width='217px' placeholder='Дата объявления' type='date' id='display_up_to' defaultValue={bidData?.display_up_to || ''} />
                        <label className="bid-form-format-element">
                            <input type="checkbox" name="important" onChange={(e) => setIsImportant(e.target.checked)} checked={isImportant} />
                            <p><img src={imgCheckmark} alt="" />Закрепить объявление</p>
                        </label>
                    </div>
                )}
                <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                    <div className="bid-form-cover">
                        <p>Обложка</p>
                        <CoverPhotoBox id='bid-cover' defaultValue={bidData?.images && bidData.images.length > 0 ? bidData.images[0] : ''} />
                    </div>
                    <div className="bid-form-photoes">
                        <p>Другие фотографии</p>
                        <PhotoSlider defaultValues={bidData?.images && bidData.images.length > 1 ? bidData.images.slice(1) : []} />
                    </div>
                </div>
                <CKEditorRedaktor data={bidData?.text || ''} />
                {typeForm === 'Events' && (
                    <div className="bid-form-body-oneline">
                        <CustomInput width='420px' placeholder='Организатор мероприятия' type='text' id='bid-organizer' defaultValue={bidData?.organizer || ''} />
                        <CustomInput width='308px' placeholder='Телефон' type='phone' id='organizer-phone' defaultValue={bidData?.organizer_phone || ''} />
                        <CustomInput width='307px' placeholder='Почта' type='email' id='organizer-email' defaultValue={bidData?.organizer_email || ''} />
                    </div>
                )}
                <p className='title-бид-form'>Файлы</p>
                <div className="files-row">
                    {filesList.map((file) => (
                        <div key={file.id}>{file.component}</div>
                    ))}
                    <img src={imgAddIcon} alt="" className="add-filefield" onClick={addFileFieldHandler} />
                </div>
                <p className='title-бид-form'>Ссылки</p>
                <div className="links-row">
                    {linksList.map((link) => (
                        <div key={link.id}>{link.component}</div>
                    ))}
                    <img src={imgAddIcon} alt="" className="add-linkfield" onClick={addLinkFieldHandler} />
                </div>
                <div className="bid-form-send-btn" onClick={saveChangesHandler}>
                    {loading ? <p>Загрузка...</p> : <p>Сохранить изменения</p>}
                </div>
            </div>
        </div>
    );
}

export default BidFormEdit;
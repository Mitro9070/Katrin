import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import '../styles/BidForm.css';

import imgBackIcon from '../images/back.svg';
import imgTrashIcon from '../images/trash.svg';
import imgCheckIcon from '../images/seal-check.svg';
import imgLocationIcon from '../images/location.svg';
import imgAddIcon from '../images/add.svg';
import imgCheckmark from '../images/checkmark.svg';
import imgCalendarIcon from '../images/calendar.svg';
import imgArrowIcon from '../images/go-arrow.svg';

import CustomInput from './CustomInput';
import CustomPhotoBox from './CustomPhotoBox';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';
import Loader from './Loader'; 

import { newsContentStore } from '../stores/NewsContentStore';
import { eventsStore } from '../stores/EventsStore';
import { navigationStore } from '../stores/NavigationStore';

function EditBidForm({ typeForm, id }) {
    const navigate = useNavigate();
    const [bidData, setBidData] = useState(null);
    const [componentsCarousel, setComponentsCarousel] = useState([]);
    const [filesList, setFilesList] = useState([]);
    const [linksList, setLinksList] = useState([]);

    const [isAdsChecked, setIsAdsChecked] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [CarouselPosition, setCarouselPosition] = useState(0);
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const maxPhotoCnt = 6;

    useEffect(() => {
        const fetchBidData = async () => {
            setLoading(true);
            let bid;

            if (typeForm === 'news' || typeForm === 'tech-news') {
                await newsContentStore.fetchData();
                bid = newsContentStore.getNewsById(id);
            } else if (typeForm === 'events') {
                await eventsStore.fetchData();
                bid = eventsStore.getEventById(id);
            }

            if (!bid) {
                console.error('Заявка не найдена');
                setLoading(false);
                return;
            }

            setBidData(bid);
            setFilesList(bid?.files?.map((file, index) => <CustomFileSelect key={index} name='bid-file' defaultValue={file} />));
            setLinksList(bid?.links?.map((link, index) => <CustomInput key={index} width='308px' placeholder='Ссылка' name='bid-link' defaultValue={link} />));
            setIsAdsChecked(bid?.formats?.includes('Объявления'));
            setIsImportant(bid?.fixed);
            setComponentsCarousel(
                bid?.images?.slice(1).map((image, index) => (
                    <CustomPhotoBox key={index} width="380px" name='bid-cover' defaultValue={image} />
                ))
            );
            setIsAdsChecked(bid?.elementType?.includes('Объявления'));
            navigationStore.setCurrentBidText(bid?.text);
            setLoading(false);
        };

        fetchBidData();
    }, [id, typeForm]);

    const carouselMoveHandler = (direction) => {
        let position = CarouselPosition - ((195 + 2 + 30) * direction);
        if (position <= 0 && position >= (195 + 2 + 30) * -(maxPhotoCnt - 3)) {
            setCarouselPosition(() => position);
            direction > 0 && componentsCarousel.length < (maxPhotoCnt - 4) &&
                setComponentsCarousel([...componentsCarousel, <CustomPhotoBox key={componentsCarousel.length} name='bid-image' />]);
        }
    };

    const handleAdsCheckboxChange = (e) => {
        setIsAdsChecked(e.target.checked);
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, <CustomFileSelect key={filesList.length} name='bid-file' />]);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, <CustomInput key={linksList.length} width='308px' placeholder='Ссылка' name='bid-link' />]);
    };

    const addPhotoFiledHandler = () => {
        setComponentsCarousel([...componentsCarousel, <CustomPhotoBox key={componentsCarousel.length} width="380px" name='bid-image' />])
    };

    const updateBidHandler = async () => {
        setLoading(true);
        let n_images = Array.from(document?.getElementsByName('bid-image'))?.map(e => e?.files[0]);
        let n_files = Array.from(document?.getElementsByName('bid-file'))?.map(e => e?.files[0]);
        let n_links = Array.from(document?.getElementsByName('bid-link'))?.map(e => e?.value);
        let format;

        if (typeForm !== 'events') {
            format = Array.from(document.querySelectorAll('input[type="checkbox"][name="bid-format"]:checked'))?.map(cb => cb?.value);
        } else {
            format = [document.querySelector('input[type="radio"][name="bid-format"]:checked')?.value];
        }

        try {
            const newCoverImage = document?.getElementById('bid-cover')?.files[0] || bidData?.images[0];
            const updatedBidData = {
                title: document?.getElementById('bid-title')?.value,
                tags: document?.getElementById('bid-tags')?.value.split(', '),
                elementType: format,
                text: navigationStore.currentBidText,
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

            if (typeForm === 'news' || typeForm === 'tech-news') {
                await newsContentStore.updateNews(bidData.id, updatedBidData);
            } else if (typeForm === 'events') {
                await eventsStore.updateEvent(bidData.id, updatedBidData);
            }

            navigate("/" + typeForm);
        } catch (error) {
            console.error("Ошибка при редактировании заявки:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        setPhotoLoading(true);
        // Логика загрузки фотографий
        setPhotoLoading(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="bid-form-container noselect">
            <div className="bid-form-head">
                <Link to={"/" + typeForm}>
                    <div className="icon-container">
                        <img src={imgBackIcon} alt="" className="bid-form-btn-back" />
                    </div>
                </Link>
                <p className="bid-form-datetime">{new Date(bidData?.postData).toLocaleString()}</p>
                <div className="icon-container">
                    <img src={imgCalendarIcon} alt="" className="bid-form-btn-calendar" />
                </div>
                <div className="icon-container bid-form-btn-delete">
                    <img src={imgTrashIcon} alt="" />
                </div>
            </div>
            <div className="bid-form-body">
                <CustomInput width='100%' placeholder='Название' id='bid-title' defaultValue={bidData?.title} />
                <div className="bid-form-body-oneline">
                    <CustomInput width='50%' placeholder='Теги' img={imgCheckIcon} id='bid-tags' defaultValue={bidData?.tags?.join(', ')} />
                    <div className="bid-form-format-container">
                        {typeForm !== 'events' && (
                            <>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" value="Объявления" defaultChecked={bidData?.elementType?.includes('Объявления')} onChange={handleAdsCheckboxChange} />
                                    <p><img src={imgCheckmark} alt="" />Объявления</p>
                                </label>
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-device" value="Устройства и ПО" defaultChecked={bidData?.elementType?.includes('Устройства и ПО')} />
                                    <p><img src={imgCheckmark} alt="" />Устройства и ПО</p>
                                </label>   
                                <label className='bid-form-format-element'>
                                    <input type="checkbox" name="bid-format" id="bid-format-events" value="Мероприятия" defaultChecked={bidData?.elementType?.includes('Мероприятия')} />
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
                            <input type="checkbox" name="important" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
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
                <div className="bid-form-body-oneline bid-form-body-oneline-photo">
                    <div className="bid-form-cover">
                        <p>Обложка</p>
                        <CustomPhotoBox id='bid-cover' defaultValue={bidData?.images[0]} onChange={handlePhotoUpload} />
                    </div>
                    <div className={`icon-container ${CarouselPosition >= 0 ? 'non-active-img-container' : ''}`} onClick={() => carouselMoveHandler(-1)}>
                        <img src={imgArrowIcon} alt="" style={{ transform: 'rotate(180deg)' }} className={`${CarouselPosition >= 0 ? 'non-active-img' : ''}`} />
                    </div>
                    <div className="bid-form-photoes">
                        <p>Другие фотографии</p>
                        <div className="wrapper-bid-form">
                            <div className="bid-form-photoes-carousel">
                                <div id="bid-carousel" className="bid-form-photoes-carousel-wrapper" style={{ transform: `translateX(${CarouselPosition}px)` }}>
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
                    {filesList.map((file) => file)}
                    <img src={imgAddIcon} alt="" className="add-filefield" onClick={addFileFieldHandler} />
                </div>
                <p className='title-бид-form'>Ссылки</p>
                <div className="links-row">
                    {linksList.map((link) => link)}
                    <img src={imgAddIcon} alt="" className="add-linkfield" onClick={addLinkFieldHandler} />
                </div>
                <div className='bid-form-send-btn' onClick={updateBidHandler}>
                    <p>Обновить заявку</p>
                </div>
            </div>
        </div>
    );
}

export default EditBidForm;
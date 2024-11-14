import { useEffect, useState } from 'react';
import { ref as databaseRef, get, set } from 'firebase/database';
import { database } from '../firebaseConfig';
import '../styles/EditBidPage.css';
import imgBackIcon from '../images/back.svg'; // Иконка для возврата назад
import imgAddIcon from '../images/add.svg';
import CustomInput from './CustomInput';
import CustomPhotoBox from './CustomPhotoBox';
import CKEditorRedaktor from './CKEditor';
import CustomFileSelect from './CustomFileSelect';
import Loader from './Loader';
import imgCheckmark from '../images/checkmark.svg';

const EditBidForm = ({ typeForm, bidId, onClose }) => {
    const [bidData, setBidData] = useState({});
    const [filesList, setFilesList] = useState([]);
    const [linksList, setLinksList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [showAlert, setShowAlert] = useState(false); // Новое состояние для уведомления об успешном сохранении

    useEffect(() => {
        const fetchBidData = async () => {
            try {
                const bidRef = databaseRef(database, `${typeForm}/${bidId}`);
                const snapshot = await get(bidRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setBidData(data);
                    setFilesList(data.files?.map((file, index) => <CustomFileSelect key={index} name='bid-file' defaultValue={file} />) || []);
                    setLinksList(data.links?.map((link, index) => <CustomInput key={index} width='308px' placeholder='Ссылка' name='bid-link' defaultValue={link} />) || []);
                } else {
                    console.error("Bid not found");
                    if (onClose) onClose();
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                if (onClose) onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchBidData();
    }, [typeForm, bidId, onClose]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBidData({ ...bidData, [name]: value });
        setIsFormChanged(true);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const bidRef = databaseRef(database, `${typeForm}/${bidId}`);
            await set(bidRef, { ...bidData });
            setIsFormChanged(false);
            setShowAlert(true); // Показать уведомление после сохранения
        } catch (error) {
            console.error("Ошибка при сохранении данных заявки:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
        if (onClose) onClose(); // Закрыть окно редактирования
    };

    const addFileFieldHandler = () => {
        setFilesList([...filesList, <CustomFileSelect key={filesList.length} name='bid-file' />]);
        setIsFormChanged(true);
    };

    const addLinkFieldHandler = () => {
        setLinksList([...linksList, <CustomInput key={linksList.length} width='308px' placeholder='Ссылка' name='bid-link' />]);
        setIsFormChanged(true);
    };

    if (loading) return <Loader />;

    return (
        <div className="modal-form-container">
            <div className="form-head">
                <div className="back-button" onClick={onClose} title="Назад"> 
                    <img src={imgBackIcon} alt="Назад" />
                </div>
                
            </div>
            <div className="form-body">
                <p className="title-files">Название</p>
                <CustomInput
                    width='100%'
                    placeholder='Название'
                    id='title'
                    name='title'
                    defaultValue={bidData?.title}
                    onChange={handleInputChange}
                />
                
                <p className="title-files">Тэг</p>
                <CustomInput
                    width='100%'
                    placeholder='Теги (через запятую)'
                    id='tags'
                    name='tags'
                    defaultValue={bidData?.tags?.join(', ')}
                    onChange={handleInputChange}
                />
                
                {typeForm === 'events' && (
                    <>
                        <p className="title-files">Организатор</p>
                        <CustomInput
                            width='100%'
                            placeholder='Организатор'
                            id='organizer'
                            name='organizer'
                            defaultValue={bidData?.organizer}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Место проведения</p>
                        <CustomInput
                            width='100%'
                            id='place'
                            name='place'
                            placeholder='Место проведения события'
                            defaultValue={bidData?.place}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Дата начала</p>
                        <CustomInput
                            width='100%'
                            id='start_date'
                            name='start_date'
                            type='datetime-local'
                            defaultValue={bidData?.start_date}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Дата окончания</p>
                        <CustomInput
                            width='100%'
                            id='end_date'
                            name='end_date'
                            type='datetime-local'
                            defaultValue={bidData?.end_date}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Тип мероприятия</p>
                        <label className='bid-form-format-element'>
                            <input type="radio" name="elementType" 
                            value="Внешнее событие" 
                            defaultChecked={bidData?.elementType === 'Внешнее событие'} 
                            onChange={handleInputChange}/>
                            <p><img src={imgCheckmark} alt="" />Внешнее событие</p>
                        </label>
                        <label className='bid-form-format-element'>
                            <input type="radio" name="elementType" 
                            value="Внутреннее событие" 
                            defaultChecked={bidData?.elementType === 'Внутреннее событие'} 
                            onChange={handleInputChange}/>
                            <p><img src={imgCheckmark} alt="" />Внутреннее событие</p>
                        </label>
                        <p className="title-files">Ответственный</p>
                        <p className="title-files">Email</p>
                        <CustomInput
                            width='100%'
                            id='organizer_email'
                            name='organizer_email'
                            placeholder='Email'
                            defaultValue={bidData?.organizer_email}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Телефон</p>
                        <CustomInput
                            width='100%'
                            id='organizer_phone'
                            name='organizer_phone'
                            placeholder='Телефон'
                            defaultValue={bidData?.organizer_phone}
                            onChange={handleInputChange}
                        />
                    </>
                )}

                {typeForm === 'news' && (
                    <>
                        <p className="title-files">Тип новости</p>
                        <label className='bid-form-format-element'>
                            <input type="radio" name="elementType"
                            value="Объявления"
                            defaultChecked={bidData?.elementType === 'Объявления'}
                            onChange={handleInputChange}/>
                            <p><img src={imgCheckmark} alt="" />Объявления</p>
                        </label>
                        <label className='bid-form-format-element'>
                            <input type="radio" name="elementType"
                            value="Устройства и ПО"
                            defaultChecked={bidData?.elementType === 'Устройства и ПО'}
                            onChange={handleInputChange}/>
                            <p><img src={imgCheckmark} alt="" />Устройства и ПО</p>
                        </label>
                        <label className='bid-form-format-element'>
                            <input type="radio" name="elementType"
                            value="Мероприятия"
                            defaultChecked={bidData?.elementType === 'Мероприятия'}
                            onChange={handleInputChange}/>
                            <p><img src={imgCheckmark} alt="" />Мероприятия</p>
                        </label>
                        <p className="title-files">Дата начала</p>
                        <CustomInput
                            width='100%'
                            id="start_date"
                            name='start_date'
                            type='datetime-local'
                            defaultValue={bidData?.start_date}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Дата окончания</p>
                        <CustomInput
                            width='100%'
                            id="end_date"
                            name='end_date'
                            type='datetime-local'
                            defaultValue={bidData?.end_date}
                            onChange={handleInputChange}
                        />
                        <p className="title-files">Закрепить</p>
                        <label className='bid-form-format-element'>
                            <input type="checkbox" name="fixed"
                            defaultChecked={bidData?.fixed}
                            onChange={(e) => {
                                setBidData({...bidData, fixed: e.target.checked});
                                setIsFormChanged(true);
                            }}/>
                            <p><img src={imgCheckmark} alt="" />Закрепить</p>
                        </label>
                    </>
                )}
                <p className="title-files">Изображения:</p>
                <div className="form-photos">
                    
                    <CustomPhotoBox
                        width="380px"
                        id="cover"
                        name="cover"
                        defaultValue={bidData?.images?.[0] || ''}
                        onChange={handleInputChange}
                    />

                    {bidData?.images?.slice(1).map((image, index) => (
                        <CustomPhotoBox key={index} width="380px" name="bid-image" defaultValue={image} />
                    ))}

                    <img src={imgAddIcon} alt="Добавить фото" onClick={() => { setBidData({ ...bidData, images: [...bidData.images, ''] }) }} />
                </div>
                <p className="title-files">Текст</p>
                <CKEditorRedaktor className="ckeditor" data={bidData?.text} />

                <p className="title-files">Файлы</p>
                <div className="files-row">
                    {filesList}
                    <img src={imgAddIcon} alt="Добавить файл" onClick={addFileFieldHandler} />
                </div>

                <p className="title-files">Ссылки</p>
                <div className="links-row">
                    {linksList}
                    <img src={imgAddIcon} alt="Добавить ссылку" onClick={addLinkFieldHandler} />
                </div>

                <button className="save-button" onClick={handleSaveChanges} disabled={!isFormChanged}>
                    Сохранить изменения
                </button>
            </div>

            {showAlert && (
                <div className="alert">
                    <p>Изменения успешно сохранены</p>
                    <button className="close-alert" onClick={handleCloseAlert}>Ок</button>
                </div>
            )}
        </div>
    );
};

export default EditBidForm;
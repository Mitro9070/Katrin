import React, { useState, useEffect } from 'react';
import '../styles/DeviceForm.css';
import Loader from './Loader';

import imgUploadIcon from '../images/upload.png'; // Значок для кнопки загрузки

import {
    getDevices,
    getDeviceById,
    createDevice,
    editDevice,
    uploadDeviceDataFromExcel,
} from '../Controller/DevicesController'; // Импорт функций контроллера

const DeviceForm = ({ setIsAddDevice }) => {
    const [deviceId, setDeviceId] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [deviceDescription, setDeviceDescription] = useState('');
    const [deviceType, setDeviceType] = useState('МФУ');
    const [images, setImages] = useState([]); // Новые изображения (File)
    const [mainImage, setMainImage] = useState(null); // Может быть File или URL
    const [existingImages, setExistingImages] = useState([]); // Существующие изображения (URL)
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [devicesList, setDevicesList] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

    useEffect(() => {
        fetchDevicesList();
    }, []);

    const fetchDevicesList = async () => {
        try {
            const response = await getDevices(1); // Получаем первую страницу устройств
            const devicesData = response.devices.map((device) => ({ id: device.id, name: device.name }));
            setDevicesList(devicesData);
        } catch (error) {
            console.error('Ошибка при загрузке списка устройств:', error);
        }
    };

    const handleDeviceSelect = async (e) => {
        const selectedDeviceId = e.target.value;
        setSelectedDeviceId(selectedDeviceId);

        if (selectedDeviceId) {
            try {
                const deviceData = await getDeviceById(selectedDeviceId);
                setDeviceId(deviceData.id);
                setDeviceName(deviceData.name);
                setDeviceDescription(deviceData.description || '');
                setDeviceType(deviceData.type || 'МФУ');
                setImages([]); // Очищаем новые изображения
                setMainImage(deviceData.main_image || null); // Может быть URL
                setExistingImages(deviceData.images || []);
            } catch (error) {
                console.error(`Ошибка при загрузке устройства ${selectedDeviceId}:`, error);
            }
        } else {
            // Если выбран пустой вариант, сбрасываем форму для создания нового устройства
            setDeviceId('');
            setDeviceName('');
            setDeviceDescription('');
            setDeviceType('МФУ');
            setImages([]);
            setMainImage(null);
            setExistingImages([]);
        }
    };

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleMainImageChange = (e) => {
        setMainImage(e.target.files[0]);
    };

    const removeExistingImage = (index) => {
        const updatedImages = [...existingImages];
        updatedImages.splice(index, 1);
        setExistingImages(updatedImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            // Создаем объект данных устройства
            const deviceData = {
                name: deviceName,
                description: deviceDescription,
                type: deviceType,
                images: images, // Новые изображения
                main_image: mainImage, // Новое главное изображение или URL
                existingImages: existingImages, // URLs существующих изображений
                options: {}, // Добавляем пустой объект options, если его нет
            };
    
            if (deviceId) {
                // Редактируем существующее устройство
                await editDevice(deviceId, deviceData);
            } else {
                // Создаем новое устройство
                await createDevice(deviceData);
            }
    
            setIsAddDevice(false); // Закрываем форму после сохранения
            // Обновляем список устройств
            fetchDevicesList();
        } catch (error) {
            console.error('Ошибка при сохранении устройства:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setUploadProgress(0);

        try {
            await uploadDeviceDataFromExcel(file, setUploadProgress);
            // После успешной загрузки данных обновляем список устройств
            fetchDevicesList();
            alert('Данные успешно загружены из Excel-файла.');
        } catch (error) {
            console.error('Ошибка при загрузке данных из Excel:', error);
            alert('Произошла ошибка при загрузке данных из Excel. Пожалуйста, проверьте файл и повторите попытку.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="device-form" onSubmit={handleSubmit}>
            <select value={selectedDeviceId} onChange={handleDeviceSelect}>
                <option value="">
                    Создать новое устройство
                </option>
                {devicesList.map((device) => (
                    <option key={device.id} value={device.id}>
                        {device.name}
                    </option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Название устройства"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
            />
            <textarea
                placeholder="Описание устройства"
                value={deviceDescription}
                onChange={(e) => setDeviceDescription(e.target.value)}
                required
            />
            <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                <option value="МФУ">МФУ</option>
                <option value="Принтер">Принтер</option>
            </select>
            <div>
                <label>Главное изображение:</label>
                {mainImage && typeof mainImage === 'string' ? (
                    <div className="main-image">
                        <img src={mainImage} alt="Главное изображение" />
                        <button type="button" onClick={() => setMainImage(null)}>Удалить</button>
                    </div>
                ) : (
                    <input type="file" onChange={handleMainImageChange} />
                )}
            </div>
            <div>
                <label>Дополнительные изображения:</label>
                <input type="file" multiple onChange={handleImageChange} />
                <span>Загружено {images.length} новых фото</span>
            </div>
            {existingImages.length > 0 && (
                <div>
                    <p>Существующие изображения:</p>
                    <div className="existing-images">
                        {existingImages.map((imgUrl, index) => (
                            <div key={index} className="existing-image-item">
                                <img src={imgUrl} alt={`Изображение ${index + 1}`} />
                                <button type="button" onClick={() => removeExistingImage(index)}>Удалить</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="form-buttons">
                <button type="button" className="close-btn" onClick={() => setIsAddDevice(false)}>
                    Закрыть
                </button>
                <button type="submit" className="submit-btn">
                    {deviceId ? 'Сохранить изменения' : 'Создать устройство'}
                </button>
                <label htmlFor="file-upload" className="upload-btn">
                    <img src={imgUploadIcon} alt="Upload" />
                    <span>Загрузить данные устройств</span>
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
            </div>
            {loading && <Loader />}
            {uploadProgress > 0 && <p>Загрузка: {uploadProgress}%</p>}
        </form>
    );
};

export default DeviceForm;